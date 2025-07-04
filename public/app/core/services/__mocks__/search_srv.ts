// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export const mockSearch = jest.fn<any, any>(() => {
  return Promise.resolve([]);
});

export const mockGetDashboardTags = jest.fn(async () =>
  Promise.resolve([
    { term: 'tag1', count: 2 },
    { term: 'tag2', count: 10 },
  ])
);

export const mockGetSortOptions = jest.fn(() =>
  Promise.resolve({ sortOptions: [{ name: 'test', displayName: 'Test' }] })
);

export const SearchSrv = jest.fn().mockImplementation(() => {
  return {
    search: mockSearch,
    getDashboardTags: mockGetDashboardTags,
    getSortOptions: mockGetSortOptions,
  };
});
