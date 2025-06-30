// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import config from 'app/core/config';

export function getThemeColor(dark: string, light: string): string {
  return config.bootData.user.lightTheme ? light : dark;
}
