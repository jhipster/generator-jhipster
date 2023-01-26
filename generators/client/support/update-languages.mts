/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import BaseGenerator from '../../base/generator.mjs';
import { ClientApplication } from '../types.mjs';

export type UpdateClientLanguagesTaskParam = { application: ClientApplication & { enableTranslation: true }; control?: any };

/**
 * Update DayJS Locales.
 *
 * @param application
 * @param configurationFile
 * @param commonjs
 */
// eslint-disable-next-line import/prefer-default-export
export function updateLanguagesInDayjsConfigurationTask(
  this: BaseGenerator,
  { application, control = {} }: UpdateClientLanguagesTaskParam,
  { configurationFile, commonjs = false }: { configurationFile: string; commonjs?: boolean }
): void {
  const { languagesDefinition = [] } = application;
  const { ignoreNeedlesError: ignoreNonExisting } = control;

  const newContent = languagesDefinition.reduce(
    (content, language) => `${content}import 'dayjs/${commonjs ? '' : 'esm/'}locale/${language.dayjsLocale}'\n`,
    '// jhipster-needle-i18n-language-dayjs-imports - JHipster will import languages from dayjs here\n'
  );

  this.editFile(configurationFile, { ignoreNonExisting }, content =>
    content.replace(/\/\/ jhipster-needle-i18n-language-dayjs-imports[\s\S]+?(?=\/\/ DAYJS CONFIGURATION)/g, `${newContent}\n`)
  );
}
