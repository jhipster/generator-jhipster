import { readFileSync } from 'fs';
import { join } from 'path';
import { upperFirst } from 'lodash-es';
import type { ConfigAll, YoRcContent } from '../types/application-config-all.js';
import type { Entity } from '../jhipster/types/entity.js';

export const YO_RC_CONFIG_KEY = 'generator-jhipster';

export const YO_RC_FILE = '.yo-rc.json';

export const mergeYoRcContent = <const Content = ConfigAll>(
  oldConfig: YoRcContent<Content>,
  newConfig: YoRcContent<Content>,
): YoRcContent<Content> => {
  const merged: YoRcContent<Content> = { [YO_RC_CONFIG_KEY]: {} } as any;
  for (const ns of new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)])) {
    merged[ns] = { ...oldConfig[ns], ...newConfig[ns] };
  }
  if ((oldConfig[YO_RC_CONFIG_KEY] as any)?.creationTimestamp) {
    (merged[YO_RC_CONFIG_KEY] as any)!.creationTimestamp = (oldConfig[YO_RC_CONFIG_KEY] as any).creationTimestamp;
  }
  return merged;
};

export const readEntityFile = <Content = Entity>(applicationPath: string, entity: string): Content => {
  const entityFile = join(applicationPath, '.jhipster', `${upperFirst(entity)}.json`);
  try {
    return JSON.parse(readFileSync(entityFile, 'utf-8'));
  } catch (error: unknown) {
    throw new Error(`Error reading ${entityFile} file: ${(error as Error).message}`, { cause: error });
  }
};

export const readYoRcFile = <Content = ConfigAll>(yoRcPath = '.'): YoRcContent<Content> => {
  const yoRcFile = yoRcPath.endsWith(YO_RC_FILE) ? yoRcPath : join(yoRcPath, YO_RC_FILE);
  try {
    return JSON.parse(readFileSync(yoRcFile, 'utf-8'));
  } catch (error: unknown) {
    throw new Error(`Error reading ${yoRcFile} file: ${(error as Error).message}`, { cause: error });
  }
};

export const readCurrentPathYoRcFile = <Content = ConfigAll>(): YoRcContent<Content> | undefined => {
  try {
    return readYoRcFile(process.cwd());
  } catch {
    return undefined;
  }
};
