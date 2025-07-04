// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { deprecationWarning } from '@grafana/data';
import { ColorPickerProps } from './ColorPickerPopover';

export const warnAboutColorPickerPropsDeprecation = (componentName: string, props: ColorPickerProps) => {
  const { onColorChange } = props;
  if (onColorChange) {
    deprecationWarning(componentName, 'onColorChange', 'onChange');
  }
};
