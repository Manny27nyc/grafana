// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { ThemeColors } from './createColors';

/** @beta */
export interface ThemeShadows {
  z1: string;
  z2: string;
  z3: string;
}

/** @alpha */
export function createShadows(colors: ThemeColors): ThemeShadows {
  if (colors.mode === 'dark') {
    return {
      z1: '0px 1px 2px rgba(24, 26, 27, 0.75)',
      z2: '0px 4px 8px rgba(24, 26, 27, 0.75)',
      z3: '0px 10px 20px rgb(20,20,20)',
    };
  }

  return {
    z1: '0px 1px 2px rgba(24, 26, 27, 0.2)',
    z2: '0px 4px 8px rgba(24, 26, 27, 0.2)',
    z3: '0px 13px 20px 1px rgba(24, 26, 27, 0.18)',
  };
}
