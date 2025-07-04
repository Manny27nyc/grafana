// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { coreModule } from './core_module';
import { RouteProvider } from '../core/navigation/patch/RouteProvider';
import { RouteParamsProvider } from '../core/navigation/patch/RouteParamsProvider';
import { ILocationService } from 'angular';
import { AngularLocationWrapper } from './AngularLocationWrapper';

// Neutralizing Angular’s location tampering
// https://stackoverflow.com/a/19825756
const tamperAngularLocation = () => {
  coreModule.config([
    '$provide',
    ($provide: any) => {
      $provide.decorator('$browser', [
        '$delegate',
        ($delegate: any) => {
          $delegate.onUrlChange = () => {};
          $delegate.url = () => '';

          return $delegate;
        },
      ]);
    },
  ]);
};

// Intercepting $location service with implementation based on history
const interceptAngularLocation = () => {
  coreModule.config([
    '$provide',
    ($provide: any) => {
      $provide.decorator('$location', [
        '$delegate',
        ($delegate: ILocationService) => {
          $delegate = (new AngularLocationWrapper() as unknown) as ILocationService;
          return $delegate;
        },
      ]);
    },
  ]);
  coreModule.provider('$route', RouteProvider);
  coreModule.provider('$routeParams', RouteParamsProvider);
};

export function initAngularRoutingBridge() {
  tamperAngularLocation();
  interceptAngularLocation();
}
