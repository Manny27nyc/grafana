// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { isString } from 'lodash';
import {
  DataSourcePluginOptionsEditorProps,
  SelectableValue,
  KeyValue,
  DataSourceSettings,
  DataSourceInstanceSettings,
  DataSourceRef,
} from '../types';

/**
 * Convert instance settings to a reference
 *
 * @public
 */
export function getDataSourceRef(ds: DataSourceInstanceSettings): DataSourceRef {
  return { uid: ds.uid, type: ds.type };
}

/**
 * Returns true if the argument is a DataSourceRef
 *
 * @public
 */
export function isDataSourceRef(ref: DataSourceRef | string | null): ref is DataSourceRef {
  return typeof ref === 'object' && (typeof ref?.uid === 'string' || typeof ref?.uid === 'undefined');
}

/**
 * Get the UID from a string of reference
 *
 * @public
 */
export function getDataSourceUID(ref: DataSourceRef | string | null): string | undefined {
  if (isDataSourceRef(ref)) {
    return ref.uid;
  }
  if (isString(ref)) {
    return ref;
  }
  return undefined;
}

export const onUpdateDatasourceOption = (props: DataSourcePluginOptionsEditorProps, key: keyof DataSourceSettings) => (
  event: React.SyntheticEvent<HTMLInputElement | HTMLSelectElement>
) => {
  updateDatasourcePluginOption(props, key, event.currentTarget.value);
};

export const onUpdateDatasourceJsonDataOption = <J, S, K extends keyof J>(
  props: DataSourcePluginOptionsEditorProps<J, S>,
  key: K
) => (event: React.SyntheticEvent<HTMLInputElement | HTMLSelectElement>) => {
  updateDatasourcePluginJsonDataOption(props, key, event.currentTarget.value);
};

export const onUpdateDatasourceSecureJsonDataOption = <J, S extends {} = KeyValue>(
  props: DataSourcePluginOptionsEditorProps<J, S>,
  key: string
) => (event: React.SyntheticEvent<HTMLInputElement | HTMLSelectElement>) => {
  updateDatasourcePluginSecureJsonDataOption(props, key, event.currentTarget.value);
};

export const onUpdateDatasourceJsonDataOptionSelect = <J, S, K extends keyof J>(
  props: DataSourcePluginOptionsEditorProps<J, S>,
  key: K
) => (selected: SelectableValue) => {
  updateDatasourcePluginJsonDataOption(props, key, selected.value);
};

export const onUpdateDatasourceJsonDataOptionChecked = <J, S, K extends keyof J>(
  props: DataSourcePluginOptionsEditorProps<J, S>,
  key: K
) => (event: React.SyntheticEvent<HTMLInputElement>) => {
  updateDatasourcePluginJsonDataOption(props, key, event.currentTarget.checked);
};

export const onUpdateDatasourceSecureJsonDataOptionSelect = <J, S extends {} = KeyValue>(
  props: DataSourcePluginOptionsEditorProps<J, S>,
  key: string
) => (selected: SelectableValue) => {
  updateDatasourcePluginSecureJsonDataOption(props, key, selected.value);
};

export const onUpdateDatasourceResetOption = (props: DataSourcePluginOptionsEditorProps, key: string) => (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => {
  updateDatasourcePluginResetOption(props, key);
};

export function updateDatasourcePluginOption<J, S extends {} = KeyValue>(
  props: DataSourcePluginOptionsEditorProps<J, S>,
  key: keyof DataSourceSettings,
  val: any
) {
  const config = props.options;

  props.onOptionsChange({
    ...config,
    [key]: val,
  });
}

export const updateDatasourcePluginJsonDataOption = <J, S, K extends keyof J>(
  props: DataSourcePluginOptionsEditorProps<J, S>,
  key: K,
  val: any
) => {
  const config = props.options;

  props.onOptionsChange({
    ...config,
    jsonData: {
      ...config.jsonData,
      [key]: val,
    },
  });
};

export const updateDatasourcePluginSecureJsonDataOption = <J, S extends {} = KeyValue>(
  props: DataSourcePluginOptionsEditorProps<J, S>,
  key: string,
  val: any
) => {
  const config = props.options;

  props.onOptionsChange({
    ...config,
    secureJsonData: {
      ...(config.secureJsonData ? config.secureJsonData : ({} as S)),
      [key]: val,
    },
  });
};

export const updateDatasourcePluginResetOption = <J, S extends {} = KeyValue>(
  props: DataSourcePluginOptionsEditorProps<J, S>,
  key: string
) => {
  const config = props.options;
  props.onOptionsChange({
    ...config,
    secureJsonData: {
      ...(config.secureJsonData ? config.secureJsonData : ({} as S)),
      [key]: '',
    },
    secureJsonFields: {
      ...config.secureJsonFields,
      [key]: false,
    },
  });
};
