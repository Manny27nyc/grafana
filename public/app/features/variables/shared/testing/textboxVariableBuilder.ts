// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { TextBoxVariableModel } from 'app/features/variables/types';
import { OptionsVariableBuilder } from './optionsVariableBuilder';

export class TextBoxVariableBuilder<T extends TextBoxVariableModel> extends OptionsVariableBuilder<T> {
  withOriginalQuery(original: string) {
    this.variable.originalQuery = original;
    return this;
  }
}
