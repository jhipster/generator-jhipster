import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { upperFirst } from 'lodash-es';
import type { Merge } from 'type-fest';

import type { YoRcConfigValue, YoRcFileContent } from '../constants/yeoman.ts';
import { YO_RC_FILE } from '../constants/yeoman.ts';
import type { Entity } from '../jhipster/types/entity.ts';
import type { YoRcJHipsterContent } from '../jhipster/types/yo-rc.ts';

export const YO_RC_CONFIG_KEY = 'generator-jhipster';

type ConfigWithCreationTimestamp = {
  creationTimestamp?: number;
};

export const mergeYoRcContent = <
  const OldConfig extends YoRcFileContent<YoRcConfigValue, string>,
  const NewConfig extends YoRcFileContent<YoRcConfigValue, string>,
>(
  oldConfig: OldConfig,
  newConfig: NewConfig,
): Merge<OldConfig, NewConfig> => {
  const merged: YoRcFileContent<YoRcConfigValue, string> = { [YO_RC_CONFIG_KEY]: {} as YoRcConfigValue };
  for (const ns of new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)])) {
    merged[ns] = { ...oldConfig[ns], ...newConfig[ns] };
  }
  if ((oldConfig[YO_RC_CONFIG_KEY] as ConfigWithCreationTimestamp)?.creationTimestamp) {
    (merged[YO_RC_CONFIG_KEY] as ConfigWithCreationTimestamp).creationTimestamp = (
      oldConfig[YO_RC_CONFIG_KEY] as ConfigWithCreationTimestamp
    ).creationTimestamp;
  }
  return merged as Merge<OldConfig, NewConfig>;
};

export const readEntityFile = <Content = Entity>(applicationPath: string, entity: string): Content => {
  const entityFile = join(applicationPath, '.jhipster', `${upperFirst(entity)}.json`);
  try {
    return JSON.parse(readFileSync(entityFile, 'utf-8'));
  } catch (error: unknown) {
    throw new Error(`Error reading ${entityFile} file: ${(error as Error).message}`, { cause: error });
  }
};

export const readYoRcFile = <Content extends YoRcConfigValue = YoRcConfigValue>(yoRcPath = '.'): YoRcJHipsterContent<Content> => {
  const yoRcFile = yoRcPath.endsWith(YO_RC_FILE) ? yoRcPath : join(yoRcPath, YO_RC_FILE);
  try {
    return JSON.parse(readFileSync(yoRcFile, 'utf-8'));
  } catch (error: unknown) {
    throw new Error(`Error reading ${yoRcFile} file: ${(error as Error).message}`, { cause: error });
  }
};

export const readCurrentPathYoRcFile = <Content extends YoRcConfigValue = YoRcConfigValue>(): YoRcJHipsterContent<Content> | undefined => {
  try {
    return readYoRcFile(process.cwd());
  } catch {
    return undefined;
  }
};
