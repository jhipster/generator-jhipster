import { GENERATOR_NAME } from './export-utils.js';
import { YoRCJSONObject } from '../converters/types.js';

export const mergeYoRcContent = (oldConfig: YoRCJSONObject, newConfig: YoRCJSONObject): YoRCJSONObject => {
  // @ts-expect-error partial assignment
  const merged: Partial<YoRCJSONObject> = { [GENERATOR_NAME]: {} };
  for (const ns of new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)])) {
    merged[ns] = { ...oldConfig[ns], ...newConfig[ns] };
  }
  if (oldConfig[GENERATOR_NAME]?.creationTimestamp) {
    merged[GENERATOR_NAME]!.creationTimestamp = oldConfig[GENERATOR_NAME].creationTimestamp;
  }
  return merged as YoRCJSONObject;
};
