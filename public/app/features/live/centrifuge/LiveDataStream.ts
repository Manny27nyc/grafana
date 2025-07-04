// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import type { LiveDataStreamOptions, StreamingFrameOptions } from '@grafana/runtime/src/services/live';
import { toDataQueryError } from '@grafana/runtime/src/utils/toDataQueryError';
import {
  DataFrameJSON,
  DataQueryError,
  Field,
  isLiveChannelMessageEvent,
  isLiveChannelStatusEvent,
  LiveChannelConnectionState,
  LiveChannelEvent,
  LiveChannelId,
  LoadingState,
} from '@grafana/data';
import { map, Observable, ReplaySubject, Subject, Subscriber, Subscription } from 'rxjs';
import { DataStreamSubscriptionKey, StreamingDataQueryResponse } from './service';
import { getStreamingFrameOptions, StreamingDataFrame } from '../data/StreamingDataFrame';
import { StreamingResponseDataType } from '../data/utils';

const bufferIfNot = (canEmitObservable: Observable<boolean>) => <T>(source: Observable<T>): Observable<T[]> => {
  return new Observable((subscriber: Subscriber<T[]>) => {
    let buffer: T[] = [];
    let canEmit = true;

    const emitBuffer = () => {
      subscriber.next(buffer);
      buffer = [];
    };

    const canEmitSub = canEmitObservable.subscribe({
      next: (val) => {
        canEmit = val;

        if (canEmit && buffer.length) {
          emitBuffer();
        }
      },
    });

    const sourceSub = source.subscribe({
      next(value) {
        if (canEmit) {
          if (!buffer.length) {
            subscriber.next([value]);
          } else {
            emitBuffer();
          }
        } else {
          buffer.push(value);
        }
      },
      error(error) {
        subscriber.error(error);
      },
      complete() {
        subscriber.complete();
      },
    });

    return () => {
      sourceSub.unsubscribe();
      canEmitSub.unsubscribe();
    };
  });
};

export type DataStreamHandlerDeps<T> = {
  channelId: LiveChannelId;
  liveEventsObservable: Observable<LiveChannelEvent<T>>;
  onShutdown: () => void;
  subscriberReadiness: Observable<boolean>;
  defaultStreamingFrameOptions: Readonly<StreamingFrameOptions>;
  shutdownDelayInMs: number;
};

enum InternalStreamMessageType {
  Error,
  NewValuesSameSchema,
  ChangedSchema,
}

type InternalStreamMessageTypeToData = {
  [InternalStreamMessageType.Error]: {
    error: DataQueryError;
  };
  [InternalStreamMessageType.ChangedSchema]: {};
  [InternalStreamMessageType.NewValuesSameSchema]: {
    values: unknown[][];
  };
};

type InternalStreamMessage<T = InternalStreamMessageType> = T extends InternalStreamMessageType
  ? {
      type: T;
    } & InternalStreamMessageTypeToData[T]
  : never;

const reduceNewValuesSameSchemaMessages = (
  packets: Array<InternalStreamMessage<InternalStreamMessageType.NewValuesSameSchema>>
) => ({
  values: packets.reduce((acc, { values }) => {
    for (let i = 0; i < values.length; i++) {
      if (!acc[i]) {
        acc[i] = [];
      }
      for (let j = 0; j < values[i].length; j++) {
        acc[i].push(values[i][j]);
      }
    }
    return acc;
  }, [] as unknown[][]),
  type: InternalStreamMessageType.NewValuesSameSchema,
});

const filterMessages = <T extends InternalStreamMessageType>(
  packets: InternalStreamMessage[],
  type: T
): Array<InternalStreamMessage<T>> => packets.filter((p) => p.type === type) as Array<InternalStreamMessage<T>>;

export class LiveDataStream<T = unknown> {
  private frameBuffer: StreamingDataFrame;
  private liveEventsSubscription: Subscription;
  private stream: Subject<InternalStreamMessage> = new ReplaySubject(1);
  private shutdownTimeoutId: ReturnType<typeof setTimeout> | undefined;

  constructor(private deps: DataStreamHandlerDeps<T>) {
    this.frameBuffer = StreamingDataFrame.empty(deps.defaultStreamingFrameOptions);
    this.liveEventsSubscription = deps.liveEventsObservable.subscribe({
      error: this.onError,
      complete: this.onComplete,
      next: this.onNext,
    });
  }

  private shutdown = () => {
    this.stream.complete();
    this.liveEventsSubscription.unsubscribe();
    this.deps.onShutdown();
  };

  private shutdownIfNoSubscribers = () => {
    if (!this.stream.observed) {
      this.shutdown();
    }
  };

  private onError = (err: any) => {
    console.log('LiveQuery [error]', { err }, this.deps.channelId);
    this.stream.next({
      type: InternalStreamMessageType.Error,
      error: toDataQueryError(err),
    });
    this.shutdown();
  };

  private onComplete = () => {
    console.log('LiveQuery [complete]', this.deps.channelId);
    this.shutdown();
  };

  private onNext = (evt: LiveChannelEvent) => {
    if (isLiveChannelMessageEvent(evt)) {
      this.process(evt.message);
      return;
    }

    const liveChannelStatusEvent = isLiveChannelStatusEvent(evt);
    if (liveChannelStatusEvent && evt.error) {
      this.stream.next({
        type: InternalStreamMessageType.Error,
        error: {
          ...toDataQueryError(evt.error),
          message: `Streaming channel error: ${evt.error.message}`,
        },
      });
      return;
    }

    if (
      liveChannelStatusEvent &&
      (evt.state === LiveChannelConnectionState.Connected || evt.state === LiveChannelConnectionState.Pending) &&
      evt.message
    ) {
      this.process(evt.message);
    }
  };

  private process = (msg: DataFrameJSON) => {
    const packetInfo = this.frameBuffer.push(msg);

    if (packetInfo.schemaChanged) {
      this.stream.next({
        type: InternalStreamMessageType.ChangedSchema,
      });
    } else {
      this.stream.next({
        type: InternalStreamMessageType.NewValuesSameSchema,
        values: this.frameBuffer.getValuesFromLastPacket(),
      });
    }
  };

  private resizeBuffer = (bufferOptions: StreamingFrameOptions) => {
    if (bufferOptions && this.frameBuffer.needsResizing(bufferOptions)) {
      this.frameBuffer.resize(bufferOptions);
    }
  };

  private prepareInternalStreamForNewSubscription = (options: LiveDataStreamOptions): void => {
    if (!this.frameBuffer.hasAtLeastOnePacket() && options.frame) {
      // will skip initial frames from subsequent subscribers
      this.process(options.frame);
    }
  };

  private clearShutdownTimeout = () => {
    if (this.shutdownTimeoutId) {
      clearTimeout(this.shutdownTimeoutId);
      this.shutdownTimeoutId = undefined;
    }
  };

  get = (options: LiveDataStreamOptions, subKey: DataStreamSubscriptionKey): Observable<StreamingDataQueryResponse> => {
    this.clearShutdownTimeout();
    const buffer = getStreamingFrameOptions(options.buffer);

    this.resizeBuffer(buffer);
    this.prepareInternalStreamForNewSubscription(options);

    const fieldsNamesFilter = options.filter?.fields;
    const dataNeedsFiltering = fieldsNamesFilter?.length;
    const fieldFilterPredicate = dataNeedsFiltering ? ({ name }: Field) => fieldsNamesFilter.includes(name) : undefined;
    let matchingFieldIndexes: number[] | undefined = undefined;

    const getFullFrameResponseData = (error?: DataQueryError): StreamingDataQueryResponse => {
      matchingFieldIndexes = fieldFilterPredicate
        ? this.frameBuffer.getMatchingFieldIndexes(fieldFilterPredicate)
        : undefined;

      return {
        key: subKey,
        state: error ? LoadingState.Error : LoadingState.Streaming,
        data: [
          {
            type: StreamingResponseDataType.FullFrame,
            frame: this.frameBuffer.serialize(fieldFilterPredicate, buffer),
          },
        ],
        error,
      };
    };

    const getNewValuesSameSchemaResponseData = (values: unknown[][]): StreamingDataQueryResponse => {
      const filteredValues = matchingFieldIndexes
        ? values.filter((v, i) => (matchingFieldIndexes as number[]).includes(i))
        : values;

      return {
        key: subKey,
        state: LoadingState.Streaming,
        data: [
          {
            type: StreamingResponseDataType.NewValuesSameSchema,
            values: filteredValues,
          },
        ],
      };
    };

    let shouldSendFullFrame = true;
    const transformedInternalStream = this.stream.pipe(
      bufferIfNot(this.deps.subscriberReadiness),
      map((messages, i) => {
        const errors = filterMessages(messages, InternalStreamMessageType.Error);
        const lastError = errors.length ? errors[errors.length - 1].error : undefined;

        if (shouldSendFullFrame) {
          shouldSendFullFrame = false;
          return getFullFrameResponseData(lastError);
        }

        if (errors.length) {
          // send the latest frame with the last error, discard everything else
          return getFullFrameResponseData(lastError);
        }

        const schemaChanged = messages.some((n) => n.type === InternalStreamMessageType.ChangedSchema);
        if (schemaChanged) {
          // send the latest frame, discard intermediate appends
          return getFullFrameResponseData();
        }

        const newValueSameSchemaMessages = filterMessages(messages, InternalStreamMessageType.NewValuesSameSchema);
        if (newValueSameSchemaMessages.length !== messages.length) {
          console.warn(`unsupported message type ${messages.map(({ type }) => type)}`);
        }

        return getNewValuesSameSchemaResponseData(reduceNewValuesSameSchemaMessages(newValueSameSchemaMessages).values);
      })
    );

    return new Observable<StreamingDataQueryResponse>((subscriber) => {
      const sub = transformedInternalStream.subscribe({
        next: (n) => {
          subscriber.next(n);
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          subscriber.complete();
        },
      });

      return () => {
        // TODO: potentially resize (downsize) the buffer on unsubscribe
        sub.unsubscribe();
        if (!this.stream.observed) {
          this.clearShutdownTimeout();
          this.shutdownTimeoutId = setTimeout(this.shutdownIfNoSubscribers, this.deps.shutdownDelayInMs);
        }
      };
    });
  };
}
