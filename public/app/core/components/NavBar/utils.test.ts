// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { Location } from 'history';
import { NavModelItem } from '@grafana/data';
import { ContextSrv, setContextSrv } from 'app/core/services/context_srv';
import { getConfig, updateConfig } from '../../config';
import { enrichConfigItems, getActiveItem, getForcedLoginUrl, isMatchOrChildMatch, isSearchActive } from './utils';

jest.mock('../../app_events', () => ({
  publish: jest.fn(),
}));

describe('getForcedLoginUrl', () => {
  it.each`
    appSubUrl          | url                    | expected
    ${''}              | ${'/whatever?a=1&b=2'} | ${'/whatever?a=1&b=2&forceLogin=true'}
    ${'/grafana'}      | ${'/whatever?a=1&b=2'} | ${'/grafana/whatever?a=1&b=2&forceLogin=true'}
    ${'/grafana/test'} | ${'/whatever?a=1&b=2'} | ${'/grafana/test/whatever?a=1&b=2&forceLogin=true'}
    ${'/grafana'}      | ${''}                  | ${'/grafana?forceLogin=true'}
    ${'/grafana'}      | ${'/whatever'}         | ${'/grafana/whatever?forceLogin=true'}
    ${'/grafana'}      | ${'/whatever/'}        | ${'/grafana/whatever/?forceLogin=true'}
  `(
    "when appUrl set to '$appUrl' and appSubUrl set to '$appSubUrl' then result should be '$expected'",
    ({ appSubUrl, url, expected }) => {
      updateConfig({
        appSubUrl,
      });

      const result = getForcedLoginUrl(url);

      expect(result).toBe(expected);
    }
  );
});

describe('enrichConfigItems', () => {
  let mockItems: NavModelItem[];
  const mockLocation: Location<unknown> = {
    hash: '',
    pathname: '/',
    search: '',
    state: '',
  };

  beforeEach(() => {
    mockItems = [
      {
        id: 'profile',
        text: 'Profile',
        hideFromMenu: true,
      },
      {
        id: 'help',
        text: 'Help',
        hideFromMenu: true,
      },
    ];
  });

  it('does not add a sign in item if a user signed in', () => {
    const contextSrv = new ContextSrv();
    contextSrv.user.isSignedIn = false;
    setContextSrv(contextSrv);
    const enrichedConfigItems = enrichConfigItems(mockItems, mockLocation, jest.fn());
    const signInNode = enrichedConfigItems.find((item) => item.id === 'signin');
    expect(signInNode).toBeDefined();
  });

  it('adds a sign in item if a user is not signed in', () => {
    const contextSrv = new ContextSrv();
    contextSrv.user.isSignedIn = true;
    setContextSrv(contextSrv);
    const enrichedConfigItems = enrichConfigItems(mockItems, mockLocation, jest.fn());
    const signInNode = enrichedConfigItems.find((item) => item.id === 'signin');
    expect(signInNode).toBeDefined();
  });

  it('does not add an org switcher to the profile node if there is 1 org', () => {
    const contextSrv = new ContextSrv();
    contextSrv.user.orgCount = 1;
    setContextSrv(contextSrv);
    const enrichedConfigItems = enrichConfigItems(mockItems, mockLocation, jest.fn());
    const profileNode = enrichedConfigItems.find((item) => item.id === 'profile');
    expect(profileNode!.children).toBeUndefined();
  });

  it('adds an org switcher to the profile node if there is more than 1 org', () => {
    const contextSrv = new ContextSrv();
    contextSrv.user.orgCount = 2;
    setContextSrv(contextSrv);
    const enrichedConfigItems = enrichConfigItems(mockItems, mockLocation, jest.fn());
    const profileNode = enrichedConfigItems.find((item) => item.id === 'profile');
    expect(profileNode!.children).toContainEqual(
      expect.objectContaining({
        text: 'Switch organization',
      })
    );
  });

  it('enhances the help node with extra child links', () => {
    const contextSrv = new ContextSrv();
    setContextSrv(contextSrv);
    const enrichedConfigItems = enrichConfigItems(mockItems, mockLocation, jest.fn());
    const helpNode = enrichedConfigItems.find((item) => item.id === 'help');
    expect(helpNode!.children).toContainEqual(
      expect.objectContaining({
        text: 'Documentation',
      })
    );
    expect(helpNode!.children).toContainEqual(
      expect.objectContaining({
        text: 'Support',
      })
    );
    expect(helpNode!.children).toContainEqual(
      expect.objectContaining({
        text: 'Community',
      })
    );
    expect(helpNode!.children).toContainEqual(
      expect.objectContaining({
        text: 'Keyboard shortcuts',
      })
    );
  });
});

describe('isMatchOrChildMatch', () => {
  const mockChild: NavModelItem = {
    text: 'Child',
    url: '/dashboards/child',
  };
  const mockItemToCheck: NavModelItem = {
    text: 'Dashboards',
    url: '/dashboards',
    children: [mockChild],
  };

  it('returns true if the itemToCheck is an exact match with the searchItem', () => {
    const searchItem = mockItemToCheck;
    expect(isMatchOrChildMatch(mockItemToCheck, searchItem)).toBe(true);
  });

  it('returns true if the itemToCheck has a child that matches the searchItem', () => {
    const searchItem = mockChild;
    expect(isMatchOrChildMatch(mockItemToCheck, searchItem)).toBe(true);
  });

  it('returns false otherwise', () => {
    const searchItem: NavModelItem = {
      text: 'No match',
      url: '/noMatch',
    };
    expect(isMatchOrChildMatch(mockItemToCheck, searchItem)).toBe(false);
  });
});

describe('getActiveItem', () => {
  const mockNavTree: NavModelItem[] = [
    {
      text: 'Item',
      url: '/item',
    },
    {
      text: 'Item with query param',
      url: '/itemWithQueryParam?foo=bar',
    },
    {
      text: 'Item with children',
      url: '/itemWithChildren',
      children: [
        {
          text: 'Child',
          url: '/child',
        },
      ],
    },
    {
      text: 'Alerting item',
      url: '/alerting/list',
    },
    {
      text: 'Base',
      url: '/',
    },
    {
      text: 'Dashboards',
      url: '/dashboards',
    },
    {
      text: 'More specific dashboard',
      url: '/d/moreSpecificDashboard',
    },
  ];

  it('returns an exact match at the top level', () => {
    const mockPathName = '/item';
    expect(getActiveItem(mockNavTree, mockPathName)).toEqual({
      text: 'Item',
      url: '/item',
    });
  });

  it('returns an exact match ignoring query params', () => {
    const mockPathName = '/itemWithQueryParam?bar=baz';
    expect(getActiveItem(mockNavTree, mockPathName)).toEqual({
      text: 'Item with query param',
      url: '/itemWithQueryParam?foo=bar',
    });
  });

  it('returns an exact child match', () => {
    const mockPathName = '/child';
    expect(getActiveItem(mockNavTree, mockPathName)).toEqual({
      text: 'Child',
      url: '/child',
    });
  });

  it('returns the alerting link if the pathname is an alert notification', () => {
    const mockPathName = '/alerting/notification/foo';
    expect(getActiveItem(mockNavTree, mockPathName)).toEqual({
      text: 'Alerting item',
      url: '/alerting/list',
    });
  });

  describe('when the newNavigation feature toggle is disabled', () => {
    beforeEach(() => {
      updateConfig({
        featureToggles: {
          ...getConfig().featureToggles,
          newNavigation: false,
        },
      });
    });

    it('returns the base route link if the pathname starts with /d/', () => {
      const mockPathName = '/d/foo';
      expect(getActiveItem(mockNavTree, mockPathName)).toEqual({
        text: 'Base',
        url: '/',
      });
    });

    it('returns a more specific link if one exists', () => {
      const mockPathName = '/d/moreSpecificDashboard';
      expect(getActiveItem(mockNavTree, mockPathName)).toEqual({
        text: 'More specific dashboard',
        url: '/d/moreSpecificDashboard',
      });
    });
  });

  describe('when the newNavigation feature toggle is enabled', () => {
    beforeEach(() => {
      updateConfig({
        featureToggles: {
          ...getConfig().featureToggles,
          newNavigation: true,
        },
      });
    });

    it('returns the dashboards route link if the pathname starts with /d/', () => {
      const mockPathName = '/d/foo';
      expect(getActiveItem(mockNavTree, mockPathName)).toEqual({
        text: 'Dashboards',
        url: '/dashboards',
      });
    });

    it('returns a more specific link if one exists', () => {
      const mockPathName = '/d/moreSpecificDashboard';
      expect(getActiveItem(mockNavTree, mockPathName)).toEqual({
        text: 'More specific dashboard',
        url: '/d/moreSpecificDashboard',
      });
    });
  });
});

describe('isSearchActive', () => {
  it('returns true if the search query parameter is "open"', () => {
    const mockLocation = {
      hash: '',
      pathname: '/',
      search: '?search=open',
      state: '',
    };
    expect(isSearchActive(mockLocation)).toBe(true);
  });

  it('returns false if the search query parameter is missing', () => {
    const mockLocation = {
      hash: '',
      pathname: '/',
      search: '',
      state: '',
    };
    expect(isSearchActive(mockLocation)).toBe(false);
  });
});
