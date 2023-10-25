import { GENERATOR_NAME } from './export-utils.js';

export const mergeYoRcContent = (oldConfig: Record<string, Record<string, any>>, newConfig: Record<string, Record<string, any>>) => {
  const merged: Record<string, Record<string, any>> = { [GENERATOR_NAME]: {} };
  for (const ns of new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)])) {
    merged[ns] = { ...oldConfig[ns], ...newConfig[ns] };
  }
  if (oldConfig[GENERATOR_NAME]?.creationTimestamp) {
    merged[GENERATOR_NAME].creationTimestamp = oldConfig[GENERATOR_NAME].creationTimestamp;
  }
  return merged;
};
