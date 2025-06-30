// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { DataSourcePlugin } from '@grafana/data';
import CheatSheet from './CheatSheet';
import { ConfigEditor } from './configuration/ConfigEditor';
import { TempoDatasource } from './datasource';
import { TempoQueryField } from './QueryEditor/QueryField';

export const plugin = new DataSourcePlugin(TempoDatasource)
  .setQueryEditor(TempoQueryField)
  .setConfigEditor(ConfigEditor)
  .setQueryEditorHelp(CheatSheet);
