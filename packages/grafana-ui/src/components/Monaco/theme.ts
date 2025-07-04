// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { GrafanaTheme2 } from '@grafana/data';
import { Monaco, monacoTypes } from './types';

function getColors(theme?: GrafanaTheme2): monacoTypes.editor.IColors {
  if (theme === undefined) {
    return {};
  } else {
    return {
      'editor.background': theme.components.input.background,
      'minimap.background': theme.colors.background.secondary,
    };
  }
}

// we support calling this without a theme, it will make sure the themes
// are registered in monaco, even if the colors are not perfect.
export default function defineThemes(monaco: Monaco, theme?: GrafanaTheme2) {
  // color tokens are defined here https://github.com/microsoft/vscode/blob/main/src/vs/platform/theme/common/colorRegistry.ts#L174
  const colors = getColors(theme);

  monaco.editor.defineTheme('grafana-dark', {
    base: 'vs-dark',
    inherit: true,
    colors: colors,
    rules: [],
  });

  monaco.editor.defineTheme('grafana-light', {
    base: 'vs',
    inherit: true,
    colors: colors,
    rules: [],
  });
}
