// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { isSharedDashboardQuery } from './runSharedRequest';
import { DataSourceApi } from '@grafana/data';

describe('SharedQueryRunner', () => {
  it('should identify shared queries', () => {
    expect(isSharedDashboardQuery('-- Dashboard --')).toBe(true);

    expect(isSharedDashboardQuery('')).toBe(false);
    expect(isSharedDashboardQuery((undefined as unknown) as null)).toBe(false);
    expect(isSharedDashboardQuery(null)).toBe(false);

    const ds = {
      meta: {
        name: '-- Dashboard --',
      },
    } as DataSourceApi;
    expect(isSharedDashboardQuery(ds)).toBe(true);

    ds.meta!.name = 'something else';
    expect(isSharedDashboardQuery(ds)).toBe(false);
  });
});
