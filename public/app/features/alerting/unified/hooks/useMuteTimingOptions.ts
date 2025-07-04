// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { SelectableValue } from '@grafana/data';
import { AlertmanagerConfig } from 'app/plugins/datasource/alertmanager/types';
import { useMemo } from 'react';
import { timeIntervalToString } from '../utils/alertmanager';
import { initialAsyncRequestState } from '../utils/redux';
import { useAlertManagerSourceName } from './useAlertManagerSourceName';
import { useUnifiedAlertingSelector } from './useUnifiedAlertingSelector';

export function useMuteTimingOptions(): Array<SelectableValue<string>> {
  const [alertManagerSourceName] = useAlertManagerSourceName();
  const amConfigs = useUnifiedAlertingSelector((state) => state.amConfigs);

  return useMemo(() => {
    const { result } = (alertManagerSourceName && amConfigs[alertManagerSourceName]) || initialAsyncRequestState;
    const config: AlertmanagerConfig = result?.alertmanager_config ?? {};

    const muteTimingsOptions: Array<SelectableValue<string>> =
      config?.mute_time_intervals?.map((value) => ({
        value: value.name,
        label: value.name,
        description: value.time_intervals.map((interval) => timeIntervalToString(interval)).join(', AND '),
      })) ?? [];

    return muteTimingsOptions;
  }, [alertManagerSourceName, amConfigs]);
}
