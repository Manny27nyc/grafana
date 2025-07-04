// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import coreModule from 'app/angular/core_module';
import config from 'app/core/config';
import { find, isNumber } from 'lodash';
import { NavModel } from '@grafana/data';

export class NavModelSrv {
  navItems: any;

  constructor() {
    this.navItems = config.bootData.navTree;
  }

  getCfgNode() {
    return find(this.navItems, { id: 'cfg' });
  }

  getNav(...args: Array<string | number>) {
    let children = this.navItems;
    const nav = {
      breadcrumbs: [],
    } as any;

    for (const id of args) {
      // if its a number then it's the index to use for main
      if (isNumber(id)) {
        nav.main = nav.breadcrumbs[id];
        break;
      }

      const node: any = find(children, { id: id });
      nav.breadcrumbs.push(node);
      nav.node = node;
      nav.main = node;
      children = node.children;
    }

    if (nav.main.children) {
      for (const item of nav.main.children) {
        item.active = false;

        if (item.url === nav.node.url) {
          item.active = true;
        }
      }
    }

    return nav;
  }

  getNotFoundNav() {
    return getNotFoundNav(); // the exported function
  }
}

export function getExceptionNav(error: any): NavModel {
  console.error(error);
  return getWarningNav('Exception thrown', 'See console for details');
}

export function getNotFoundNav(): NavModel {
  return getWarningNav('Page not found', '404 Error');
}

export function getWarningNav(text: string, subTitle?: string): NavModel {
  const node = {
    text,
    subTitle,
    icon: 'exclamation-triangle',
  };
  return {
    breadcrumbs: [node],
    node: node,
    main: node,
  };
}

coreModule.service('navModelSrv', NavModelSrv);
