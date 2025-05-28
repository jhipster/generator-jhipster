import type { Priority } from 'yeoman-generator';
import type CoreGenerator from '../base-core/generator.js';
import { PRIORITY_NAMES, QUEUE_PREFIX } from '../base/priorities.js';

export const BOOTSTRAP_APPLICATION = 'bootstrapApplication';
export const BOOTSTRAP_APPLICATION_QUEUE = `${QUEUE_PREFIX}${BOOTSTRAP_APPLICATION}`;

export const CUSTOM_PRIORITIES = (
  [
    {
      priorityName: BOOTSTRAP_APPLICATION,
      queueName: BOOTSTRAP_APPLICATION_QUEUE,
      before: PRIORITY_NAMES.LOADING,
      args: ((generator: CoreGenerator) => generator.getArgsForPriority(BOOTSTRAP_APPLICATION)) as any,
    },
  ] satisfies Priority[]
).reverse();
