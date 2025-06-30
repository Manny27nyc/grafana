// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export type VariableType = 'query' | 'adhoc' | 'constant' | 'datasource' | 'interval' | 'textbox' | 'custom' | 'system';

export interface VariableModel {
  type: VariableType;
  name: string;
  label: string | null;
}
