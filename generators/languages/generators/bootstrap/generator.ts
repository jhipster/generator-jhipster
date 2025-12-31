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
import { mutateData } from '../../../../lib/utils/object.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { mutateApplication as languagesMutateApplication } from '../../application.ts';
import { mutateEntity as languagesMutateEntity } from '../../entity.ts';
import { CONTEXT_DATA_SUPPORTED_LANGUAGES } from '../../support/constants.ts';
import { type Language, supportedLanguages } from '../../support/languages.ts';
import type {
  Application as LanguagesApplication,
  Config as LanguagesConfig,
  Entity as LanguagesEntity,
  Options as LanguagesOptions,
} from '../../types.ts';

export default class BootstrapGenerator extends BaseApplicationGenerator<
  LanguagesEntity,
  LanguagesApplication<LanguagesEntity>,
  LanguagesConfig,
  LanguagesOptions
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    supportedLanguages.forEach(lang => {
      this.supportedLanguages.set(lang.languageTag, lang);
    });

    await this.dependsOnBootstrap('base-application');
    await this.dependsOnBootstrap('javascript-simple-application');
  }

  get supportedLanguages(): Map<string, Language> {
    return this.getContextData<Map<string, Language>>(CONTEXT_DATA_SUPPORTED_LANGUAGES, { factory: () => new Map() });
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ applicationDefaults }) {
        applicationDefaults({ supportedLanguages: [...this.supportedLanguages.values()] }, languagesMutateApplication);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ application, entity }) {
        mutateData(entity, languagesMutateEntity, {
          i18nKeyPrefix: data => data.i18nKeyPrefix ?? `${application.frontendAppName}.${data.entityTranslationKey}`,
          i18nAlertHeaderPrefix: data =>
            (data.i18nAlertHeaderPrefix ?? data.microserviceAppName)
              ? `${data.microserviceAppName}.${data.entityTranslationKey}`
              : data.i18nKeyPrefix,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareField({ entity, field }) {
        mutateData(field, {
          __override__: false,
          fieldTranslationKey: ({ fieldName }) => `${entity.i18nKeyPrefix}.${fieldName}`,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }
}
