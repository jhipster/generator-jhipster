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
import { createNeedleCallback } from '../../../base-core/support/needles.ts';
import { createDayjsUpdateLanguagesEditFileCallback } from '../../../client/support/update-languages.ts';
import { generateLanguagesWebappOptions } from '../../../languages/support/languages.ts';
import { AngularApplicationGenerator } from '../../generator.ts';

export default class BootstrapGenerator extends AngularApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('client');
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      translations({ application }) {
        application.addLanguageCallbacks.push((_newLanguages, allLanguages) => {
          const { enableTranslation, clientSrcDir, clientRootDir, clientBundlerWebpack } = application;
          if (!enableTranslation) return;

          const { ignoreNeedlesError: ignoreNonExisting } = this;

          this.editFile(
            `${clientSrcDir}app/shared/language/find-language-from-key.pipe.ts`,
            { ignoreNonExisting },
            createNeedleCallback({
              contentToAdd: generateLanguagesWebappOptions(allLanguages),
              needle: 'jhipster-needle-i18n-language-key-pipe',
            }),
          );

          this.editFile(
            `${clientSrcDir}app/config/language.constants.ts`,
            { ignoreNonExisting },
            createNeedleCallback({
              contentToAdd: allLanguages.map(lang => `'${lang.languageTag}',`),
              needle: 'jhipster-needle-i18n-language-constant',
            }),
          );

          this.editFile(`${clientSrcDir}app/config/dayjs.ts`, createDayjsUpdateLanguagesEditFileCallback(allLanguages, false));

          const srcRelativePath = this.relativeDir(clientRootDir, clientSrcDir);

          if (clientBundlerWebpack) {
            this.editFile(
              `${clientRootDir}webpack/webpack.custom.js`,
              { ignoreNonExisting },
              createNeedleCallback({
                contentToAdd: allLanguages?.map(
                  language =>
                    `{ pattern: './${srcRelativePath}i18n/${language.languageTag}/*.json', fileName: './i18n/${language.languageTag}.json' },`,
                ),
                needle: 'jhipster-needle-i18n-language-webpack',
              }),
            );
          }
        });
      },
    });
  }

  get [AngularApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }
}
