// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { auto } from 'angular';

export class QueryCtrl {
  target: any;
  datasource: any;
  panelCtrl: any;
  panel: any;
  hasRawMode = false;
  error = '';

  constructor(public $scope: any, _$injector: auto.IInjectorService) {
    this.panelCtrl = this.panelCtrl || { panel: {} };
    this.target = this.target || { target: '' };
    this.panel = this.panelCtrl.panel;
  }

  refresh() {}
}
