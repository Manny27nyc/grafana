// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { map } from 'rxjs/operators';

import { DataTransformerID } from './ids';
import { DataTransformerInfo } from '../../types/transformations';
import { DataFrame } from '../../types';
import { getFieldDisplayName } from '../../field';
import { sortDataFrame } from '../../dataframe';

export interface SortByField {
  field: string;
  desc?: boolean;
  index?: number;
}

export interface SortByTransformerOptions {
  // NOTE: this structure supports an array, however only the first entry is used
  // future versions may support multi-sort options
  sort: SortByField[];
}

export const sortByTransformer: DataTransformerInfo<SortByTransformerOptions> = {
  id: DataTransformerID.sortBy,
  name: 'Sort by',
  description: 'Sort fields in a frame',
  defaultOptions: {
    fields: {},
  },

  /**
   * Return a modified copy of the series.  If the transform is not or should not
   * be applied, just return the input series
   */
  operator: (options) => (source) =>
    source.pipe(
      map((data) => {
        if (!Array.isArray(data) || data.length === 0 || !options?.sort?.length) {
          return data;
        }
        return sortDataFrames(data, options.sort);
      })
    ),
};

export function sortDataFrames(data: DataFrame[], sort: SortByField[]): DataFrame[] {
  return data.map((frame) => {
    const s = attachFieldIndex(frame, sort);
    if (s.length && s[0].index != null) {
      return sortDataFrame(frame, s[0].index, s[0].desc);
    }
    return frame;
  });
}

function attachFieldIndex(frame: DataFrame, sort: SortByField[]): SortByField[] {
  return sort.map((s) => {
    if (s.index != null) {
      // null or undefined
      return s;
    }
    return {
      ...s,
      index: frame.fields.findIndex((f) => s.field === getFieldDisplayName(f, frame)),
    };
  });
}
