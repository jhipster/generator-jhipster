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
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** The conditions of the keys of a translation, by their path: a key is left out when its condition does not hold. */
export type TranslationConditions<Options> = Record<string, (options: Options) => boolean | undefined>;

/** The source of a translation file: a template, rendered, or a JSON file, read. */
export type TranslationSource = { path: string; template: boolean };

/**
 * The source of a translation file, like `src/main/webapp/i18n/<language>/global.json`, in the first of the folders that has
 * it, the folders of the blueprints first: its template, `<file>.ejs`, before its JSON file.
 */
export const findTranslationSource = (folders: string[], sourceFile: string): TranslationSource | undefined =>
  folders
    .flatMap(folder => [
      { path: join(folder, `${sourceFile}.ejs`), template: true },
      { path: join(folder, sourceFile), template: false },
    ])
    .find(({ path }) => existsSync(path));

const replaceNames = (value: unknown, names: Record<string, string>): unknown => {
  if (typeof value === 'string') {
    return Object.entries(names).reduce((text, [name, replacement]) => text.replaceAll(`{${name}}`, replacement), value);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceNames(item, names)]));
  }
  return value;
};

/**
 * A translation with the names it takes, written `{name}` in its texts, and without the keys whose conditions do not hold
 * for the options.
 */
export const prepareTranslation = <Options>(
  translation: Record<string, any>,
  {
    names = {},
    conditions = {},
    options,
  }: { names?: Record<string, string>; conditions?: TranslationConditions<Options>; options?: Options } = {},
): Record<string, any> => {
  const prepared = replaceNames(translation, names) as Record<string, any>;
  for (const [path, condition] of Object.entries(conditions)) {
    if (!condition(options as Options)) {
      const keys = path.split('.');
      const key = keys.pop()!;
      const parent = keys.reduce<Record<string, any> | undefined>((object, name) => object?.[name], prepared);
      if (parent) {
        delete parent[key];
      }
    }
  }
  return prepared;
};
