// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export class HeatmapDisplayEditorCtrl {
  panel: any;
  panelCtrl: any;

  /** @ngInject */
  constructor($scope: any) {
    $scope.editor = this;
    this.panelCtrl = $scope.ctrl;
    this.panel = this.panelCtrl.panel;
  }
}

/** @ngInject */
export function heatmapDisplayEditor() {
  'use strict';
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'public/app/plugins/panel/heatmap/partials/display_editor.html',
    controller: HeatmapDisplayEditorCtrl,
  };
}
