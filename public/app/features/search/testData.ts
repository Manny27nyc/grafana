// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { DashboardSearchItemType, DashboardSection } from './types';

export const generalFolder: DashboardSection = {
  id: 0,
  title: 'General',
  items: [
    {
      id: 1,
      uid: 'lBdLINUWk',
      title: 'Test 1',
      uri: 'db/test1',
      url: '/d/lBdLINUWk/test1',
      type: DashboardSearchItemType.DashDB,
      tags: [],
      isStarred: false,
      checked: true,
    },
    {
      id: 46,
      uid: '8DY63kQZk',
      title: 'Test 2',
      uri: 'db/test2',
      url: '/d/8DY63kQZk/test2',
      type: DashboardSearchItemType.DashDB,
      tags: [],
      isStarred: false,
      checked: true,
    },
  ],
  icon: 'folder-open',
  score: 1,
  expanded: true,
  checked: false,
  url: '',
  type: DashboardSearchItemType.DashFolder,
};

export const searchResults: DashboardSection[] = [
  {
    id: 2,
    uid: 'JB_zdOUWk',
    title: 'gdev dashboards',
    expanded: false,
    items: [],
    url: '/dashboards/f/JB_zdOUWk/gdev-dashboards',
    icon: 'folder',
    score: 0,
    checked: true,
    type: DashboardSearchItemType.DashFolder,
  },
  generalFolder,
];

// Search results with more info
export const sections = [
  {
    title: 'Starred',
    score: -2,
    expanded: true,
    items: [
      {
        id: 1,
        uid: 'lBdLINUWk',
        title: 'Prom dash',
        type: DashboardSearchItemType.DashDB,
      },
    ],
  },
  {
    title: 'Recent',
    icon: 'clock-o',
    score: -1,
    removable: true,
    expanded: false,
    items: [
      {
        id: 4072,
        uid: 'OzAIf_rWz',
        title: 'New dashboard Copy 3',

        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      },
      {
        id: 46,
        uid: '8DY63kQZk',
        title: 'Stocks',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      },
      {
        id: 20,
        uid: '7MeksYbmk',
        title: 'Alerting with TestData',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
        folderId: 2,
      },
      {
        id: 4073,
        uid: 'j9SHflrWk',
        title: 'New dashboard Copy 4',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
        folderId: 2,
      },
    ],
  },
  {
    id: 2,
    uid: 'JB_zdOUWk',
    title: 'gdev dashboards',
    expanded: true,
    url: '/dashboards/f/JB_zdOUWk/gdev-dashboards',
    icon: 'folder',
    score: 2,
    items: [],
  },
  {
    id: 2568,
    uid: 'search-test-data',
    title: 'Search test data folder',
    expanded: false,
    items: [],
    url: '/dashboards/f/search-test-data/search-test-data-folder',
    icon: 'folder',
    score: 3,
  },
  {
    id: 4074,
    uid: 'iN5TFj9Zk',
    title: 'Test',
    expanded: false,
    items: [],
    url: '/dashboards/f/iN5TFj9Zk/test',
    icon: 'folder',
    score: 4,
  },
  {
    id: 0,
    title: 'General',
    icon: 'folder-open',
    score: 5,
    expanded: true,
    items: [
      {
        id: 4069,
        uid: 'LCFWfl9Zz',
        title: 'New dashboard Copy',
        uri: 'db/new-dashboard-copy',
        url: '/d/LCFWfl9Zz/new-dashboard-copy',
        slug: '',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      },
      {
        id: 4072,
        uid: 'OzAIf_rWz',
        title: 'New dashboard Copy 3',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      },
      {
        id: 1,
        uid: 'lBdLINUWk',
        title: 'Prom dash',
        type: DashboardSearchItemType.DashDB,
        isStarred: true,
      },
    ],
  },
];
