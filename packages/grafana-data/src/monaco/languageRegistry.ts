// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { Registry, RegistryItem } from '../utils/Registry';

/**
 * @alpha
 */
export interface MonacoLanguageRegistryItem extends RegistryItem {
  init: () => Promise<void>;
}

/**
 * @alpha
 */
export const monacoLanguageRegistry = new Registry<MonacoLanguageRegistryItem>();
