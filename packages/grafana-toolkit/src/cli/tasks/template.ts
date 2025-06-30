// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { Task, TaskRunner } from './task';

interface TemplateOptions {}

const templateRunner: TaskRunner<TemplateOptions> = async () => {
  console.log('Template task');
};

export const templateTask = new Task<TemplateOptions>('Template task', templateRunner);
