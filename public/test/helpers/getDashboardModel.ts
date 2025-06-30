// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { DashboardModel } from '../../app/features/dashboard/state';

export const getDashboardModel = (json: any, meta: any = {}) => {
  const getVariablesFromState = () => json.templating.list;
  return new DashboardModel(json, meta, getVariablesFromState);
};
