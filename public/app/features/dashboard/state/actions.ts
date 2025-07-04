// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
// Services & Utils
import { getBackendSrv } from '@grafana/runtime';
import { createSuccessNotification } from 'app/core/copy/appNotification';
// Actions
import { loadPluginDashboards } from '../../plugins/admin/state/actions';
import { cleanUpDashboard, loadDashboardPermissions } from './reducers';
import { notifyApp } from 'app/core/actions';
import { updateTimeZoneForSession, updateWeekStartForSession } from 'app/features/profile/state/reducers';
// Types
import { DashboardAcl, DashboardAclUpdateDTO, NewDashboardAclItem, PermissionLevel, ThunkResult } from 'app/types';
import { cancelVariables } from '../../variables/state/actions';
import { getTimeSrv } from '../services/TimeSrv';
import { TimeZone } from '@grafana/data';

export function getDashboardPermissions(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const permissions = await getBackendSrv().get(`/api/dashboards/id/${id}/permissions`);
    dispatch(loadDashboardPermissions(permissions));
  };
}

function toUpdateItem(item: DashboardAcl): DashboardAclUpdateDTO {
  return {
    userId: item.userId,
    teamId: item.teamId,
    role: item.role,
    permission: item.permission,
  };
}

export function updateDashboardPermission(
  dashboardId: number,
  itemToUpdate: DashboardAcl,
  level: PermissionLevel
): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { dashboard } = getStore();
    const itemsToUpdate = [];

    for (const item of dashboard.permissions) {
      if (item.inherited) {
        continue;
      }

      const updated = toUpdateItem(item);

      // if this is the item we want to update, update it's permission
      if (itemToUpdate === item) {
        updated.permission = level;
      }

      itemsToUpdate.push(updated);
    }

    await getBackendSrv().post(`/api/dashboards/id/${dashboardId}/permissions`, { items: itemsToUpdate });
    await dispatch(getDashboardPermissions(dashboardId));
  };
}

export function removeDashboardPermission(dashboardId: number, itemToDelete: DashboardAcl): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const dashboard = getStore().dashboard;
    const itemsToUpdate = [];

    for (const item of dashboard.permissions) {
      if (item.inherited || item === itemToDelete) {
        continue;
      }
      itemsToUpdate.push(toUpdateItem(item));
    }

    await getBackendSrv().post(`/api/dashboards/id/${dashboardId}/permissions`, { items: itemsToUpdate });
    await dispatch(getDashboardPermissions(dashboardId));
  };
}

export function addDashboardPermission(dashboardId: number, newItem: NewDashboardAclItem): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { dashboard } = getStore();
    const itemsToUpdate = [];

    for (const item of dashboard.permissions) {
      if (item.inherited) {
        continue;
      }
      itemsToUpdate.push(toUpdateItem(item));
    }

    itemsToUpdate.push({
      userId: newItem.userId,
      teamId: newItem.teamId,
      role: newItem.role,
      permission: newItem.permission,
    });

    await getBackendSrv().post(`/api/dashboards/id/${dashboardId}/permissions`, { items: itemsToUpdate });
    await dispatch(getDashboardPermissions(dashboardId));
  };
}

export function importDashboard(data: any, dashboardTitle: string): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().post('/api/dashboards/import', data);
    dispatch(notifyApp(createSuccessNotification('Dashboard Imported', dashboardTitle)));
    dispatch(loadPluginDashboards());
  };
}

export function removeDashboard(uri: string): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/dashboards/${uri}`);
    dispatch(loadPluginDashboards());
  };
}

export const cleanUpDashboardAndVariables = (): ThunkResult<void> => (dispatch, getStore) => {
  const store = getStore();
  const dashboard = store.dashboard.getModel();

  if (dashboard) {
    dashboard.destroy();
  }

  getTimeSrv().stopAutoRefresh();

  dispatch(cleanUpDashboard());
  dispatch(cancelVariables());
};

export const updateTimeZoneDashboard = (timeZone: TimeZone): ThunkResult<void> => (dispatch) => {
  dispatch(updateTimeZoneForSession(timeZone));
  getTimeSrv().refreshDashboard();
};

export const updateWeekStartDashboard = (weekStart: string): ThunkResult<void> => (dispatch) => {
  dispatch(updateWeekStartForSession(weekStart));
  getTimeSrv().refreshDashboard();
};
