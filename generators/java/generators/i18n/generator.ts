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
import { SERVER_MAIN_RES_DIR, SERVER_TEST_RES_DIR } from '../../../generator-constants.js';
import { JavaApplicationGenerator } from '../../generator.ts';

export default class I18NGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('java');
  }

  get writing() {
    return this.asWritingTaskGroup({
      async requiredLanguageFiles({ application }) {
        await this.writeFiles({
          sections: {
            serverI18nFiles: [
              {
                path: SERVER_MAIN_RES_DIR,
                renameTo: data => `${data.srcMainResources}i18n/messages.properties`,
                templates: [`i18n/messages_en.properties`],
              },
            ],
            serverI18nTestFiles: [
              {
                path: SERVER_TEST_RES_DIR,
                renameTo: (data, filePath) => `${data.srcTestResources}${filePath}`,
                templates: [`i18n/messages_en.properties`],
              },
            ],
          },
          context: application,
        });
      },
      async writeI18nFiles({ application }) {
        if (!application.enableTranslation) return;
        const { languagesToGenerateDefinition = [application.nativeLanguageDefinition] } = application;
        await Promise.all(
          languagesToGenerateDefinition.map(async language => {
            if (language.javaLocaleMessageSourceSuffix) {
              await this.writeFiles({
                sections: {
                  serverI18nFiles: [
                    {
                      path: SERVER_MAIN_RES_DIR,
                      renameTo: (data, filePath) => `${data.srcMainResources}${filePath}`,
                      templates: [`i18n/messages_${language.javaLocaleMessageSourceSuffix}.properties`],
                    },
                  ],
                  serverI18nTestFiles: [
                    {
                      path: SERVER_TEST_RES_DIR,
                      renameTo: (data, filePath) => `${data.srcTestResources}${filePath}`,
                      condition: data => !data.skipUserManagement,
                      templates: [`i18n/messages_${language.javaLocaleMessageSourceSuffix}.properties`],
                    },
                  ],
                },
                context: application,
              });
            }
          }),
        );
      },
    });
  }

  get [JavaApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }
}
