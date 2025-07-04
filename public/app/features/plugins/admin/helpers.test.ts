// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { RemotePlugin, LocalPlugin } from './types';
import { getLocalPluginMock, getRemotePluginMock, getCatalogPluginMock } from './__mocks__';
import { PluginSignatureStatus, PluginSignatureType, PluginType } from '@grafana/data';
import { config } from '@grafana/runtime';
import {
  mapToCatalogPlugin,
  mapRemoteToCatalog,
  mapLocalToCatalog,
  mergeLocalAndRemote,
  mergeLocalsAndRemotes,
  sortPlugins,
  Sorters,
  isLocalPluginVisible,
  isRemotePluginVisible,
} from './helpers';

describe('Plugins/Helpers', () => {
  let remotePlugin: RemotePlugin;
  let localPlugin: LocalPlugin;

  beforeEach(() => {
    remotePlugin = getRemotePluginMock();
    localPlugin = getLocalPluginMock();
  });

  describe('mergeLocalsAndRemotes()', () => {
    const localPlugins = [
      getLocalPluginMock({ id: 'plugin-1' }),
      getLocalPluginMock({ id: 'plugin-2' }),
      getLocalPluginMock({ id: 'plugin-3' }), // only on local
    ];
    const remotePlugins = [
      getRemotePluginMock({ slug: 'plugin-1' }),
      getRemotePluginMock({ slug: 'plugin-2' }),
      getRemotePluginMock({ slug: 'plugin-4' }), // only on remote
    ];

    test('adds all available plugins only once', () => {
      const merged = mergeLocalsAndRemotes(localPlugins, remotePlugins);
      const mergedIds = merged.map(({ id }) => id);

      expect(merged.length).toBe(4);
      expect(mergedIds).toContain('plugin-1');
      expect(mergedIds).toContain('plugin-2');
      expect(mergedIds).toContain('plugin-3');
      expect(mergedIds).toContain('plugin-4');
    });

    test('merges all plugins with their counterpart (if available)', () => {
      const merged = mergeLocalsAndRemotes(localPlugins, remotePlugins);
      const findMerged = (mergedId: string) => merged.find(({ id }) => id === mergedId);

      // Both local & remote counterparts
      expect(findMerged('plugin-1')).toEqual(
        mergeLocalAndRemote(getLocalPluginMock({ id: 'plugin-1' }), getRemotePluginMock({ slug: 'plugin-1' }))
      );
      expect(findMerged('plugin-2')).toEqual(
        mergeLocalAndRemote(getLocalPluginMock({ id: 'plugin-2' }), getRemotePluginMock({ slug: 'plugin-2' }))
      );

      // Only local
      expect(findMerged('plugin-3')).toEqual(mergeLocalAndRemote(getLocalPluginMock({ id: 'plugin-3' })));

      // Only remote
      expect(findMerged('plugin-4')).toEqual(mergeLocalAndRemote(undefined, getRemotePluginMock({ slug: 'plugin-4' })));
    });
  });

  describe('mergeLocalAndRemote()', () => {
    test('merges using mapRemoteToCatalog() if there is only a remote version', () => {
      expect(mergeLocalAndRemote(undefined, remotePlugin)).toEqual(mapRemoteToCatalog(remotePlugin));
    });

    test('merges using mapLocalToCatalog() if there is only a local version', () => {
      expect(mergeLocalAndRemote(localPlugin)).toEqual(mapLocalToCatalog(localPlugin));
    });

    test('merges using mapToCatalogPlugin() if there is both a remote and a local version', () => {
      expect(mergeLocalAndRemote(localPlugin, remotePlugin)).toEqual(mapToCatalogPlugin(localPlugin, remotePlugin));
    });
  });

  describe('mapRemoteToCatalog()', () => {
    test('maps the remote response (GCOM /api/plugins/<id>) to PluginCatalog', () => {
      expect(mapRemoteToCatalog(remotePlugin)).toEqual({
        description: 'Zabbix plugin for Grafana',
        downloads: 33645089,
        hasUpdate: false,
        id: 'alexanderzobnin-zabbix-app',
        info: {
          logos: {
            large: 'https://grafana.com/api/plugins/alexanderzobnin-zabbix-app/versions/4.1.5/logos/large',
            small: 'https://grafana.com/api/plugins/alexanderzobnin-zabbix-app/versions/4.1.5/logos/small',
          },
        },
        error: undefined,
        isCore: false,
        isDev: false,
        isDisabled: false,
        isEnterprise: false,
        isInstalled: false,
        isPublished: true,
        name: 'Zabbix',
        orgName: 'Alexander Zobnin',
        popularity: 0.2111,
        publishedAt: '2016-04-06T20:23:41.000Z',
        signature: 'valid',
        type: 'app',
        updatedAt: '2021-05-18T14:53:01.000Z',
      });
    });

    test('adds the correct signature enum', () => {
      const pluginWithoutSignature = { ...remotePlugin, signatureType: '', versionSignatureType: '' } as RemotePlugin;
      // With only "signatureType" -> valid
      const pluginWithSignature1 = { ...remotePlugin, signatureType: PluginSignatureType.commercial } as RemotePlugin;
      // With only "versionSignatureType" -> valid
      const pluginWithSignature2 = { ...remotePlugin, versionSignatureType: PluginSignatureType.core } as RemotePlugin;

      expect(mapRemoteToCatalog(pluginWithoutSignature).signature).toBe(PluginSignatureStatus.missing);
      expect(mapRemoteToCatalog(pluginWithSignature1).signature).toBe(PluginSignatureStatus.valid);
      expect(mapRemoteToCatalog(pluginWithSignature2).signature).toBe(PluginSignatureStatus.valid);
    });

    test('adds an "isEnterprise" field', () => {
      const enterprisePlugin = { ...remotePlugin, status: 'enterprise' } as RemotePlugin;
      const notEnterprisePlugin = { ...remotePlugin, status: 'unknown' } as RemotePlugin;

      expect(mapRemoteToCatalog(enterprisePlugin).isEnterprise).toBe(true);
      expect(mapRemoteToCatalog(notEnterprisePlugin).isEnterprise).toBe(false);
    });

    test('adds an "isCore" field', () => {
      const corePlugin = { ...remotePlugin, internal: true } as RemotePlugin;
      const notCorePlugin = { ...remotePlugin, internal: false } as RemotePlugin;

      expect(mapRemoteToCatalog(corePlugin).isCore).toBe(true);
      expect(mapRemoteToCatalog(notCorePlugin).isCore).toBe(false);
    });
  });

  describe('mapLocalToCatalog()', () => {
    test('maps local response to PluginCatalog', () => {
      expect(mapLocalToCatalog(localPlugin)).toEqual({
        description: 'Zabbix plugin for Grafana',
        downloads: 0,
        id: 'alexanderzobnin-zabbix-app',
        info: {
          logos: {
            large: 'public/plugins/alexanderzobnin-zabbix-app/img/icn-zabbix-app.svg',
            small: 'public/plugins/alexanderzobnin-zabbix-app/img/icn-zabbix-app.svg',
          },
        },
        error: undefined,
        hasUpdate: false,
        isCore: false,
        isDev: false,
        isDisabled: false,
        isEnterprise: false,
        isInstalled: true,
        isPublished: false,
        name: 'Zabbix',
        orgName: 'Alexander Zobnin',
        popularity: 0,
        publishedAt: '',
        signature: 'valid',
        signatureOrg: 'Alexander Zobnin',
        signatureType: 'community',
        type: 'app',
        updatedAt: '2021-08-25',
        installedVersion: '4.2.2',
      });
    });

    test('isCore if signature is internal', () => {
      const pluginWithoutInternalSignature = { ...localPlugin };
      const pluginWithInternalSignature = { ...localPlugin, signature: 'internal' } as LocalPlugin;
      expect(mapLocalToCatalog(pluginWithoutInternalSignature).isCore).toBe(false);
      expect(mapLocalToCatalog(pluginWithInternalSignature).isCore).toBe(true);
    });

    test('isDev if local.dev', () => {
      const pluginWithoutDev = { ...localPlugin, dev: false };
      const pluginWithDev = { ...localPlugin, dev: true };
      expect(mapLocalToCatalog(pluginWithoutDev).isDev).toBe(false);
      expect(mapLocalToCatalog(pluginWithDev).isDev).toBe(true);
    });
  });

  describe('mapToCatalogPlugin()', () => {
    test('merges local and remote plugin data correctly', () => {
      expect(mapToCatalogPlugin(localPlugin, remotePlugin)).toEqual({
        description: 'Zabbix plugin for Grafana',
        downloads: 33645089,
        hasUpdate: false,
        id: 'alexanderzobnin-zabbix-app',
        info: {
          logos: {
            small: 'https://grafana.com/api/plugins/alexanderzobnin-zabbix-app/versions/4.1.5/logos/small',
            large: 'https://grafana.com/api/plugins/alexanderzobnin-zabbix-app/versions/4.1.5/logos/large',
          },
        },
        error: undefined,
        isCore: false,
        isDev: false,
        isDisabled: false,
        isEnterprise: false,
        isInstalled: true,
        isPublished: true,
        name: 'Zabbix',
        orgName: 'Alexander Zobnin',
        popularity: 0.2111,
        publishedAt: '2016-04-06T20:23:41.000Z',
        signature: 'valid',
        signatureOrg: 'Alexander Zobnin',
        signatureType: 'community',
        type: 'app',
        updatedAt: '2021-05-18T14:53:01.000Z',
        installedVersion: '4.2.2',
      });
    });

    test('`.description` - prefers the local', () => {
      // Local & Remote
      expect(
        mapToCatalogPlugin(
          { ...localPlugin, info: { ...localPlugin.info, description: 'Local description' } },
          { ...remotePlugin, description: 'Remote description' }
        )
      ).toMatchObject({ description: 'Local description' });

      // Remote only
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, description: 'Remote description' })).toMatchObject({
        description: 'Remote description',
      });

      // Local only
      expect(
        mapToCatalogPlugin({ ...localPlugin, info: { ...localPlugin.info, description: 'Local description' } })
      ).toMatchObject({ description: 'Local description' });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ description: '' });
    });

    test('`.hasUpdate` - prefers the local', () => {
      // Local only
      expect(mapToCatalogPlugin({ ...localPlugin })).toMatchObject({ hasUpdate: false });
      expect(mapToCatalogPlugin({ ...localPlugin, hasUpdate: true })).toMatchObject({ hasUpdate: true });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ hasUpdate: false });
    });

    test('`.downloads` - relies on the remote', () => {
      // Local & Remote
      expect(mapToCatalogPlugin(localPlugin, { ...remotePlugin, downloads: 99 })).toMatchObject({ downloads: 99 });

      // Remote only
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, downloads: 99 })).toMatchObject({ downloads: 99 });

      // Local only
      expect(mapToCatalogPlugin(localPlugin)).toMatchObject({ downloads: 0 });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ downloads: 0 });
    });

    test('`.isCore` - prefers the remote', () => {
      // Local & Remote
      expect(mapToCatalogPlugin(localPlugin, { ...remotePlugin, internal: true })).toMatchObject({ isCore: true });

      // Remote only
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, internal: true })).toMatchObject({ isCore: true });
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, internal: false })).toMatchObject({ isCore: false });

      // Local only
      expect(mapToCatalogPlugin({ ...localPlugin, signature: PluginSignatureStatus.internal })).toMatchObject({
        isCore: true,
      });
      expect(mapToCatalogPlugin({ ...localPlugin, signature: PluginSignatureStatus.valid })).toMatchObject({
        isCore: false,
      });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ isCore: false });
    });

    test('`.isDev` - prefers the local', () => {
      // Local & Remote
      expect(mapToCatalogPlugin({ ...localPlugin, dev: true }, remotePlugin)).toMatchObject({ isDev: true });

      // Remote only
      expect(mapToCatalogPlugin(undefined, remotePlugin)).toMatchObject({ isDev: false });

      // Local only
      expect(mapToCatalogPlugin({ ...localPlugin, dev: true }, undefined)).toMatchObject({ isDev: true });
      expect(mapToCatalogPlugin({ ...localPlugin, dev: undefined }, undefined)).toMatchObject({ isDev: false });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ isDev: false });
    });

    test('`.isEnterprise` - prefers the remote', () => {
      // Local & Remote
      expect(mapToCatalogPlugin(localPlugin, { ...remotePlugin, status: 'enterprise' })).toMatchObject({
        isEnterprise: true,
      });
      expect(mapToCatalogPlugin(localPlugin, { ...remotePlugin, status: 'unknown' })).toMatchObject({
        isEnterprise: false,
      });

      // Remote only
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, status: 'enterprise' })).toMatchObject({
        isEnterprise: true,
      });

      // Local only
      expect(mapToCatalogPlugin(localPlugin)).toMatchObject({ isEnterprise: false });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ isEnterprise: false });
    });

    test('`.isInstalled` - prefers the local', () => {
      // Local & Remote
      expect(mapToCatalogPlugin(localPlugin, remotePlugin)).toMatchObject({ isInstalled: true });

      // Remote only
      expect(mapToCatalogPlugin(undefined, remotePlugin)).toMatchObject({ isInstalled: false });

      // Local only
      expect(mapToCatalogPlugin(localPlugin, undefined)).toMatchObject({ isInstalled: true });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ isInstalled: false });
    });

    test('`.name` - prefers the remote', () => {
      // Local & Remote
      expect(
        mapToCatalogPlugin({ ...localPlugin, name: 'Local name' }, { ...remotePlugin, name: 'Remote name' })
      ).toMatchObject({ name: 'Remote name' });

      // Remote only
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, name: 'Remote name' })).toMatchObject({
        name: 'Remote name',
      });

      // Local only
      expect(mapToCatalogPlugin({ ...localPlugin, name: 'Local name' })).toMatchObject({ name: 'Local name' });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ name: '' });
    });

    test('`.orgName` - prefers the remote', () => {
      // Local & Remote
      expect(mapToCatalogPlugin(localPlugin, { ...remotePlugin, orgName: 'Remote org' })).toMatchObject({
        orgName: 'Remote org',
      });

      // Remote only
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, orgName: 'Remote org' })).toMatchObject({
        orgName: 'Remote org',
      });

      // Local only
      expect(mapToCatalogPlugin(localPlugin)).toMatchObject({ orgName: 'Alexander Zobnin' });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ orgName: '' });
    });

    test('`.popularity` - prefers the remote', () => {
      // Local & Remote
      expect(mapToCatalogPlugin(localPlugin, { ...remotePlugin, popularity: 10 })).toMatchObject({ popularity: 10 });

      // Remote only
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, popularity: 10 })).toMatchObject({ popularity: 10 });

      // Local only
      expect(mapToCatalogPlugin(localPlugin)).toMatchObject({ popularity: 0 });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ popularity: 0 });
    });

    test('`.publishedAt` - prefers the remote', () => {
      // Local & Remote
      expect(mapToCatalogPlugin(localPlugin, { ...remotePlugin, createdAt: '2020-01-01' })).toMatchObject({
        publishedAt: '2020-01-01',
      });

      // Remote only
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, createdAt: '2020-01-01' })).toMatchObject({
        publishedAt: '2020-01-01',
      });

      // Local only
      expect(mapToCatalogPlugin(localPlugin)).toMatchObject({ publishedAt: '' });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ publishedAt: '' });
    });

    test('`.type` - prefers the local', () => {
      // Local & Remote
      expect(
        mapToCatalogPlugin(
          { ...localPlugin, type: PluginType.app },
          { ...remotePlugin, typeCode: PluginType.datasource }
        )
      ).toMatchObject({
        type: PluginType.app,
      });

      // Remote only
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, typeCode: PluginType.datasource })).toMatchObject({
        type: PluginType.datasource,
      });

      // Local only
      expect(mapToCatalogPlugin({ ...localPlugin, type: PluginType.app })).toMatchObject({
        type: PluginType.app,
      });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ type: undefined });
    });

    test('`.signature` - prefers the local', () => {
      // Local & Remote
      expect(
        mapToCatalogPlugin(
          { ...localPlugin, signature: PluginSignatureStatus.valid },
          { ...remotePlugin, signatureType: '', versionSignatureType: '' }
        )
      ).toMatchObject({
        signature: PluginSignatureStatus.valid,
      });
      expect(
        mapToCatalogPlugin(
          { ...localPlugin, signature: PluginSignatureStatus.missing },
          {
            ...remotePlugin,
            signatureType: PluginSignatureType.grafana,
            versionSignatureType: PluginSignatureType.grafana,
          }
        )
      ).toMatchObject({
        signature: PluginSignatureStatus.missing,
      });

      // Remote only
      expect(
        mapToCatalogPlugin(undefined, { ...remotePlugin, signatureType: PluginSignatureType.grafana })
      ).toMatchObject({
        signature: PluginSignatureStatus.valid,
      });
      expect(
        mapToCatalogPlugin(undefined, { ...remotePlugin, versionSignatureType: PluginSignatureType.grafana })
      ).toMatchObject({
        signature: PluginSignatureStatus.valid,
      });
      expect(
        mapToCatalogPlugin(undefined, { ...remotePlugin, signatureType: '', versionSignatureType: '' })
      ).toMatchObject({
        signature: PluginSignatureStatus.missing,
      });

      // Local only
      expect(mapToCatalogPlugin({ ...localPlugin, signature: PluginSignatureStatus.valid })).toMatchObject({
        signature: PluginSignatureStatus.valid,
      });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ signature: PluginSignatureStatus.missing });
    });

    test('`.signatureOrg` - prefers the local', () => {
      // Local & Remote
      expect(
        mapToCatalogPlugin(
          { ...localPlugin, signatureOrg: 'Local Org' },
          { ...remotePlugin, versionSignedByOrgName: 'Remote Org' }
        )
      ).toMatchObject({
        signatureOrg: 'Local Org',
      });

      // Remote only
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, versionSignedByOrgName: 'Remote Org' })).toMatchObject({
        signatureOrg: 'Remote Org',
      });

      // Local only
      expect(mapToCatalogPlugin({ ...localPlugin, signatureOrg: 'Local Org' })).toMatchObject({
        signatureOrg: 'Local Org',
      });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ signatureOrg: undefined });
    });

    test('`.signatureType` - prefers the local', () => {
      // Local & Remote
      expect(
        mapToCatalogPlugin(
          { ...localPlugin, signatureType: PluginSignatureType.core },
          { ...remotePlugin, signatureType: PluginSignatureType.grafana }
        )
      ).toMatchObject({
        signatureType: PluginSignatureType.core,
      });

      // Remote only
      expect(
        mapToCatalogPlugin(undefined, {
          ...remotePlugin,
          versionSignatureType: PluginSignatureType.core,
          signatureType: PluginSignatureType.grafana,
        })
      ).toMatchObject({
        signatureType: PluginSignatureType.core,
      });
      expect(
        mapToCatalogPlugin(undefined, {
          ...remotePlugin,
          versionSignatureType: '',
          signatureType: PluginSignatureType.grafana,
        })
      ).toMatchObject({
        signatureType: PluginSignatureType.grafana,
      });

      // Local only
      expect(mapToCatalogPlugin({ ...localPlugin, signatureType: PluginSignatureType.core })).toMatchObject({
        signatureType: PluginSignatureType.core,
      });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ signatureType: undefined });
    });

    test('`.updatedAt` - prefers the remote', () => {
      // Local & Remote
      expect(
        mapToCatalogPlugin(
          { ...localPlugin, info: { ...localPlugin.info, updated: '2019-01-01' } },
          { ...remotePlugin, updatedAt: '2020-01-01' }
        )
      ).toMatchObject({
        updatedAt: '2020-01-01',
      });

      // Remote only
      expect(mapToCatalogPlugin(undefined, { ...remotePlugin, updatedAt: '2020-01-01' })).toMatchObject({
        updatedAt: '2020-01-01',
      });

      // Local only
      expect(
        mapToCatalogPlugin({ ...localPlugin, info: { ...localPlugin.info, updated: '2019-01-01' } })
      ).toMatchObject({
        updatedAt: '2019-01-01',
      });

      // No local or remote
      expect(mapToCatalogPlugin()).toMatchObject({ updatedAt: '' });
    });
  });

  describe('sortPlugins()', () => {
    test('should be possible to sort by `name` ASC', () => {
      const sorted = sortPlugins(
        [
          getCatalogPluginMock({ id: 'zabbix', name: 'Zabbix' }),
          getCatalogPluginMock({ id: 'snowflake', name: 'Snowflake' }),
          getCatalogPluginMock({ id: 'jira', name: 'Jira' }),
          getCatalogPluginMock({ id: 'pie-chart', name: 'Pie Chart' }),
          getCatalogPluginMock({ id: 'cloud-watch', name: 'CloudWatch' }),
        ],
        Sorters.nameAsc
      );

      expect(sorted.map(({ name }) => name)).toEqual(['CloudWatch', 'Jira', 'Pie Chart', 'Snowflake', 'Zabbix']);
    });

    test('should be possible to sort by `name` DESC', () => {
      const sorted = sortPlugins(
        [
          getCatalogPluginMock({ id: 'zabbix', name: 'Zabbix' }),
          getCatalogPluginMock({ id: 'snowflake', name: 'Snowflake' }),
          getCatalogPluginMock({ id: 'jira', name: 'Jira' }),
          getCatalogPluginMock({ id: 'pie-chart', name: 'Pie Chart' }),
          getCatalogPluginMock({ id: 'cloud-watch', name: 'CloudWatch' }),
        ],
        Sorters.nameDesc
      );

      expect(sorted.map(({ name }) => name)).toEqual(['Zabbix', 'Snowflake', 'Pie Chart', 'Jira', 'CloudWatch']);
    });

    test('should be possible to sort by `updated` (latest first)', () => {
      const sorted = sortPlugins(
        [
          getCatalogPluginMock({ id: 'zabbix', updatedAt: '2010-01-01' }),
          getCatalogPluginMock({ id: 'snowflake', updatedAt: '2012-01-01' }),
          getCatalogPluginMock({ id: 'jira', updatedAt: '2005-01-01' }),
          getCatalogPluginMock({ id: 'pie-chart', updatedAt: '2021-01-01' }),
          getCatalogPluginMock({ id: 'cloud-watch', updatedAt: '2009-01-01' }),
        ],
        Sorters.updated
      );

      expect(sorted.map(({ id }) => id)).toEqual(['pie-chart', 'snowflake', 'zabbix', 'cloud-watch', 'jira']);
    });

    test('should be possible to sort by `published` (latest first)', () => {
      const sorted = sortPlugins(
        [
          getCatalogPluginMock({ id: 'zabbix', publishedAt: '2010-01-01' }),
          getCatalogPluginMock({ id: 'snowflake', publishedAt: '2012-01-01' }),
          getCatalogPluginMock({ id: 'jira', publishedAt: '2005-01-01' }),
          getCatalogPluginMock({ id: 'pie-chart', publishedAt: '2021-01-01' }),
          getCatalogPluginMock({ id: 'cloud-watch', publishedAt: '2009-01-01' }),
        ],
        Sorters.published
      );

      expect(sorted.map(({ id }) => id)).toEqual(['pie-chart', 'snowflake', 'zabbix', 'cloud-watch', 'jira']);
    });

    test('should be possible to sort by `downloads` (greatest first)', () => {
      const sorted = sortPlugins(
        [
          getCatalogPluginMock({ id: 'zabbix', downloads: 30 }),
          getCatalogPluginMock({ id: 'snowflake', downloads: 10 }),
          getCatalogPluginMock({ id: 'jira', downloads: 100 }),
          getCatalogPluginMock({ id: 'pie-chart', downloads: 350 }),
          getCatalogPluginMock({ id: 'cloud-watch', downloads: 200 }),
        ],
        Sorters.downloads
      );

      expect(sorted.map(({ id }) => id)).toEqual(['pie-chart', 'cloud-watch', 'jira', 'zabbix', 'snowflake']);
    });
  });

  describe('isLocalPluginVisible()', () => {
    test('should return TRUE if the plugin is not listed as hidden in the main Grafana configuration', () => {
      config.pluginCatalogHiddenPlugins = ['akumuli-datasource'];
      const plugin = getLocalPluginMock({
        id: 'barchart',
      });

      expect(isLocalPluginVisible(plugin)).toBe(true);
    });

    test('should return FALSE if the plugin is listed as hidden in the main Grafana configuration', () => {
      config.pluginCatalogHiddenPlugins = ['akumuli-datasource'];
      const plugin = getLocalPluginMock({
        id: 'akumuli-datasource',
      });

      expect(isLocalPluginVisible(plugin)).toBe(false);
    });
  });

  describe('isRemotePluginVisible()', () => {
    test('should return TRUE if the plugin is not listed as hidden in the main Grafana configuration', () => {
      config.pluginCatalogHiddenPlugins = ['akumuli-datasource'];
      const plugin = getRemotePluginMock({
        slug: 'barchart',
      });

      expect(isRemotePluginVisible(plugin)).toBe(true);
    });

    test('should return FALSE if the plugin is listed as hidden in the main Grafana configuration', () => {
      config.pluginCatalogHiddenPlugins = ['akumuli-datasource'];
      const plugin = getRemotePluginMock({
        slug: 'akumuli-datasource',
      });

      expect(isRemotePluginVisible(plugin)).toBe(false);
    });
  });
});
