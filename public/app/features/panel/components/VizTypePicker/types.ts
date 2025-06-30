// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { FieldConfigSource } from '@grafana/data';

export interface VizTypeChangeDetails {
  pluginId: string;
  options?: any;
  fieldConfig?: FieldConfigSource;
  withModKey?: boolean;
}
