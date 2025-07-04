// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { SelectableValue } from '@grafana/data';
import React from 'react';
import { ActionMeta as SelectActionMeta, GroupBase, OptionsOrGroups } from 'react-select';

export type SelectValue<T> = T | SelectableValue<T> | T[] | Array<SelectableValue<T>>;
export type ActionMeta = SelectActionMeta<{}>;
export type InputActionMeta = {
  action: 'set-value' | 'input-change' | 'input-blur' | 'menu-close';
};

export interface SelectCommonProps<T> {
  /** Aria label applied to the input field */
  ['aria-label']?: string;
  allowCreateWhileLoading?: boolean;
  allowCustomValue?: boolean;
  /** Focus is set to the Select when rendered*/
  autoFocus?: boolean;
  backspaceRemovesValue?: boolean;
  className?: string;
  closeMenuOnSelect?: boolean;
  /** Used for custom components. For more information, see `react-select` */
  components?: any;
  defaultValue?: any;
  disabled?: boolean;
  filterOption?: (option: SelectableValue<T>, searchQuery: string) => boolean;
  /** Function for formatting the text that is displayed when creating a new value*/
  formatCreateLabel?: (input: string) => string;
  getOptionLabel?: (item: SelectableValue<T>) => React.ReactNode;
  getOptionValue?: (item: SelectableValue<T>) => string;
  inputValue?: string;
  invalid?: boolean;
  isClearable?: boolean;
  /** The id to set on the SelectContainer component. To set the id for a label (with htmlFor), @see inputId instead */
  id?: string;
  isLoading?: boolean;
  isMulti?: boolean;
  /** The id of the search input. Use this to set a matching label with htmlFor */
  inputId?: string;
  isOpen?: boolean;
  /** Disables the possibility to type into the input*/
  isSearchable?: boolean;
  showAllSelectedWhenOpen?: boolean;
  maxMenuHeight?: number;
  minMenuHeight?: number;
  maxVisibleValues?: number;
  menuPlacement?: 'auto' | 'bottom' | 'top';
  menuPosition?: 'fixed' | 'absolute';
  /**
   * @deprecated
   * Setting to true will portal the menu to `document.body`.
   * This property will soon be removed and portalling will be the default behavior.
   */
  menuShouldPortal?: boolean;
  /** The message to display when no options could be found */
  noOptionsMessage?: string;
  onBlur?: () => void;
  onChange: (value: SelectableValue<T>, actionMeta: ActionMeta) => {} | void;
  onCloseMenu?: () => void;
  /** allowCustomValue must be enabled. Function decides what to do with that custom value. */
  onCreateOption?: (value: string) => void;
  onInputChange?: (value: string, actionMeta: InputActionMeta) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onOpenMenu?: () => void;
  openMenuOnFocus?: boolean;
  options?: Array<SelectableValue<T>>;
  placeholder?: string;
  /** item to be rendered in front of the input */
  prefix?: JSX.Element | string | null;
  /** Use a custom element to control Select. A proper ref to the renderControl is needed if 'portal' isn't set to null*/
  renderControl?: ControlComponent<T>;
  tabSelectsValue?: boolean;
  value?: SelectValue<T> | null;
  /** Sets the width to a multiple of 8px. Should only be used with inline forms. Setting width of the container is preferred in other cases.*/
  width?: number | 'auto';
  isOptionDisabled?: () => boolean;
  /** allowCustomValue must be enabled. Determines whether the "create new" option should be displayed based on the current input value, select value and options array. */
  isValidNewOption?: (
    inputValue: string,
    value: SelectableValue<T> | null,
    options: OptionsOrGroups<unknown, GroupBase<unknown>>
  ) => boolean;
}

export interface SelectAsyncProps<T> {
  /** When specified as boolean the loadOptions will execute when component is mounted */
  defaultOptions?: boolean | Array<SelectableValue<T>>;
  /** Asynchronously load select options */
  loadOptions?: (query: string) => Promise<Array<SelectableValue<T>>>;
  /** If cacheOptions is true, then the loaded data will be cached. The cache will remain until cacheOptions changes value. */
  cacheOptions?: boolean;
  /** Message to display when options are loading */
  loadingMessage?: string;
}

export interface MultiSelectCommonProps<T> extends Omit<SelectCommonProps<T>, 'onChange' | 'isMulti' | 'value'> {
  value?: Array<SelectableValue<T>> | T[];
  onChange: (item: Array<SelectableValue<T>>) => {} | void;
}

export interface SelectBaseProps<T> extends SelectCommonProps<T>, SelectAsyncProps<T> {
  invalid?: boolean;
}

export interface CustomControlProps<T> {
  ref: React.Ref<any>;
  isOpen: boolean;
  /** Currently selected value */
  value?: SelectableValue<T>;
  /** onClick will be automatically passed to custom control allowing menu toggle */
  onClick: () => void;
  /** onBlur will be automatically passed to custom control closing the menu on element blur */
  onBlur: () => void;
  disabled: boolean;
  invalid: boolean;
}

export type ControlComponent<T> = React.ComponentType<CustomControlProps<T>>;

export interface SelectableOptGroup<T = any> {
  label: string;
  options: Array<SelectableValue<T>>;
  [key: string]: any;
}

export type SelectOptions<T = any> =
  | SelectableValue<T>
  | Array<SelectableValue<T> | SelectableOptGroup<T> | Array<SelectableOptGroup<T>>>;
