// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { AppEvents } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { appEvents } from 'app/core/core';
import { loadAlertRules, loadedAlertRules, notificationChannelLoaded, setNotificationChannels } from './reducers';
import { AlertRuleDTO, NotifierDTO, ThunkResult } from 'app/types';

export function getAlertRulesAsync(options: { state: string }): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(loadAlertRules());
    const rules: AlertRuleDTO[] = await getBackendSrv().get('/api/alerts', options);
    dispatch(loadedAlertRules(rules));
  };
}

export function togglePauseAlertRule(id: number, options: { paused: boolean }): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().post(`/api/alerts/${id}/pause`, options);
    const stateFilter = locationService.getSearchObject().state || 'all';
    dispatch(getAlertRulesAsync({ state: stateFilter.toString() }));
  };
}

export function createNotificationChannel(data: any): ThunkResult<void> {
  return async (dispatch) => {
    try {
      await getBackendSrv().post(`/api/alert-notifications`, data);
      appEvents.emit(AppEvents.alertSuccess, ['Notification created']);
      locationService.push('/alerting/notifications');
    } catch (error) {
      appEvents.emit(AppEvents.alertError, [error.data.error]);
    }
  };
}

export function updateNotificationChannel(data: any): ThunkResult<void> {
  return async (dispatch) => {
    try {
      await getBackendSrv().put(`/api/alert-notifications/${data.id}`, data);
      appEvents.emit(AppEvents.alertSuccess, ['Notification updated']);
    } catch (error) {
      appEvents.emit(AppEvents.alertError, [error.data.error]);
    }
  };
}

export function testNotificationChannel(data: any): ThunkResult<void> {
  return async (dispatch, getState) => {
    const channel = getState().notificationChannel.notificationChannel;
    await getBackendSrv().post('/api/alert-notifications/test', { id: channel.id, ...data });
  };
}

export function loadNotificationTypes(): ThunkResult<void> {
  return async (dispatch) => {
    const alertNotifiers: NotifierDTO[] = await getBackendSrv().get(`/api/alert-notifiers`);

    const notificationTypes = alertNotifiers.sort((o1, o2) => {
      if (o1.name > o2.name) {
        return 1;
      }
      return -1;
    });

    dispatch(setNotificationChannels(notificationTypes));
  };
}

export function loadNotificationChannel(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await dispatch(loadNotificationTypes());
    const notificationChannel = await getBackendSrv().get(`/api/alert-notifications/${id}`);
    dispatch(notificationChannelLoaded(notificationChannel));
  };
}
