// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { Task, TaskRunner } from './task';
import { testPlugin, PluginTestOptions } from './plugin/tests';

const pluginTestRunner: TaskRunner<PluginTestOptions> = async (options) => {
  await testPlugin(options);
};

export const pluginTestTask = new Task<PluginTestOptions>('Test plugin', pluginTestRunner);
