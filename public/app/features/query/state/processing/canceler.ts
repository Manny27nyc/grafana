// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { BackendSrv } from 'app/core/services/backend_srv';
import { MonoTypeOperatorFunction } from 'rxjs';
import { finalize } from 'rxjs/operators';

export function cancelNetworkRequestsOnUnsubscribe<T>(
  backendSrv: BackendSrv,
  requestId: string | undefined
): MonoTypeOperatorFunction<T> {
  return finalize(() => {
    if (requestId) {
      backendSrv.resolveCancelerIfExists(requestId);
    }
  });
}
