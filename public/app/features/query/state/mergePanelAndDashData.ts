// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { combineLatest, Observable, of } from 'rxjs';
import { ArrayDataFrame, PanelData } from '@grafana/data';
import { DashboardQueryRunnerResult } from './DashboardQueryRunner/types';
import { mergeMap } from 'rxjs/operators';

export function mergePanelAndDashData(
  panelObservable: Observable<PanelData>,
  dashObservable: Observable<DashboardQueryRunnerResult>
): Observable<PanelData> {
  return combineLatest([panelObservable, dashObservable]).pipe(
    mergeMap((combined) => {
      const [panelData, dashData] = combined;

      if (Boolean(dashData.annotations?.length) || Boolean(dashData.alertState)) {
        if (!panelData.annotations) {
          panelData.annotations = [];
        }

        const annotations = panelData.annotations.concat(new ArrayDataFrame(dashData.annotations));
        const alertState = dashData.alertState;
        return of({ ...panelData, annotations, alertState });
      }

      return of(panelData);
    })
  );
}
