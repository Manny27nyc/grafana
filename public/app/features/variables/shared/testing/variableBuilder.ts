// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { cloneDeep } from 'lodash';
import { VariableModel } from 'app/features/variables/types';

export class VariableBuilder<T extends VariableModel> {
  protected variable: T;

  constructor(initialState: T) {
    const { id, index, global, ...rest } = initialState;
    this.variable = cloneDeep({ ...rest, name: rest.type }) as T;
  }

  withName(name: string) {
    this.variable.name = name;
    return this;
  }

  withId(id: string) {
    this.variable.id = id;
    return this;
  }

  build(): T {
    return this.variable;
  }
}
