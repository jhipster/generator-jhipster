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
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { SERVER_MAIN_RES_DIR, SERVER_TEST_RES_DIR } from '../../../generator-constants.ts';
import type { Application as ServerApplication, Entity as ServerEntity } from '../../types.ts';

/**
 * Writes the messages of the server, the e-mails of the accounts among them, to the `serverI18nDir` of the application:
 * `messages.properties`, and a file by language with the translation enabled. The test copies go to `serverI18nTestDir`
 * when the application has one.
 */
export default class ServerI18NGenerator extends BaseApplicationGenerator<ServerEntity, ServerApplication> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('languages');
    await this.dependsOnBootstrap('server');
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeMessages({ application }) {
        const { serverI18nDir, serverI18nTestDir, enableTranslation, skipUserManagement } = application;
        if (!serverI18nDir) return;
        const { languagesToGenerateDefinition = [application.nativeLanguageDefinition] } = application;
        const suffixes =
          enableTranslation ?
            languagesToGenerateDefinition.flatMap(language =>
              language?.javaLocaleMessageSourceSuffix ? [language.javaLocaleMessageSourceSuffix] : [],
            )
          : [];
        // The test copies have templates of their own.
        const file = (suffix: string, { test = false, destination = `messages_${suffix}.properties` } = {}) => ({
          path: test ? SERVER_TEST_RES_DIR : SERVER_MAIN_RES_DIR,
          renameTo: () => `${test ? serverI18nTestDir : serverI18nDir}${destination}`,
          templates: [`i18n/messages_${suffix}.properties`],
        });
        await this.writeFiles({
          blocks: [
            file('en', { destination: 'messages.properties' }),
            ...suffixes.map(suffix => file(suffix)),
            ...(serverI18nTestDir ?
              [file('en', { test: true }), ...(skipUserManagement ? [] : suffixes.map(suffix => file(suffix, { test: true })))]
            : []),
          ],
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }
}
