// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import coreModule from 'app/angular/core_module';
import { provideTheme } from 'app/core/utils/ConfigProvider';

export function react2AngularDirective(name: string, component: any, options: any) {
  coreModule.directive(name, [
    'reactDirective',
    (reactDirective) => {
      return reactDirective(provideTheme(component), options);
    },
  ]);
}
