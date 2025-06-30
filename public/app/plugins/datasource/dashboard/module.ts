// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { DashboardDatasource } from './datasource';
import { DataSourcePlugin } from '@grafana/data';

export const plugin = new DataSourcePlugin(DashboardDatasource);
