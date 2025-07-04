// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { FetchResponse } from '@grafana/runtime';

export function createFetchResponse<T>(data: T): FetchResponse<T> {
  return {
    data,
    status: 200,
    url: 'http://localhost:3000/api/tsdb/query',
    config: { url: 'http://localhost:3000/api/tsdb/query' },
    type: 'basic',
    statusText: 'Ok',
    redirected: false,
    headers: ({} as unknown) as Headers,
    ok: true,
  };
}
