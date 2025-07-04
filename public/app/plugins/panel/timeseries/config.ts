// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import {
  FieldColorModeId,
  FieldConfigProperty,
  FieldType,
  identityOverrideProcessor,
  SetFieldConfigOptionsArgs,
  stringOverrideProcessor,
} from '@grafana/data';
import {
  BarAlignment,
  GraphDrawStyle,
  GraphFieldConfig,
  GraphGradientMode,
  LineInterpolation,
  LineStyle,
  VisibilityMode,
  StackingMode,
  GraphTresholdsStyleMode,
} from '@grafana/schema';

import { graphFieldOptions, commonOptionsBuilder } from '@grafana/ui';

import { LineStyleEditor } from './LineStyleEditor';
import { FillBellowToEditor } from './FillBelowToEditor';
import { SpanNullsEditor } from './SpanNullsEditor';
import { ThresholdsStyleEditor } from './ThresholdsStyleEditor';

export const defaultGraphConfig: GraphFieldConfig = {
  drawStyle: GraphDrawStyle.Line,
  lineInterpolation: LineInterpolation.Linear,
  lineWidth: 1,
  fillOpacity: 0,
  gradientMode: GraphGradientMode.None,
  barAlignment: BarAlignment.Center,
  stacking: {
    mode: StackingMode.None,
    group: 'A',
  },
  axisGridShow: true,
};

const categoryStyles = ['Graph styles'];

export function getGraphFieldConfig(cfg: GraphFieldConfig): SetFieldConfigOptionsArgs<GraphFieldConfig> {
  return {
    standardOptions: {
      [FieldConfigProperty.Color]: {
        settings: {
          byValueSupport: true,
          bySeriesSupport: true,
          preferThresholdsMode: false,
        },
        defaultValue: {
          mode: FieldColorModeId.PaletteClassic,
        },
      },
    },
    useCustomConfig: (builder) => {
      builder
        .addRadio({
          path: 'drawStyle',
          name: 'Style',
          category: categoryStyles,
          defaultValue: cfg.drawStyle,
          settings: {
            options: graphFieldOptions.drawStyle,
          },
        })
        .addRadio({
          path: 'lineInterpolation',
          name: 'Line interpolation',
          category: categoryStyles,
          defaultValue: cfg.lineInterpolation,
          settings: {
            options: graphFieldOptions.lineInterpolation,
          },
          showIf: (c) => c.drawStyle === GraphDrawStyle.Line,
        })
        .addRadio({
          path: 'barAlignment',
          name: 'Bar alignment',
          category: categoryStyles,
          defaultValue: cfg.barAlignment,
          settings: {
            options: graphFieldOptions.barAlignment,
          },
          showIf: (c) => c.drawStyle === GraphDrawStyle.Bars,
        })
        .addSliderInput({
          path: 'lineWidth',
          name: 'Line width',
          category: categoryStyles,
          defaultValue: cfg.lineWidth,
          settings: {
            min: 0,
            max: 10,
            step: 1,
            ariaLabelForHandle: 'Line width',
          },
          showIf: (c) => c.drawStyle !== GraphDrawStyle.Points,
        })
        .addSliderInput({
          path: 'fillOpacity',
          name: 'Fill opacity',
          category: categoryStyles,
          defaultValue: cfg.fillOpacity,
          settings: {
            min: 0,
            max: 100,
            step: 1,
            ariaLabelForHandle: 'Fill opacity',
          },
          showIf: (c) => c.drawStyle !== GraphDrawStyle.Points,
        })
        .addRadio({
          path: 'gradientMode',
          name: 'Gradient mode',
          category: categoryStyles,
          defaultValue: graphFieldOptions.fillGradient[0].value,
          settings: {
            options: graphFieldOptions.fillGradient,
          },
          showIf: (c) => c.drawStyle !== GraphDrawStyle.Points,
        })
        .addCustomEditor({
          id: 'fillBelowTo',
          path: 'fillBelowTo',
          name: 'Fill below to',
          category: categoryStyles,
          editor: FillBellowToEditor,
          override: FillBellowToEditor,
          process: stringOverrideProcessor,
          hideFromDefaults: true,
          shouldApply: (f) => true,
        })
        .addCustomEditor<void, LineStyle>({
          id: 'lineStyle',
          path: 'lineStyle',
          name: 'Line style',
          category: categoryStyles,
          showIf: (c) => c.drawStyle === GraphDrawStyle.Line,
          editor: LineStyleEditor,
          override: LineStyleEditor,
          process: identityOverrideProcessor,
          shouldApply: (f) => f.type === FieldType.number,
        })
        .addCustomEditor<void, boolean>({
          id: 'spanNulls',
          path: 'spanNulls',
          name: 'Connect null values',
          category: categoryStyles,
          defaultValue: false,
          editor: SpanNullsEditor,
          override: SpanNullsEditor,
          showIf: (c) => c.drawStyle === GraphDrawStyle.Line,
          shouldApply: (f) => f.type !== FieldType.time,
          process: identityOverrideProcessor,
        })
        .addRadio({
          path: 'showPoints',
          name: 'Show points',
          category: categoryStyles,
          defaultValue: graphFieldOptions.showPoints[0].value,
          settings: {
            options: graphFieldOptions.showPoints,
          },
          showIf: (c) => c.drawStyle !== GraphDrawStyle.Points,
        })
        .addSliderInput({
          path: 'pointSize',
          name: 'Point size',
          category: categoryStyles,
          defaultValue: 5,
          settings: {
            min: 1,
            max: 40,
            step: 1,
            ariaLabelForHandle: 'Point size',
          },
          showIf: (c) => c.showPoints !== VisibilityMode.Never || c.drawStyle === GraphDrawStyle.Points,
        });

      commonOptionsBuilder.addStackingConfig(builder, cfg.stacking, categoryStyles);
      commonOptionsBuilder.addAxisConfig(builder, cfg);
      commonOptionsBuilder.addHideFrom(builder);

      builder.addCustomEditor({
        id: 'thresholdsStyle',
        path: 'thresholdsStyle',
        name: 'Show thresholds',
        category: ['Thresholds'],
        defaultValue: { mode: GraphTresholdsStyleMode.Off },
        settings: {
          options: graphFieldOptions.thresholdsDisplayModes,
        },
        editor: ThresholdsStyleEditor,
        override: ThresholdsStyleEditor,
        process: identityOverrideProcessor,
        shouldApply: () => true,
      });
    },
  };
}
