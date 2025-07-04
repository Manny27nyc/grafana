// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { DataTransformerID } from './ids';
import { DataTransformerInfo } from '../../types/transformations';
import { orderFieldsTransformer, OrderFieldsTransformerOptions } from './order';
import { filterFieldsByNameTransformer } from './filterByName';
import { renameFieldsTransformer, RenameFieldsTransformerOptions } from './rename';

export interface OrganizeFieldsTransformerOptions
  extends OrderFieldsTransformerOptions,
    RenameFieldsTransformerOptions {
  excludeByName: Record<string, boolean>;
}

export const organizeFieldsTransformer: DataTransformerInfo<OrganizeFieldsTransformerOptions> = {
  id: DataTransformerID.organize,
  name: 'Organize fields by name',
  description: 'Order, filter and rename fields based on configuration given by user',
  defaultOptions: {
    excludeByName: {},
    indexByName: {},
    renameByName: {},
  },

  /**
   * Return a modified copy of the series.  If the transform is not or should not
   * be applied, just return the input series
   */
  operator: (options) => (source) =>
    source.pipe(
      filterFieldsByNameTransformer.operator({
        exclude: { names: mapToExcludeArray(options.excludeByName) },
      }),
      orderFieldsTransformer.operator(options),
      renameFieldsTransformer.operator(options)
    ),
};

const mapToExcludeArray = (excludeByName: Record<string, boolean>): string[] => {
  if (!excludeByName) {
    return [];
  }

  return Object.keys(excludeByName).filter((name) => excludeByName[name]);
};
