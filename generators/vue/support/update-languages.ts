/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import type BaseGenerator from '../../base/index.js';
import { type UpdateClientLanguagesTaskParam, updateLanguagesInDayjsConfigurationTask } from '../../client/support/update-languages.js';
import { generateLanguagesWebappOptions } from '../../languages/support/index.js';

function generateDateTimeFormat(language: string, index: number, length: number): string {
  let config = `  '${language}': {\n`;

  config += '    short: {\n';
  config += "      year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'\n";
  config += '    },\n';
  config += '    medium: {\n';
  config += "      year: 'numeric', month: 'short', day: 'numeric',\n";
  config += "      weekday: 'short', hour: 'numeric', minute: 'numeric'\n";
  config += '    },\n';
  config += '    long: {\n';
  config += "      year: 'numeric', month: 'long', day: 'numeric',\n";
  config += "      weekday: 'long', hour: 'numeric', minute: 'numeric'\n";
  config += '    }\n';
  config += '  }';
  if (index !== length - 1) {
    config += ',';
  }
  config += '\n';
  return config;
}

function updateLanguagesInPipeTask(this: BaseGenerator, { application, control = {} }: UpdateClientLanguagesTaskParam) {
  const { clientSrcDir, languagesDefinition = [] } = application;
  const { ignoreNeedlesError: ignoreNonExisting } = control;
  const newContent = `$1{
  ${generateLanguagesWebappOptions(languagesDefinition).join(',\n  ')},
  // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object
    }`;
  this.editFile(`${clientSrcDir}app/shared/config/languages.ts`, { ignoreNonExisting }, content =>
    content.replace(/(languages =.*)\{([^\]]*jhipster-needle-i18n-language-key-pipe[^}]*)}/g, newContent),
  );
}

function updateLanguagesInConfigTask(this: BaseGenerator, { application, control = {} }: UpdateClientLanguagesTaskParam) {
  const { clientSrcDir, languages } = application;
  const { ignoreNeedlesError: ignoreNonExisting } = control;
  // Add i18n config snippets for all languages
  let i18nConfig = 'const datetimeFormats: IntlDateTimeFormats = {\n';
  languages?.forEach((ln, i) => {
    i18nConfig += generateDateTimeFormat(ln, i, languages.length);
  });
  i18nConfig += '  // jhipster-needle-i18n-language-date-time-format - JHipster will add/remove format options in this object\n';
  i18nConfig += '}';

  this.editFile(`${clientSrcDir}app/shared/config/config.ts`, { ignoreNonExisting }, content =>
    content.replace(/const datetimeFormats.*\{([^\]]*jhipster-needle-i18n-language-date-time-format[^}]*)}/g, i18nConfig),
  );
}

export default function updateLanguagesTask(this: BaseGenerator, taskParam: UpdateClientLanguagesTaskParam) {
  updateLanguagesInPipeTask.call(this, taskParam);
  updateLanguagesInConfigTask.call(this, taskParam);
  updateLanguagesInDayjsConfigurationTask.call(this, taskParam, {
    configurationFile: `${taskParam.application.clientSrcDir}app/shared/config/dayjs.ts`,
    commonjs: true,
  });
}
