// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { ObservableMatchers } from './types';
import { toEmitValues } from './toEmitValues';
import { toEmitValuesWith } from './toEmitValuesWith';
import { Observable } from 'rxjs';

export const matchers: ObservableMatchers<void, Observable<any>> = {
  toEmitValues,
  toEmitValuesWith,
};
