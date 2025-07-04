// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { lastValueFrom, Observable, of } from 'rxjs';
import { DataQuery, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings } from '@grafana/data';
import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';
import { AlertManagerDataSourceJsonData, AlertManagerImplementation } from './types';

export type AlertManagerQuery = {
  query: string;
} & DataQuery;

export class AlertManagerDatasource extends DataSourceApi<AlertManagerQuery, AlertManagerDataSourceJsonData> {
  constructor(public instanceSettings: DataSourceInstanceSettings<AlertManagerDataSourceJsonData>) {
    super(instanceSettings);
  }

  // `query()` has to be implemented but we actually don't use it, just need this
  // data source to proxy requests.
  // @ts-ignore
  query(): Observable<DataQueryResponse> {
    return of({
      data: [],
    });
  }

  _request(url: string) {
    const options: BackendSrvRequest = {
      headers: {},
      method: 'GET',
      url: this.instanceSettings.url + url,
    };

    if (this.instanceSettings.basicAuth || this.instanceSettings.withCredentials) {
      this.instanceSettings.withCredentials = true;
    }

    if (this.instanceSettings.basicAuth) {
      options.headers!.Authorization = this.instanceSettings.basicAuth;
    }

    return lastValueFrom(getBackendSrv().fetch<any>(options));
  }

  async testDatasource() {
    let alertmanagerResponse;

    if (this.instanceSettings.jsonData.implementation === AlertManagerImplementation.prometheus) {
      try {
        alertmanagerResponse = await this._request('/alertmanager/api/v2/status');
        if (alertmanagerResponse && alertmanagerResponse?.status === 200) {
          return {
            status: 'error',
            message:
              'It looks like you have chosen Prometheus implementation, but detected a Cortex endpoint. Please update implementation selection and try again.',
          };
        }
      } catch (e) {}
      try {
        alertmanagerResponse = await this._request('/api/v2/status');
      } catch (e) {}
    } else {
      try {
        alertmanagerResponse = await this._request('/api/v2/status');
        if (alertmanagerResponse && alertmanagerResponse?.status === 200) {
          return {
            status: 'error',
            message:
              'It looks like you have chosen Cortex implementation, but detected a Prometheus endpoint. Please update implementation selection and try again.',
          };
        }
      } catch (e) {}
      try {
        alertmanagerResponse = await this._request('/alertmanager/api/v2/status');
      } catch (e) {}
    }

    return alertmanagerResponse?.status === 200
      ? {
          status: 'success',
          message: 'Health check passed.',
        }
      : {
          status: 'error',
          message: 'Health check failed.',
        };
  }
}
