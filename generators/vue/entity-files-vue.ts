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

export const entityFiles = {
  client: [
    clientApplicationTemplatesBlock({
      relativePath: 'shared/model/',
      templates: ['_entityModel_.model.ts'],
    }),
    {
      condition: generator => !generator.embedded,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'entities/_entityFolder_/_entityFile_-details.vue',
        'entities/_entityFolder_/_entityFile_-details.component.ts',
        'entities/_entityFolder_/_entityFile_-details.component.spec.ts',
        'entities/_entityFolder_/_entityFile_.vue',
        'entities/_entityFolder_/_entityFile_.component.ts',
        'entities/_entityFolder_/_entityFile_.component.spec.ts',
        'entities/_entityFolder_/_entityFile_.service.ts',
        'entities/_entityFolder_/_entityFile_.service.spec.ts',
      ],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'entities/_entityFolder_/_entityFile_-update.vue',
        'entities/_entityFolder_/_entityFile_-update.component.ts',
        'entities/_entityFolder_/_entityFile_-update.component.spec.ts',
      ],
    },
  ],
};

export async function writeEntityFiles({ control, application, entities }) {
  for (const entity of (control.filterEntitiesAndPropertiesForClient ?? (entities => entities))(entities).filter(
    entity => !entity.skipClient && !entity.builtInUser,
  )) {
    await this.writeFiles({
      sections: entityFiles,
      context: { ...application, ...entity },
    });
  }
}

export async function postWriteEntityFiles({ control, application, entities }) {
  for (const entity of (control.filterEntitiesForClient ?? (entities => entities))(entities).filter(entity => !entity.builtInUser)) {
    if (!entity.embedded) {
      const { enableTranslation } = application;
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
        microserviceName,
        readOnly,
        pageTitle,
      );
      this.addEntityToMenu(entity.entityPage, application.enableTranslation, entity.entityTranslationKeyMenu, entity.entityClassHumanized);
    }
  }
}

export function cleanupEntitiesFiles({ control, application, entities }) {
  for (const entity of (control.filterEntitiesForClient ?? (entities => entities))(entities).filter(entity => !entity.builtInUser)) {
    const { entityFolderName, entityFileName } = entity;
    if (this.isJhipsterVersionLessThan('8.0.0-beta.3')) {
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}.component.spec.ts`);
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}-detail.component.spec.ts`);
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}-update.component.spec.ts`);
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}.service.spec.ts`);
    }
  }
}
