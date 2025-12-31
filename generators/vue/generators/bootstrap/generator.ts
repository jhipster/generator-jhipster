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
import { createNeedleCallback } from '../../../base-core/support/needles.ts';
import { ClientApplicationGenerator } from '../../../client/generator.ts';
import {
  createDayjsUpdateLanguagesEditFileCallback,
  createWebpackUpdateLanguagesNeedleCallback,
} from '../../../client/support/update-languages.ts';
import { generateLanguagesWebappOptions } from '../../../languages/support/languages.ts';

export default class VueBootstrapGenerator extends ClientApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('client');
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      translations({ application }) {
        application.addLanguageCallbacks.push((_newLanguages, allLanguages) => {
          const { enableTranslation, clientSrcDir, clientI18nDir, clientRootDir } = application;
          if (!enableTranslation) return;

          const { ignoreNeedlesError: ignoreNonExisting } = this;

          this.editFile(`${clientSrcDir}app/shared/config/dayjs.ts`, createDayjsUpdateLanguagesEditFileCallback(allLanguages, true));

          this.editFile(
            `${clientSrcDir}app/shared/config/languages.ts`,
            { ignoreNonExisting },
            createNeedleCallback({
              contentToAdd: generateLanguagesWebappOptions(allLanguages),
              needle: 'jhipster-needle-i18n-language-key-pipe',
            }),
          );

          const generateDateTimeFormat = (language: string): string => `'${language}': {
  short: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' },
  medium: { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', hour: 'numeric', minute: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: 'numeric', minute: 'numeric' },
},`;

          this.editFile(
            `${clientSrcDir}app/shared/config/config.ts`,
            { ignoreNonExisting },
            createNeedleCallback({
              contentToAdd: allLanguages.map(lang => generateDateTimeFormat(lang.languageTag)),
              needle: 'jhipster-needle-i18n-language-date-time-format',
            }),
          );

          if (application.clientBundlerWebpack) {
            this.editFile(
              `${clientRootDir}webpack/webpack.common.js`,
              { ignoreNonExisting },
              createWebpackUpdateLanguagesNeedleCallback(allLanguages, this.relativeDir(clientRootDir, clientI18nDir)),
            );
          }
        });
      },
    });
  }

  get [ClientApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }
}
