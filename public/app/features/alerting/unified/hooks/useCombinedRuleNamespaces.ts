// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import {
  CombinedRule,
  CombinedRuleGroup,
  CombinedRuleNamespace,
  Rule,
  RuleGroup,
  RuleNamespace,
  RulesSource,
} from 'app/types/unified-alerting';
import { RulerRuleDTO, RulerRuleGroupDTO, RulerRulesConfigDTO } from 'app/types/unified-alerting-dto';
import { useMemo, useRef } from 'react';
import {
  getAllRulesSources,
  getRulesSourceByName,
  isCloudRulesSource,
  isGrafanaRulesSource,
} from '../utils/datasource';
import { isAlertingRule, isAlertingRulerRule, isRecordingRulerRule } from '../utils/rules';
import { useUnifiedAlertingSelector } from './useUnifiedAlertingSelector';

interface CacheValue {
  promRules?: RuleNamespace[];
  rulerRules?: RulerRulesConfigDTO | null;
  result: CombinedRuleNamespace[];
}

// this little monster combines prometheus rules and ruler rules to produce a unified data structure
// can limit to a single rules source
export function useCombinedRuleNamespaces(rulesSourceName?: string): CombinedRuleNamespace[] {
  const promRulesResponses = useUnifiedAlertingSelector((state) => state.promRules);
  const rulerRulesResponses = useUnifiedAlertingSelector((state) => state.rulerRules);

  // cache results per rules source, so we only recalculate those for which results have actually changed
  const cache = useRef<Record<string, CacheValue>>({});

  const rulesSources = useMemo((): RulesSource[] => {
    if (rulesSourceName) {
      const rulesSource = getRulesSourceByName(rulesSourceName);
      if (!rulesSource) {
        throw new Error(`Unknown rules source: ${rulesSourceName}`);
      }
      return [rulesSource];
    }
    return getAllRulesSources();
  }, [rulesSourceName]);

  return useMemo(
    () =>
      rulesSources
        .map((rulesSource): CombinedRuleNamespace[] => {
          const rulesSourceName = isCloudRulesSource(rulesSource) ? rulesSource.name : rulesSource;
          const promRules = promRulesResponses[rulesSourceName]?.result;
          const rulerRules = rulerRulesResponses[rulesSourceName]?.result;

          const cached = cache.current[rulesSourceName];
          if (cached && cached.promRules === promRules && cached.rulerRules === rulerRules) {
            return cached.result;
          }
          const namespaces: Record<string, CombinedRuleNamespace> = {};

          // first get all the ruler rules in
          Object.entries(rulerRules || {}).forEach(([namespaceName, groups]) => {
            const namespace: CombinedRuleNamespace = {
              rulesSource,
              name: namespaceName,
              groups: [],
            };
            namespaces[namespaceName] = namespace;
            addRulerGroupsToCombinedNamespace(namespace, groups);
          });

          // then correlate with prometheus rules
          promRules?.forEach(({ name: namespaceName, groups }) => {
            const ns = (namespaces[namespaceName] = namespaces[namespaceName] || {
              rulesSource,
              name: namespaceName,
              groups: [],
            });

            addPromGroupsToCombinedNamespace(ns, groups);
          });

          const result = Object.values(namespaces);
          if (isGrafanaRulesSource(rulesSource)) {
            // merge all groups in case of grafana managed, essentially treating namespaces (folders) as gorups
            result.forEach((namespace) => {
              namespace.groups = [
                {
                  name: 'default',
                  rules: namespace.groups.flatMap((g) => g.rules).sort((a, b) => a.name.localeCompare(b.name)),
                },
              ];
            });
          }
          cache.current[rulesSourceName] = { promRules, rulerRules, result };
          return result;
        })
        .flat(),
    [promRulesResponses, rulerRulesResponses, rulesSources]
  );
}

function addRulerGroupsToCombinedNamespace(namespace: CombinedRuleNamespace, groups: RulerRuleGroupDTO[]): void {
  namespace.groups = groups.map((group) => {
    const combinedGroup: CombinedRuleGroup = {
      name: group.name,
      interval: group.interval,
      rules: [],
    };
    combinedGroup.rules = group.rules.map((rule) => rulerRuleToCombinedRule(rule, namespace, combinedGroup));
    return combinedGroup;
  });
}

function addPromGroupsToCombinedNamespace(namespace: CombinedRuleNamespace, groups: RuleGroup[]): void {
  groups.forEach((group) => {
    let combinedGroup = namespace.groups.find((g) => g.name === group.name);
    if (!combinedGroup) {
      combinedGroup = {
        name: group.name,
        rules: [],
      };
      namespace.groups.push(combinedGroup);
    }

    (group.rules ?? []).forEach((rule) => {
      const existingRule = getExistingRuleInGroup(rule, combinedGroup!, namespace.rulesSource);
      if (existingRule) {
        existingRule.promRule = rule;
      } else {
        combinedGroup!.rules.push(promRuleToCombinedRule(rule, namespace, combinedGroup!));
      }
    });
  });
}

function promRuleToCombinedRule(rule: Rule, namespace: CombinedRuleNamespace, group: CombinedRuleGroup): CombinedRule {
  return {
    name: rule.name,
    query: rule.query,
    labels: rule.labels || {},
    annotations: isAlertingRule(rule) ? rule.annotations || {} : {},
    promRule: rule,
    namespace: namespace,
    group,
  };
}

function rulerRuleToCombinedRule(
  rule: RulerRuleDTO,
  namespace: CombinedRuleNamespace,
  group: CombinedRuleGroup
): CombinedRule {
  return isAlertingRulerRule(rule)
    ? {
        name: rule.alert,
        query: rule.expr,
        labels: rule.labels || {},
        annotations: rule.annotations || {},
        rulerRule: rule,
        namespace,
        group,
      }
    : isRecordingRulerRule(rule)
    ? {
        name: rule.record,
        query: rule.expr,
        labels: rule.labels || {},
        annotations: {},
        rulerRule: rule,
        namespace,
        group,
      }
    : {
        name: rule.grafana_alert.title,
        query: '',
        labels: rule.labels || {},
        annotations: rule.annotations || {},
        rulerRule: rule,
        namespace,
        group,
      };
}

// find existing rule in group that matches the given prom rule
function getExistingRuleInGroup(
  rule: Rule,
  group: CombinedRuleGroup,
  rulesSource: RulesSource
): CombinedRule | undefined {
  if (isGrafanaRulesSource(rulesSource)) {
    // assume grafana groups have only the one rule. check name anyway because paranoid
    return group!.rules.find((existingRule) => existingRule.name === rule.name);
  }
  return (
    // try finding a rule that matches name, labels, annotations and query
    group!.rules.find(
      (existingRule) => !existingRule.promRule && isCombinedRuleEqualToPromRule(existingRule, rule, true)
    ) ??
    // if that fails, try finding a rule that only matches name, labels and annotations.
    // loki & prom can sometimes modify the query so it doesnt match, eg `2 > 1` becomes `1`
    group!.rules.find(
      (existingRule) => !existingRule.promRule && isCombinedRuleEqualToPromRule(existingRule, rule, false)
    )
  );
}

function isCombinedRuleEqualToPromRule(combinedRule: CombinedRule, rule: Rule, checkQuery = true): boolean {
  if (combinedRule.name === rule.name) {
    return (
      JSON.stringify([
        checkQuery ? hashQuery(combinedRule.query) : '',
        combinedRule.labels,
        combinedRule.annotations,
      ]) ===
      JSON.stringify([
        checkQuery ? hashQuery(rule.query) : '',
        rule.labels || {},
        isAlertingRule(rule) ? rule.annotations || {} : {},
      ])
    );
  }
  return false;
}

// there can be slight differences in how prom & ruler render a query, this will hash them accounting for the differences
function hashQuery(query: string) {
  // one of them might be wrapped in parens
  if (query.length > 1 && query[0] === '(' && query[query.length - 1] === ')') {
    query = query.substr(1, query.length - 2);
  }
  // whitespace could be added or removed
  query = query.replace(/\s|\n/g, '');
  // labels matchers can be reordered, so sort the enitre string, esentially comparing just the character counts
  return query.split('').sort().join('');
}
