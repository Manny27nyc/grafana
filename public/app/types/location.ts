// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { UrlQueryMap } from '@grafana/data';

export interface LocationState {
  url: string;
  path: string;
  query: UrlQueryMap;
  routeParams: UrlQueryMap;
  replace: boolean;
  lastUpdated: number;
}
