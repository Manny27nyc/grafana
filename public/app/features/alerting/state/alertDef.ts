// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { isArray, reduce } from 'lodash';
import { QueryPartDef, QueryPart } from 'app/angular/components/query_part';

const alertQueryDef = new QueryPartDef({
  type: 'query',
  params: [
    { name: 'queryRefId', type: 'string', dynamicLookup: true },
    {
      name: 'from',
      type: 'string',
      options: ['10s', '1m', '5m', '10m', '15m', '1h', '2h', '6h', '12h', '24h', '48h'],
    },
    { name: 'to', type: 'string', options: ['now', 'now-1m', 'now-5m', 'now-10m', 'now-1h'] },
  ],
  defaultParams: ['#A', '15m', 'now', 'avg'],
});

const conditionTypes = [{ text: 'Query', value: 'query' }];

const alertStateSortScore = {
  alerting: 1,
  firing: 1,
  no_data: 2,
  pending: 3,
  ok: 4,
  paused: 5,
  inactive: 5,
};

export enum EvalFunction {
  'IsAbove' = 'gt',
  'IsBelow' = 'lt',
  'IsOutsideRange' = 'outside_range',
  'IsWithinRange' = 'within_range',
  'HasNoValue' = 'no_value',
}

const evalFunctions = [
  { value: EvalFunction.IsAbove, text: 'IS ABOVE' },
  { value: EvalFunction.IsBelow, text: 'IS BELOW' },
  { value: EvalFunction.IsOutsideRange, text: 'IS OUTSIDE RANGE' },
  { value: EvalFunction.IsWithinRange, text: 'IS WITHIN RANGE' },
  { value: EvalFunction.HasNoValue, text: 'HAS NO VALUE' },
];

const evalOperators = [
  { text: 'OR', value: 'or' },
  { text: 'AND', value: 'and' },
];

const reducerTypes = [
  { text: 'avg()', value: 'avg' },
  { text: 'min()', value: 'min' },
  { text: 'max()', value: 'max' },
  { text: 'sum()', value: 'sum' },
  { text: 'count()', value: 'count' },
  { text: 'last()', value: 'last' },
  { text: 'median()', value: 'median' },
  { text: 'diff()', value: 'diff' },
  { text: 'diff_abs()', value: 'diff_abs' },
  { text: 'percent_diff()', value: 'percent_diff' },
  { text: 'percent_diff_abs()', value: 'percent_diff_abs' },
  { text: 'count_non_null()', value: 'count_non_null' },
];

const noDataModes = [
  { text: 'Alerting', value: 'alerting' },
  { text: 'No Data', value: 'no_data' },
  { text: 'Keep Last State', value: 'keep_state' },
  { text: 'Ok', value: 'ok' },
];

const executionErrorModes = [
  { text: 'Alerting', value: 'alerting' },
  { text: 'Keep Last State', value: 'keep_state' },
];

function createReducerPart(model: any) {
  const def = new QueryPartDef({ type: model.type, defaultParams: [] });
  return new QueryPart(model, def);
}

function getStateDisplayModel(state: string) {
  const normalizedState = state.toLowerCase().replace(/_/g, '');

  switch (normalizedState) {
    case 'normal':
    case 'ok': {
      return {
        text: 'OK',
        iconClass: 'heart',
        stateClass: 'alert-state-ok',
      };
    }
    case 'alerting': {
      return {
        text: 'ALERTING',
        iconClass: 'heart-break',
        stateClass: 'alert-state-critical',
      };
    }
    case 'nodata': {
      return {
        text: 'NO DATA',
        iconClass: 'question-circle',
        stateClass: 'alert-state-warning',
      };
    }
    case 'paused': {
      return {
        text: 'PAUSED',
        iconClass: 'pause',
        stateClass: 'alert-state-paused',
      };
    }
    case 'pending': {
      return {
        text: 'PENDING',
        iconClass: 'hourglass',
        stateClass: 'alert-state-warning',
      };
    }
    case 'unknown': {
      return {
        text: 'UNKNOWN',
        iconClass: 'question-circle',
        stateClass: '.alert-state-paused',
      };
    }

    case 'firing': {
      return {
        text: 'FIRING',
        iconClass: 'fire',
        stateClass: '',
      };
    }

    case 'inactive': {
      return {
        text: 'INACTIVE',
        iconClass: 'check',
        stateClass: '',
      };
    }

    case 'error': {
      return {
        text: 'ERROR',
        iconClass: 'heart-break',
        stateClass: 'alert-state-critical',
      };
    }
  }

  throw { message: 'Unknown alert state' };
}

function joinEvalMatches(matches: any, separator: string) {
  return reduce(
    matches,
    (res, ev) => {
      if (ev.metric !== undefined && ev.value !== undefined) {
        res.push(ev.metric + '=' + ev.value);
      }

      // For backwards compatibility . Should be be able to remove this after ~2017-06-01
      if (ev.Metric !== undefined && ev.Value !== undefined) {
        res.push(ev.Metric + '=' + ev.Value);
      }

      return res;
    },
    [] as string[]
  ).join(separator);
}

function getAlertAnnotationInfo(ah: any) {
  // backward compatibility, can be removed in grafana 5.x
  // old way stored evalMatches in data property directly,
  // new way stores it in evalMatches property on new data object

  if (isArray(ah.data)) {
    return joinEvalMatches(ah.data, ', ');
  } else if (isArray(ah.data.evalMatches)) {
    return joinEvalMatches(ah.data.evalMatches, ', ');
  }

  if (ah.data.error) {
    return 'Error: ' + ah.data.error;
  }

  return '';
}

export default {
  alertQueryDef: alertQueryDef,
  getStateDisplayModel: getStateDisplayModel,
  conditionTypes: conditionTypes,
  evalFunctions: evalFunctions,
  evalOperators: evalOperators,
  noDataModes: noDataModes,
  executionErrorModes: executionErrorModes,
  reducerTypes: reducerTypes,
  createReducerPart: createReducerPart,
  getAlertAnnotationInfo: getAlertAnnotationInfo,
  alertStateSortScore: alertStateSortScore,
};
