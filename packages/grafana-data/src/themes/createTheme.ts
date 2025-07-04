// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { createBreakpoints } from './breakpoints';
import { createComponents } from './createComponents';
import { createColors, ThemeColorsInput } from './createColors';
import { createShadows } from './createShadows';
import { createShape, ThemeShapeInput } from './createShape';
import { createSpacing, ThemeSpacingOptions } from './createSpacing';
import { createTransitions } from './createTransitions';
import { createTypography, ThemeTypographyInput } from './createTypography';
import { createV1Theme } from './createV1Theme';
import { GrafanaTheme2 } from './types';
import { zIndex } from './zIndex';
import { createVisualizationColors } from './createVisualizationColors';

/** @internal */
export interface NewThemeOptions {
  name?: string;
  colors?: ThemeColorsInput;
  spacing?: ThemeSpacingOptions;
  shape?: ThemeShapeInput;
  typography?: ThemeTypographyInput;
}

/** @internal */
export function createTheme(options: NewThemeOptions = {}): GrafanaTheme2 {
  const {
    name = 'Dark',
    colors: colorsInput = {},
    spacing: spacingInput = {},
    shape: shapeInput = {},
    typography: typographyInput = {},
  } = options;

  const colors = createColors(colorsInput);
  const breakpoints = createBreakpoints();
  const spacing = createSpacing(spacingInput);
  const shape = createShape(shapeInput);
  const typography = createTypography(colors, typographyInput);
  const shadows = createShadows(colors);
  const transitions = createTransitions();
  const components = createComponents(colors, shadows);
  const visualization = createVisualizationColors(colors);

  const theme = {
    name,
    isDark: colors.mode === 'dark',
    isLight: colors.mode === 'light',
    colors,
    breakpoints,
    spacing,
    shape,
    components,
    typography,
    shadows,
    transitions,
    visualization,
    zIndex: {
      ...zIndex,
    },
  };

  return {
    ...theme,
    v1: createV1Theme(theme),
  };
}
