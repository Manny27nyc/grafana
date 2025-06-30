// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { flow, camelCase, upperFirst } from 'lodash';

export const pascalCase = flow([camelCase, upperFirst]);
