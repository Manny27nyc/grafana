// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { react2AngularDirective } from 'app/angular/react2angular';
import { QueryEditor as CloudMonitoringQueryEditor } from 'app/plugins/datasource/cloud-monitoring/components/QueryEditor';
import { AnnotationQueryEditor as CloudMonitoringAnnotationQueryEditor } from 'app/plugins/datasource/cloud-monitoring/components/AnnotationQueryEditor';
import { AnnotationQueryEditor as CloudWatchAnnotationQueryEditor } from 'app/plugins/datasource/cloudwatch/components/AnnotationQueryEditor';
import PageHeader from '../core/components/PageHeader/PageHeader';
import EmptyListCTA from '../core/components/EmptyListCTA/EmptyListCTA';
import { TagFilter } from '../core/components/TagFilter/TagFilter';
import { MetricSelect } from '../core/components/Select/MetricSelect';
import {
  ClipboardButton,
  ColorPicker,
  DataLinksInlineEditor,
  DataSourceHttpSettings,
  GraphContextMenu,
  Icon,
  LegacyForms,
  SeriesColorPickerPopoverWithTheme,
  Spinner,
  UnitPicker,
} from '@grafana/ui';
import { LokiAnnotationsQueryEditor } from '../plugins/datasource/loki/components/AnnotationsQueryEditor';
import { HelpModal } from '../core/components/help/HelpModal';
import { Footer } from '../core/components/Footer/Footer';
import { FolderPicker } from 'app/core/components/Select/FolderPicker';
import { SearchField, SearchResults, SearchResultsFilter } from '../features/search';
import { TimePickerSettings } from 'app/features/dashboard/components/DashboardSettings/TimePickerSettings';
import QueryEditor from 'app/plugins/datasource/grafana-azure-monitor-datasource/components/QueryEditor/QueryEditor';

const { SecretFormField } = LegacyForms;

export function registerAngularDirectives() {
  react2AngularDirective('footer', Footer, []);
  react2AngularDirective('icon', Icon, [
    'name',
    'size',
    'type',
    ['onClick', { watchDepth: 'reference', wrapApply: true }],
  ]);
  react2AngularDirective('spinner', Spinner, ['inline']);
  react2AngularDirective('helpModal', HelpModal, []);
  react2AngularDirective('pageHeader', PageHeader, ['model', 'noTabs']);
  react2AngularDirective('emptyListCta', EmptyListCTA, [
    'title',
    'buttonIcon',
    'buttonLink',
    'buttonTitle',
    ['onClick', { watchDepth: 'reference', wrapApply: true }],
    'proTip',
    'proTipLink',
    'proTipLinkTitle',
    'proTipTarget',
    'infoBox',
    'infoBoxTitle',
  ]);
  //Search
  react2AngularDirective('searchField', SearchField, [
    'query',
    'autoFocus',
    ['onChange', { watchDepth: 'reference' }],
    ['onKeyDown', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('searchResults', SearchResults, [
    'results',
    'editable',
    'selectors',
    ['onSelectionChanged', { watchDepth: 'reference' }],
    ['onTagSelected', { watchDepth: 'reference' }],
    ['onFolderExpanding', { watchDepth: 'reference' }],
    ['onToggleSelection', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('searchFilters', SearchResultsFilter, [
    'allChecked',
    'canMove',
    'canDelete',
    'tagFilterOptions',
    'selectedStarredFilter',
    'selectedTagFilter',
    ['onSelectAllChanged', { watchDepth: 'reference' }],
    ['deleteItem', { watchDepth: 'reference' }],
    ['moveTo', { watchDepth: 'reference' }],
    ['onStarredFilterChange', { watchDepth: 'reference' }],
    ['onTagFilterChange', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('tagFilter', TagFilter, [
    'tags',
    ['onChange', { watchDepth: 'reference' }],
    ['tagOptions', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('colorPicker', ColorPicker, [
    'color',
    ['onChange', { watchDepth: 'reference', wrapApply: true }],
  ]);
  react2AngularDirective('seriesColorPickerPopover', SeriesColorPickerPopoverWithTheme, [
    'color',
    'series',
    'onColorChange',
    'onToggleAxis',
  ]);
  react2AngularDirective('unitPicker', UnitPicker, [
    'value',
    'width',
    ['onChange', { watchDepth: 'reference', wrapApply: true }],
  ]);
  react2AngularDirective('metricSelect', MetricSelect, [
    'options',
    'onChange',
    'value',
    'isSearchable',
    'className',
    'placeholder',
    ['variables', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('cloudMonitoringQueryEditor', CloudMonitoringQueryEditor, [
    'target',
    'onQueryChange',
    'onExecuteQuery',
    ['events', { watchDepth: 'reference' }],
    ['datasource', { watchDepth: 'reference' }],
    ['templateSrv', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('cloudMonitoringAnnotationQueryEditor', CloudMonitoringAnnotationQueryEditor, [
    'target',
    'onQueryChange',
    ['datasource', { watchDepth: 'reference' }],
    ['templateSrv', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('cloudwatchAnnotationQueryEditor', CloudWatchAnnotationQueryEditor, [
    'query',
    'onChange',
    ['datasource', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('secretFormField', SecretFormField, [
    'value',
    'isConfigured',
    'inputWidth',
    'labelWidth',
    ['onReset', { watchDepth: 'reference', wrapApply: true }],
    ['onChange', { watchDepth: 'reference', wrapApply: true }],
  ]);
  react2AngularDirective('graphContextMenu', GraphContextMenu, [
    'x',
    'y',
    'itemsGroup',
    ['onClose', { watchDepth: 'reference', wrapApply: true }],
    ['getContextMenuSource', { watchDepth: 'reference', wrapApply: true }],
    ['timeZone', { watchDepth: 'reference', wrapApply: true }],
  ]);

  // We keep the drilldown terminology here because of as using data-* directive
  // being in conflict with HTML data attributes
  react2AngularDirective('drilldownLinksEditor', DataLinksInlineEditor, [
    'value',
    'links',
    'suggestions',
    ['onChange', { watchDepth: 'reference', wrapApply: true }],
  ]);

  react2AngularDirective('lokiAnnotationsQueryEditor', LokiAnnotationsQueryEditor, [
    'expr',
    'maxLines',
    'instant',
    'onChange',
    ['datasource', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('datasourceHttpSettingsNext', DataSourceHttpSettings, [
    'defaultUrl',
    'showAccessOptions',
    'dataSourceConfig',
    'showForwardOAuthIdentityOption',
    ['onChange', { watchDepth: 'reference', wrapApply: true }],
  ]);
  react2AngularDirective('folderPicker', FolderPicker, [
    'labelClass',
    'rootName',
    'enableCreateNew',
    'enableReset',
    'initialTitle',
    'initialFolderId',
    'dashboardId',
    'onCreateFolder',
    ['enterFolderCreation', { watchDepth: 'reference', wrapApply: true }],
    ['exitFolderCreation', { watchDepth: 'reference', wrapApply: true }],
    ['onLoad', { watchDepth: 'reference', wrapApply: true }],
    ['onChange', { watchDepth: 'reference', wrapApply: true }],
  ]);

  react2AngularDirective('timePickerSettings', TimePickerSettings, [
    'renderCount',
    'refreshIntervals',
    'timePickerHidden',
    'nowDelay',
    'timezone',
    ['onTimeZoneChange', { watchDepth: 'reference', wrapApply: true }],
    ['onRefreshIntervalChange', { watchDepth: 'reference', wrapApply: true }],
    ['onNowDelayChange', { watchDepth: 'reference', wrapApply: true }],
    ['onHideTimePickerChange', { watchDepth: 'reference', wrapApply: true }],
  ]);

  react2AngularDirective('azureMonitorQueryEditor', QueryEditor, [
    'query',
    ['datasource', { watchDepth: 'reference' }],
    'onChange',
  ]);

  react2AngularDirective('clipboardButton', ClipboardButton, [
    ['getText', { watchDepth: 'reference', wrapApply: true }],
  ]);
}
