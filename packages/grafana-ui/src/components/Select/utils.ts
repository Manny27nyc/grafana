// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { SelectableValue } from '@grafana/data';
import { SelectableOptGroup } from './types';

/**
 * Normalize the value format to SelectableValue[] | []. Only used for single select
 */
export const cleanValue = (value: any, options: Array<SelectableValue | SelectableOptGroup | SelectableOptGroup[]>) => {
  if (Array.isArray(value)) {
    const filtered = value.filter(Boolean);
    return filtered?.length ? filtered : undefined;
  }
  if (typeof value === 'object') {
    // we want to allow null through into here, so the Select value can be unset
    return [value];
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const selectedValue = findSelectedValue(value, options);
    if (selectedValue) {
      return [selectedValue];
    }
  }
  return undefined;
};

/**
 * Find the label for a string|number value inside array of options or optgroups
 */
export const findSelectedValue = (
  value: string | number,
  options: Array<SelectableValue | SelectableOptGroup | SelectableOptGroup[]>
): SelectableValue | null => {
  for (const option of options) {
    if ('options' in option) {
      let found = findSelectedValue(value, option.options);
      if (found) {
        return found;
      }
    } else if ('value' in option && option.value === value) {
      return option;
    }
  }

  return null;
};
