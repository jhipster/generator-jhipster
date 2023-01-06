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
import { clientApplicationBlock, replaceEntityFilePath, CLIENT_TEMPLATES_APP_DIR, clientAppTestBlock } from '../client/utils.mjs';
import { replaceVueTranslations } from './transform-vue.mjs';

export const entityFiles = {
  client: [
    {
      path: `${CLIENT_TEMPLATES_APP_DIR}entities/_entityFolder/`,
      renameTo: (data, filepath) => `${data.clientSrcDir}app/shared/model/${replaceEntityFilePath(data, filepath)}`,
      templates: ['_entityModel.model.ts'],
    },
    {
      condition: generator => !generator.embedded,
      ...clientApplicationBlock,
      templates: [
        'entities/_entityFolder/_entityFile-details.vue',
        'entities/_entityFolder/_entityFile-details.component.ts',
        'entities/_entityFolder/_entityFile.vue',
        'entities/_entityFolder/_entityFile.component.ts',
        'entities/_entityFolder/_entityFile.service.ts',
      ],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      ...clientApplicationBlock,
      templates: ['entities/_entityFolder/_entityFile-update.vue', 'entities/_entityFolder/_entityFile-update.component.ts'],
    },
  ],
  test: [
    {
      condition: generator => !generator.embedded,
      ...clientAppTestBlock,
      templates: [
        'entities/_entityFolder/_entityFile.component.spec.ts',
        'entities/_entityFolder/_entityFile-details.component.spec.ts',
        'entities/_entityFolder/_entityFile.service.spec.ts',
      ],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      ...clientAppTestBlock,
      templates: ['entities/_entityFolder/_entityFile-update.component.spec.ts'],
    },
  ],
};

export async function writeEntityFiles({ application, entities }) {
  for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
    await this.writeFiles({
      sections: entityFiles,
      transform: !application.enableTranslation ? [replaceVueTranslations] : undefined,
      context: { ...application, ...entity },
    });
  }
}

export async function postWriteEntityFiles({ application, entities }) {
  for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
    if (!entity.embedded) {
      const { clientFramework, enableTranslation } = application;
      const {
        entityInstance,
        entityClass,
        entityAngularName,
        entityFolderName,
        entityFileName,
        entityUrl,
        microserviceName,
        readOnly,
        entityClassPlural,
        i18nKeyPrefix,
        pageTitle = enableTranslation ? `${i18nKeyPrefix}.home.title` : entityClassPlural,
      } = entity;

      this.addEntityToModule(
        entityInstance,
        entityClass,
        entityAngularName,
        entityFolderName,
        entityFileName,
        entityUrl,
        clientFramework,
        microserviceName,
        readOnly,
        pageTitle
      );
      this.addEntityToMenu(
        entity.entityPage,
        application.enableTranslation,
        application.clientFramework,
        entity.entityTranslationKeyMenu,
        entity.entityClassHumanized
      );
    }
  }
}
