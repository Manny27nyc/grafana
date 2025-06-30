// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { QueryEditorProps } from '@grafana/data';
import LokiDatasource from '../datasource';
import { LokiOptions, LokiQuery } from '../types';

export type LokiQueryEditorProps = QueryEditorProps<LokiDatasource, LokiQuery, LokiOptions>;
