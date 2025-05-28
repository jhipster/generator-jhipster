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
import type { CommonClientServerApplication } from '../../../lib/types/application/application.js';
import type BaseGenerator from '../../base-core/index.js';

type UpdateLanguagesApplication = Pick<
  CommonClientServerApplication<any>,
  'clientBundlerWebpack' | 'clientSrcDir' | 'clientRootDir' | 'enableTranslation' | 'languagesDefinition' | 'languages'
>;

export type UpdateClientLanguagesTaskParam = {
  application: UpdateLanguagesApplication;
  control?: any;
};

/**
 * Update DayJS Locales.
 *
 * @param application
 * @param configurationFile
 * @param commonjs
 */

export function updateLanguagesInDayjsConfigurationTask(
  this: BaseGenerator<any, any, any, any, any>,
  { application, control = {} }: UpdateClientLanguagesTaskParam,
  { configurationFile, commonjs = false }: { configurationFile: string; commonjs?: boolean },
): void {
  const { languagesDefinition = [] } = application;
  const { ignoreNeedlesError: ignoreNonExisting } = control;

  const uniqueDayjsLocales = [...new Map(languagesDefinition.map(v => [v.dayjsLocale, v])).values()];
  const newContent = uniqueDayjsLocales.reduce(
    // FIXME types
    (content, language) => `${content}import 'dayjs/${commonjs ? '' : 'esm/'}locale/${(language as any).dayjsLocale}'\n`,
    '// jhipster-needle-i18n-language-dayjs-imports - JHipster will import languages from dayjs here\n',
  );

  this.editFile(configurationFile, { ignoreNonExisting }, content =>
    content.replace(/\/\/ jhipster-needle-i18n-language-dayjs-imports[\s\S]+?(?=\/\/ DAYJS CONFIGURATION)/g, `${newContent}\n`),
  );
}
