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
import type BaseGenerator from '../../base/index.mjs';
import { type UpdateClientLanguagesTaskParam, updateLanguagesInDayjsConfigurationTask } from '../../client/support/index.mjs';
import { generateLanguagesWebappOptions } from '../../languages/support/index.mjs';

function updateLanguagesInPipeTask(this: BaseGenerator, { application, control = {} }: UpdateClientLanguagesTaskParam) {
  const { clientSrcDir, languagesDefinition = [] } = application;
  const { ignoreNeedlesError: ignoreNonExisting } = control;
  const newContent = `{
        ${generateLanguagesWebappOptions(languagesDefinition).join(',\n        ')}
      // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object
  };
`;
  this.editFile(`${clientSrcDir}app/shared/language/find-language-from-key.pipe.ts`, { ignoreNonExisting }, content =>
    content.replace(/{\s*('[a-z-]*':)?([^=]*jhipster-needle-i18n-language-key-pipe[^;]*)\};/g, newContent)
  );
}

function updateLanguagesInConstantsTask(this: BaseGenerator, { application, control = {} }: UpdateClientLanguagesTaskParam) {
  const { clientSrcDir, languages } = application;
  const { ignoreNeedlesError: ignoreNonExisting } = control;
  let newContent = 'export const LANGUAGES: string[] = [\n';
  languages?.forEach(lang => {
    newContent += `    '${lang}',\n`;
  });
  newContent += '    // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n];';

  this.editFile(`${clientSrcDir}app/config/language.constants.ts`, { ignoreNonExisting }, content =>
    content.replace(/export.*LANGUAGES.*\[([^\]]*jhipster-needle-i18n-language-constant[^\]]*)\];/g, newContent)
  );
}

function updateLanguagesInWebpackTask(this: BaseGenerator, { application, control = {} }: UpdateClientLanguagesTaskParam) {
  const { clientSrcDir, languages } = application;
  const { ignoreNeedlesError: ignoreNonExisting } = control;
  let newContent = 'groupBy: [\n';
  languages?.forEach(language => {
    newContent += `                    { pattern: "./${clientSrcDir}i18n/${language}/*.json", fileName: "./i18n/${language}.json" },\n`;
  });
  newContent +=
    '                    // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array\n' +
    '                ]';

  this.editFile('webpack/webpack.custom.js', { ignoreNonExisting }, content =>
    content.replace(/groupBy:.*\[([^\]]*jhipster-needle-i18n-language-webpack[^\]]*)\]/g, newContent)
  );
}

export default function updateLanguagesTask(this: BaseGenerator, param: UpdateClientLanguagesTaskParam) {
  updateLanguagesInPipeTask.call(this, param);
  updateLanguagesInConstantsTask.call(this, param);
  updateLanguagesInWebpackTask.call(this, param);
  updateLanguagesInDayjsConfigurationTask.call(this, param, { configurationFile: `${param.application.clientSrcDir}app/config/dayjs.ts` });
}
