// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { CentrifugeService, CentrifugeSrvDeps } from './service';
import * as comlink from 'comlink';
import './transferHandlers';
import { remoteObservableAsObservable } from './remoteObservable';
import { LiveChannelAddress } from '@grafana/data';
import { LiveDataStreamOptions, LiveQueryDataOptions } from '@grafana/runtime';

let centrifuge: CentrifugeService;

const initialize = (
  deps: CentrifugeSrvDeps,
  remoteDataStreamSubscriberReadiness: comlink.RemoteObject<
    CentrifugeSrvDeps['dataStreamSubscriberReadiness'] & comlink.ProxyMarked
  >
) => {
  centrifuge = new CentrifugeService({
    ...deps,
    dataStreamSubscriberReadiness: remoteObservableAsObservable(remoteDataStreamSubscriberReadiness),
  });
};

const getConnectionState = () => {
  return comlink.proxy(centrifuge.getConnectionState());
};

const getDataStream = (options: LiveDataStreamOptions) => {
  return comlink.proxy(centrifuge.getDataStream(options));
};

const getQueryData = async (options: LiveQueryDataOptions) => {
  return await centrifuge.getQueryData(options);
};

const getStream = (address: LiveChannelAddress) => {
  return comlink.proxy(centrifuge.getStream(address));
};

const getPresence = async (address: LiveChannelAddress) => {
  return await centrifuge.getPresence(address);
};

const workObj = {
  initialize,
  getConnectionState,
  getDataStream,
  getStream,
  getQueryData,
  getPresence,
};

export type RemoteCentrifugeService = typeof workObj;

comlink.expose(workObj);

export default class {
  constructor() {}
}
