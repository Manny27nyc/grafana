// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { Observable, of } from 'rxjs';
import { AnnotationEvent } from '@grafana/data';

import { DashboardQueryRunnerOptions, DashboardQueryRunnerWorker, DashboardQueryRunnerWorkerResult } from './types';
import { emptyResult, getAnnotationsByPanelId, translateQueryResult } from './utils';
import { DashboardModel } from '../../../dashboard/state';

export class SnapshotWorker implements DashboardQueryRunnerWorker {
  canWork({ dashboard }: DashboardQueryRunnerOptions): boolean {
    return dashboard?.annotations?.list?.some((a) => a.enable && Boolean(a.snapshotData));
  }

  work(options: DashboardQueryRunnerOptions): Observable<DashboardQueryRunnerWorkerResult> {
    if (!this.canWork(options)) {
      return emptyResult();
    }

    const annotations = this.getAnnotationsFromSnapshot(options.dashboard);
    return of({ annotations, alertStates: [] });
  }

  private getAnnotationsFromSnapshot(dashboard: DashboardModel): AnnotationEvent[] {
    const dashAnnotations = dashboard?.annotations?.list?.filter((a) => a.enable);
    const snapshots = dashAnnotations.filter((a) => Boolean(a.snapshotData));
    const annotations = snapshots.reduce(
      (acc, curr) => acc.concat(translateQueryResult(curr, curr.snapshotData)),
      [] as AnnotationEvent[]
    );

    return annotations;
  }

  getAnnotationsInSnapshot(dashboard: DashboardModel, panelId?: number): AnnotationEvent[] {
    const annotations = this.getAnnotationsFromSnapshot(dashboard);
    return getAnnotationsByPanelId(annotations, panelId);
  }
}
