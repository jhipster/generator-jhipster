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
import { clientApplicationTemplatesBlock } from '../client/support/index.js';

export const reactFiles = {
  client: [
    {
      condition: generator => !generator.embedded,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'entities/_entityFolder_/_entityFile_-detail.tsx',
        'entities/_entityFolder_/_entityFile_.tsx',
        'entities/_entityFolder_/_entityFile_.reducer.ts',
        'entities/_entityFolder_/index.tsx',
      ],
    },
    {
      ...clientApplicationTemplatesBlock(),
      renameTo: data => `${data.clientSrcDir}app/shared/model/${data.entityModelFileName}.model.ts`,
      templates: ['entities/_entityFolder_/_entityModel_.model.ts'],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      ...clientApplicationTemplatesBlock(),
      templates: ['entities/_entityFolder_/_entityFile_-delete-dialog.tsx', 'entities/_entityFolder_/_entityFile_-update.tsx'],
    },
  ],
  test: [
    {
      condition: generator => !generator.embedded,
      ...clientApplicationTemplatesBlock(),
      templates: ['entities/_entityFolder_/_entityFile_-reducer.spec.ts'],
    },
  ],
};

export async function writeEntitiesFiles({ control, application, entities }) {
  for (const entity of (control.filterEntitiesAndPropertiesForClient ?? (entities => entities))(entities).filter(
    entity => !entity.builtInUser,
  )) {
    await this.writeFiles({
      sections: reactFiles,
      context: { ...application, ...entity },
    });
  }
}

export async function postWriteEntitiesFiles({ control, application, entities }) {
  for (const entity of (control.filterEntitiesForClient ?? (entities => entities))(entities).filter(entity => !entity.builtInUser)) {
    if (!entity.embedded) {
      const { entityInstance, entityClass, entityAngularName, entityFolderName, entityFileName } = entity;

      const { applicationTypeMicroservice, clientSrcDir } = application;
      this.needleApi.clientReact.addEntityToModule(entityInstance, entityClass, entityAngularName, entityFolderName, entityFileName, {
        applicationTypeMicroservice,
        clientSrcDir,
      });
      this.addEntityToMenu(entity.entityPage, application.enableTranslation, entity.entityTranslationKeyMenu, entity.entityClassHumanized);
    }
  }
}

export function cleanupEntitiesFiles({ control, application, entities }) {
  for (const entity of (control.filterEntitiesForClient ?? (entities => entities))(entities).filter(entity => !entity.builtInUser)) {
    const { entityFolderName, entityFileName } = entity;

    if (this.isJhipsterVersionLessThan('7.0.0-beta.1')) {
      this.removeFile(`${application.clientTestDir}spec/app/entities/${entityFolderName}/${entityFileName}-reducer.spec.ts`);
    }
  }
}
