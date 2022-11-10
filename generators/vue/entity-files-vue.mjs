/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import { CLIENT_TEST_SRC_DIR, CLIENT_MAIN_SRC_DIR } from '../generator-constants.mjs';
import { replaceVueTranslations } from './transform-vue.mjs';

const VUE_DIR = `${CLIENT_MAIN_SRC_DIR}app/`;
const ENTITY_TEMPLATES_DIR = `${VUE_DIR}entities/_entity_/`;
const ENTITY_TEST_TEMPLATES_DIR = `${CLIENT_TEST_SRC_DIR}spec/app/entities/_entity_/`;

const renameTo = (data, filepath) =>
  `${data.clientSrcDir}app/entities/${data.entityFolderName}/${filepath.replace(/^entity/, data.entityFileName)}`;

const renameTestFile = (data, filepath) =>
  `${data.clientTestDir}spec/app/entities/${data.entityFolderName}/${filepath.replace(/^entity/, data.entityFileName)}`;

export const entityFiles = {
  client: [
    {
      path: VUE_DIR,
      templates: [
        {
          file: 'entities/_entity_/entity.model.ts',
          // using entityModelFileName so that there is no conflict when generating microservice entities
          renameTo: generator => `shared/model/${generator.entityModelFileName}.model.ts`,
        },
      ],
    },
    {
      condition: generator => !generator.embedded,
      path: ENTITY_TEMPLATES_DIR,
      renameTo,
      templates: ['entity-details.vue', 'entity-details.component.ts', 'entity.vue', 'entity.component.ts', 'entity.service.ts'],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      path: ENTITY_TEMPLATES_DIR,
      renameTo,
      templates: ['entity-update.vue', 'entity-update.component.ts'],
    },
  ],
  test: [
    {
      condition: generator => !generator.embedded,
      path: ENTITY_TEST_TEMPLATES_DIR,
      renameTo: renameTestFile,
      templates: ['entity.component.spec.ts', 'entity-details.component.spec.ts', 'entity.service.spec.ts'],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      renameTo: renameTestFile,
      path: ENTITY_TEST_TEMPLATES_DIR,
      templates: ['entity-update.component.spec.ts'],
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
