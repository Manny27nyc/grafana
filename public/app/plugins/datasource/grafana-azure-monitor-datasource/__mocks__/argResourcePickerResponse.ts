// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { AzureGraphResponse, RawAzureResourceGroupItem, RawAzureResourceItem } from '../types';

export const createMockARGResourceContainersResponse = (): AzureGraphResponse<RawAzureResourceGroupItem[]> => ({
  data: [
    {
      subscriptionURI: '/subscriptions/abc-123',
      subscriptionName: 'Primary Subscription',
      resourceGroupURI: '/subscriptions/abc-123/resourceGroups/prod',
      resourceGroupName: 'Production',
    },

    {
      subscriptionURI: '/subscriptions/def-456',
      subscriptionName: 'Dev Subscription',
      resourceGroupURI: '/subscriptions/def-456/resourceGroups/dev',
      resourceGroupName: 'Development',
    },

    {
      subscriptionURI: '/subscriptions/def-456',
      subscriptionName: 'Dev Subscription',
      resourceGroupURI: '/subscriptions/def-456/resourceGroups/test',
      resourceGroupName: 'Test',
    },

    {
      subscriptionURI: '/subscriptions/abc-123',
      subscriptionName: 'Primary Subscription',
      resourceGroupURI: '/subscriptions/abc-123/resourceGroups/test',
      resourceGroupName: 'Test',
    },

    {
      subscriptionURI: '/subscriptions/abc-123',
      subscriptionName: 'Primary Subscription',
      resourceGroupURI: '/subscriptions/abc-123/resourceGroups/pre-prod',
      resourceGroupName: 'Pre-production',
    },

    {
      subscriptionURI: '/subscriptions/def-456',
      subscriptionName: 'Dev Subscription',
      resourceGroupURI: '/subscriptions/def-456/resourceGroups/qa',
      resourceGroupName: 'QA',
    },
  ],
});

export const createARGResourcesResponse = (): AzureGraphResponse<RawAzureResourceItem[]> => ({
  data: [
    {
      id: '/subscriptions/def-456/resourceGroups/dev/providers/Microsoft.Compute/virtualMachines/web-server',
      name: 'web-server',
      type: 'Microsoft.Compute/virtualMachines',
      resourceGroup: 'dev',
      subscriptionId: 'def-456',
      location: 'northeurope',
    },

    {
      id: '/subscriptions/def-456/resourceGroups/dev/providers/Microsoft.Compute/disks/web-server_DataDisk',
      name: 'web-server_DataDisk',
      type: 'Microsoft.Compute/disks',
      resourceGroup: 'dev',
      subscriptionId: 'def-456',
      location: 'northeurope',
    },

    {
      id: '/subscriptions/def-456/resourceGroups/dev/providers/Microsoft.Compute/virtualMachines/db-server',
      name: 'db-server',
      type: 'Microsoft.Compute/virtualMachines',
      resourceGroup: 'dev',
      subscriptionId: 'def-456',
      location: 'northeurope',
    },

    {
      id: '/subscriptions/def-456/resourceGroups/dev/providers/Microsoft.Compute/disks/db-server_DataDisk',
      name: 'db-server_DataDisk',
      type: 'Microsoft.Compute/disks',
      resourceGroup: 'dev',
      subscriptionId: 'def-456',
      location: 'northeurope',
    },
  ],
});
