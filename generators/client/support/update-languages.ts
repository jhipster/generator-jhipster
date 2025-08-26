/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import type { Control } from '../../base/types.ts';
import type { EditFileCallback } from '../../base-core/api.ts';
import type BaseGenerator from '../../base-core/index.ts';
import type { Language } from '../../languages/support/languages.ts';
import type { Application as LanguagesApplication } from '../../languages/types.d.ts';
import type { Application as ClientApplication } from '../types.d.ts';

export type UpdateLanguagesApplication = Pick<
  ClientApplication<any> & LanguagesApplication<any>,
  'clientBundlerWebpack' | 'i18nDir' | 'clientSrcDir' | 'clientRootDir' | 'enableTranslation' | 'languagesDefinition' | 'languages'
>;

export type UpdateClientLanguagesTaskParam = {
  application: UpdateLanguagesApplication;
  control?: Control;
};

export const createDayjsUpdateLanguagesEditFileCallback =
  (languagesDefinition: readonly Language[], commonjs = false): EditFileCallback =>
  content =>
    content.replace(
      /\/\/ jhipster-needle-i18n-language-dayjs-imports[\s\S]+?(?=\/\/ DAYJS CONFIGURATION)/g,
      `// jhipster-needle-i18n-language-dayjs-imports - JHipster will import languages from dayjs here
${[...new Set(languagesDefinition.map(l => l.dayjsLocale))].map(dayjsLocale => `import 'dayjs/${commonjs ? '' : 'esm/'}locale/${dayjsLocale}';`).join('\n')}

`,
    );

/**
 * Update DayJS Locales.
 *
 * @param application
 * @param configurationFile
 * @param commonjs
 */
export function updateLanguagesInDayjsConfigurationTask(
  this: BaseGenerator,
  { application }: UpdateClientLanguagesTaskParam,
  { configurationFile, commonjs = false }: { configurationFile: string; commonjs?: boolean },
): void {
  const { languagesDefinition = [] } = application;
  const { ignoreNeedlesError: ignoreNonExisting } = this;

  this.editFile(configurationFile, { ignoreNonExisting }, createDayjsUpdateLanguagesEditFileCallback(languagesDefinition, commonjs));
}
