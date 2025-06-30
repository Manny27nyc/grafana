// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useURLSearchParams(): [URLSearchParams] {
  const { search } = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  return [queryParams];
}
