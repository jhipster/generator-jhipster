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
import { createTranslationReplacer } from './transform-react.mjs';
import { clientApplicationBlock } from '../client/utils.mjs';

export const reactFiles = {
  client: [
    {
      condition: generator => !generator.embedded,
      ...clientApplicationBlock,
      templates: [
        'entities/_entityFolder/_entityFile-detail.tsx',
        'entities/_entityFolder/_entityFile.tsx',
        'entities/_entityFolder/_entityFile.reducer.ts',
        'entities/_entityFolder/index.tsx',
      ],
    },
    {
      ...clientApplicationBlock,
      renameTo: (data, filepath) => `${data.clientSrcDir}app/shared/model/${data.entityModelFileName}.model.ts`,
      templates: ['entities/_entityFolder/_entityModel.model.ts'],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      ...clientApplicationBlock,
      templates: ['entities/_entityFolder/_entityFile-delete-dialog.tsx', 'entities/_entityFolder/_entityFile-update.tsx'],
    },
  ],
  test: [
    {
      condition: generator => !generator.embedded,
      ...clientApplicationBlock,
      templates: ['entities/_entityFolder/_entityFile-reducer.spec.ts'],
    },
  ],
};

export async function writeEntitiesFiles({ application, entities, control }) {
  if (!application.enableTranslation) {
    await control.loadClientTranslations?.();
  }

  for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
    await this.writeFiles({
      sections: reactFiles,
      transform: !application.enableTranslation ? [createTranslationReplacer(control.getWebappTranslation)] : undefined,
      context: { ...application, ...entity },
    });
  }
}

export async function postWriteEntitiesFiles({ application, entities }) {
  for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
    if (!entity.embedded) {
      const { entityInstance, entityClass, entityAngularName, entityFolderName, entityFileName } = entity;

      const { applicationTypeMicroservice } = application;
      this.needleApi.clientReact.addEntityToModule(entityInstance, entityClass, entityAngularName, entityFolderName, entityFileName, {
        applicationTypeMicroservice,
        clientSrcDir: application.clientSrcDir,
      });
      this.needleApi.clientReact.addEntityToMenu(
        entity.entityPage,
        application.enableTranslation,
        entity.entityTranslationKeyMenu,
        entity.entityClassHumanized
      );
    }
  }
}

export function cleanupEntitiesFiles({ application, entities }) {
  for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
    const { entityFolderName, entityFileName } = entity;

    if (this.isJhipsterVersionLessThan('7.0.0-beta.1')) {
      this.removeFile(`${application.clientTestDir}spec/app/entities/${entityFolderName}/${entityFileName}-reducer.spec.ts`);
    }
  }
}
