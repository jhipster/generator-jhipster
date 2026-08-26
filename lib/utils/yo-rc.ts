/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { upperFirst } from 'lodash-es';
import type { Merge } from 'type-fest';

import { YO_RC_FILE, type YoRcConfigValue, type YoRcFileContent } from '../constants/yeoman.ts';
import type { Entity } from '../jhipster/types/entity.ts';
import type { YoRcJHipsterContent } from '../jhipster/types/yo-rc.ts';

export const YO_RC_CONFIG_KEY = 'generator-jhipster';

type ConfigWithCreationTimestamp = {
  creationTimestamp?: number;
};

export const mergeYoRcContent = <const OldConfig extends YoRcFileContent, const NewConfig extends YoRcFileContent>(
  oldConfig: OldConfig,
  newConfig: NewConfig,
): Merge<OldConfig, NewConfig> => {
  const merged: YoRcFileContent = { [YO_RC_CONFIG_KEY]: {} };
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
