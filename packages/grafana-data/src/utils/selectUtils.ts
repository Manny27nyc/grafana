// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { SelectableValue } from '../types';

export const toOption = (value: string): SelectableValue<string> => ({ label: value, value });
