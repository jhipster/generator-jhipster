import type { JHipsterYoRcContent } from '../converters/types.js';
import { GENERATOR_NAME } from './export-utils.js';

export const mergeYoRcContent = (oldConfig: JHipsterYoRcContent, newConfig: JHipsterYoRcContent): JHipsterYoRcContent => {
  // @ts-expect-error partial assignment
  const merged: Partial<JHipsterYoRcContent> = { [GENERATOR_NAME]: {} };
  for (const ns of new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)])) {
    merged[ns] = { ...oldConfig[ns], ...newConfig[ns] };
  }
  if (oldConfig[GENERATOR_NAME]?.creationTimestamp) {
    merged[GENERATOR_NAME]!.creationTimestamp = oldConfig[GENERATOR_NAME].creationTimestamp;
  }
  return merged as JHipsterYoRcContent;
};
