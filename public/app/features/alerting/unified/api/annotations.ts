// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { getBackendSrv } from '@grafana/runtime';
import { StateHistoryItem } from 'app/types/unified-alerting';

export function fetchAnnotations(alertId: string): Promise<StateHistoryItem[]> {
  return getBackendSrv().get('/api/annotations', {
    alertId,
  });
}
