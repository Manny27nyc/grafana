// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { attachDebugger, createLogger } from '@grafana/ui';

/** @internal */
export const echoLogger = createLogger('EchoSrv');
export const echoLog = echoLogger.logger;

attachDebugger('echo', undefined, echoLogger);
