// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import type { Monaco, monacoTypes } from '@grafana/ui';
import { getTemplateSrv, TemplateSrv } from '@grafana/runtime';
import { uniq } from 'lodash';
import { CloudWatchDatasource } from '../../datasource';
import { linkedTokenBuilder } from './linkedTokenBuilder';
import { getSuggestionKinds } from './suggestionKind';
import { getStatementPosition } from './statementPosition';
import { TRIGGER_SUGGEST } from './commands';
import { TokenType, SuggestionKind, CompletionItemPriority, StatementPosition } from './types';
import { LinkedToken } from './LinkedToken';
import {
  BY,
  FROM,
  GROUP,
  LIMIT,
  ORDER,
  SCHEMA,
  SELECT,
  ASC,
  DESC,
  WHERE,
  COMPARISON_OPERATORS,
  LOGICAL_OPERATORS,
  STATISTICS,
} from '../language';
import { getMetricNameToken, getNamespaceToken } from './tokenUtils';

type CompletionItem = monacoTypes.languages.CompletionItem;

export class CompletionItemProvider {
  region: string;
  templateVariables: string[];

  constructor(private datasource: CloudWatchDatasource, private templateSrv: TemplateSrv = getTemplateSrv()) {
    this.templateVariables = this.datasource.getVariables();
    this.region = datasource.getActualRegion();
  }

  setRegion(region: string) {
    this.region = region;
  }

  getCompletionProvider(monaco: Monaco) {
    return {
      triggerCharacters: [' ', '$', ',', '(', "'"],
      provideCompletionItems: async (model: monacoTypes.editor.ITextModel, position: monacoTypes.IPosition) => {
        const currentToken = linkedTokenBuilder(monaco, model, position);
        const statementPosition = getStatementPosition(currentToken);
        const suggestionKinds = getSuggestionKinds(statementPosition);
        const suggestions = await this.getSuggestions(
          monaco,
          currentToken,
          suggestionKinds,
          statementPosition,
          position
        );

        return {
          suggestions,
        };
      },
    };
  }

  private async getSuggestions(
    monaco: Monaco,
    currentToken: LinkedToken | null,
    suggestionKinds: SuggestionKind[],
    statementPosition: StatementPosition,
    position: monacoTypes.IPosition
  ): Promise<CompletionItem[]> {
    let suggestions: CompletionItem[] = [];
    const invalidRangeToken = currentToken?.isWhiteSpace() || currentToken?.isParenthesis();
    const range =
      invalidRangeToken || !currentToken?.range ? monaco.Range.fromPositions(position) : currentToken?.range;

    const toCompletionItem = (value: string, rest: Partial<CompletionItem> = {}) => {
      const item: CompletionItem = {
        label: value,
        insertText: value,
        kind: monaco.languages.CompletionItemKind.Field,
        range,
        sortText: CompletionItemPriority.Medium,
        ...rest,
      };
      return item;
    };

    function addSuggestion(value: string, rest: Partial<CompletionItem> = {}) {
      suggestions = [...suggestions, toCompletionItem(value, rest)];
    }

    for (const suggestion of suggestionKinds) {
      switch (suggestion) {
        case SuggestionKind.SelectKeyword:
          addSuggestion(SELECT, {
            insertText: `${SELECT} $0`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            kind: monaco.languages.CompletionItemKind.Keyword,
            command: TRIGGER_SUGGEST,
          });
          break;

        case SuggestionKind.FunctionsWithArguments:
          STATISTICS.map((s) =>
            addSuggestion(s, {
              insertText: `${s}($0)`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              command: TRIGGER_SUGGEST,
              kind: monaco.languages.CompletionItemKind.Function,
            })
          );
          break;

        case SuggestionKind.FunctionsWithoutArguments:
          STATISTICS.map((s) =>
            addSuggestion(s, {
              insertText: `${s}() `,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              command: TRIGGER_SUGGEST,
              kind: monaco.languages.CompletionItemKind.Function,
            })
          );
          break;

        case SuggestionKind.Metrics:
          {
            const namespaceToken = getNamespaceToken(currentToken);
            if (namespaceToken?.value) {
              // if a namespace is specified, only suggest metrics for the namespace
              const metrics = await this.datasource.getMetrics(
                this.templateSrv.replace(namespaceToken?.value.replace(/\"/g, '')),
                this.templateSrv.replace(this.region)
              );
              metrics.map((m) => addSuggestion(m.value));
            } else {
              // If no namespace is specified in the query, just list all metrics
              const metrics = await this.datasource.getAllMetrics(this.templateSrv.replace(this.region));
              uniq(metrics.map((m) => m.metricName)).map((m) => addSuggestion(m, { insertText: m }));
            }
          }
          break;

        case SuggestionKind.FromKeyword:
          addSuggestion(FROM, {
            insertText: `${FROM} `,
            command: TRIGGER_SUGGEST,
          });
          break;

        case SuggestionKind.SchemaKeyword:
          addSuggestion(SCHEMA, {
            sortText: CompletionItemPriority.High,
            insertText: `${SCHEMA}($0)`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            command: TRIGGER_SUGGEST,
            kind: monaco.languages.CompletionItemKind.Function,
          });
          break;

        case SuggestionKind.Namespaces:
          const metricNameToken = getMetricNameToken(currentToken);
          let namespaces = [];
          if (metricNameToken?.value) {
            // if a metric is specified, only suggest namespaces that actually have that metric
            const metrics = await this.datasource.getAllMetrics(this.region);
            const metricName = this.templateSrv.replace(metricNameToken.value);
            namespaces = metrics.filter((m) => m.metricName === metricName).map((m) => m.namespace);
          } else {
            // if no metric is specified, just suggest all namespaces
            const ns = await this.datasource.getNamespaces();
            namespaces = ns.map((n) => n.value);
          }
          namespaces.map((n) => addSuggestion(`"${n}"`, { insertText: `"${n}"` }));
          break;

        case SuggestionKind.LabelKeys:
          {
            const metricNameToken = getMetricNameToken(currentToken);
            const namespaceToken = getNamespaceToken(currentToken);
            if (namespaceToken?.value) {
              let dimensionFilter = {};
              let labelKeyTokens;
              if (statementPosition === StatementPosition.SchemaFuncExtraArgument) {
                labelKeyTokens = namespaceToken?.getNextUntil(TokenType.Parenthesis, [
                  TokenType.Delimiter,
                  TokenType.Whitespace,
                ]);
              } else if (statementPosition === StatementPosition.AfterGroupByKeywords) {
                labelKeyTokens = currentToken?.getPreviousUntil(TokenType.Keyword, [
                  TokenType.Delimiter,
                  TokenType.Whitespace,
                ]);
              }
              dimensionFilter = (labelKeyTokens || []).reduce((acc, curr) => {
                return { ...acc, [curr.value]: null };
              }, {});
              const keys = await this.datasource.getDimensionKeys(
                this.templateSrv.replace(namespaceToken.value.replace(/\"/g, '')),
                this.templateSrv.replace(this.region),
                dimensionFilter,
                metricNameToken?.value ?? ''
              );
              keys.map((m) => {
                const key = /[\s\.-]/.test(m.value) ? `"${m.value}"` : m.value;
                addSuggestion(key);
              });
            }
          }
          break;

        case SuggestionKind.LabelValues:
          {
            const namespaceToken = getNamespaceToken(currentToken);
            const metricNameToken = getMetricNameToken(currentToken);
            const labelKey = currentToken?.getPreviousNonWhiteSpaceToken()?.getPreviousNonWhiteSpaceToken();
            if (namespaceToken?.value && labelKey?.value && metricNameToken?.value) {
              const values = await this.datasource.getDimensionValues(
                this.templateSrv.replace(this.region),
                this.templateSrv.replace(namespaceToken.value.replace(/\"/g, '')),
                this.templateSrv.replace(metricNameToken.value),
                this.templateSrv.replace(labelKey.value),
                {}
              );
              values.map((o) =>
                addSuggestion(`'${o.value}'`, { insertText: `'${o.value}' `, command: TRIGGER_SUGGEST })
              );
            }
          }
          break;

        case SuggestionKind.LogicalOperators:
          LOGICAL_OPERATORS.map((o) =>
            addSuggestion(`${o}`, {
              insertText: `${o} `,
              command: TRIGGER_SUGGEST,
              sortText: CompletionItemPriority.MediumHigh,
            })
          );
          break;

        case SuggestionKind.WhereKeyword:
          addSuggestion(`${WHERE}`, {
            insertText: `${WHERE} `,
            command: TRIGGER_SUGGEST,
            sortText: CompletionItemPriority.High,
          });
          break;

        case SuggestionKind.ComparisonOperators:
          COMPARISON_OPERATORS.map((o) => addSuggestion(`${o}`, { insertText: `${o} `, command: TRIGGER_SUGGEST }));
          break;

        case SuggestionKind.GroupByKeywords:
          addSuggestion(`${GROUP} ${BY}`, {
            insertText: `${GROUP} ${BY} `,
            command: TRIGGER_SUGGEST,
            sortText: CompletionItemPriority.MediumHigh,
          });
          break;

        case SuggestionKind.OrderByKeywords:
          addSuggestion(`${ORDER} ${BY}`, {
            insertText: `${ORDER} ${BY} `,
            command: TRIGGER_SUGGEST,
            sortText: CompletionItemPriority.Medium,
          });
          break;

        case SuggestionKind.LimitKeyword:
          addSuggestion(LIMIT, { insertText: `${LIMIT} `, sortText: CompletionItemPriority.MediumLow });
          break;

        case SuggestionKind.SortOrderDirectionKeyword:
          [ASC, DESC].map((s) =>
            addSuggestion(s, {
              insertText: `${s} `,
              command: TRIGGER_SUGGEST,
            })
          );
          break;
      }
    }

    // always suggest template variables
    this.templateVariables.map((v) => {
      addSuggestion(v, {
        range,
        label: v,
        insertText: v,
        kind: monaco.languages.CompletionItemKind.Variable,
        sortText: CompletionItemPriority.Low,
      });
    });

    return suggestions;
  }
}
