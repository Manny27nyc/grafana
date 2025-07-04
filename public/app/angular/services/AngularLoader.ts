// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import angular from 'angular';
import coreModule from 'app/angular/core_module';
import { assign } from 'lodash';

import { AngularComponent, AngularLoader as AngularLoaderInterface } from '@grafana/runtime';
import { GrafanaRootScope } from 'app/angular/GrafanaCtrl';

export class AngularLoader implements AngularLoaderInterface {
  /** @ngInject */
  constructor(private $compile: any, private $rootScope: GrafanaRootScope) {}

  load(elem: any, scopeProps: any, template: string): AngularComponent {
    const scope = this.$rootScope.$new();

    assign(scope, scopeProps);

    const compiledElem = this.$compile(template)(scope);
    const rootNode = angular.element(elem);
    rootNode.append(compiledElem);

    return {
      destroy: () => {
        scope.$destroy();
        compiledElem.remove();
      },
      digest: () => {
        if (!scope.$$phase) {
          scope.$digest();
        }
      },
      getScope: () => {
        return scope;
      },
    };
  }
}

coreModule.service('angularLoader', AngularLoader);
