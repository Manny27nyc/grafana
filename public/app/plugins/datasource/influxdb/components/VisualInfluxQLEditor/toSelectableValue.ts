// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { SelectableValue } from '@grafana/data';

export function toSelectableValue<T extends string>(t: T): SelectableValue<T> {
  return { label: t, value: t };
}
