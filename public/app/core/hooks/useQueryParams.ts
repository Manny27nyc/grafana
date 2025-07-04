// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { UrlQueryMap } from '@grafana/data';
import { locationSearchToObject, locationService } from '@grafana/runtime';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useQueryParams(): [UrlQueryMap, (values: UrlQueryMap, replace?: boolean) => void] {
  const { search } = useLocation();
  const queryParams = useMemo(() => locationSearchToObject(search || ''), [search]);
  const update = useCallback((values: UrlQueryMap, replace?: boolean) => locationService.partial(values, replace), []);
  return [queryParams, update];
}
