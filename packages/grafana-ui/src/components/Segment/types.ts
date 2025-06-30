// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { ReactElement } from 'react';

export interface SegmentProps<T> {
  Component?: ReactElement;
  className?: string;
  allowCustomValue?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  autofocus?: boolean;
  allowEmptyValue?: boolean;
  inputPlaceholder?: string;
}
