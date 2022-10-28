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
import constants from '../generator-constants.cjs';
import { replaceReactTranslations } from './transform-react.mjs';
import { addEnumerationFiles } from './entity-files.mjs';

const { CLIENT_TEST_SRC_DIR, REACT_DIR } = constants;

export const reactFiles = {
  client: [
    {
      condition: generator => !generator.embedded,
      path: REACT_DIR,
      templates: [
        {
          file: 'entities/entity-detail.tsx',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-detail.tsx`,
        },
        {
          file: 'entities/entity.tsx',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.tsx`,
        },
        {
          file: 'entities/entity.reducer.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.reducer.ts`,
        },
        {
          file: 'entities/index.tsx',
          renameTo: generator => `entities/${generator.entityFolderName}/index.tsx`,
        },
      ],
    },
    {
      path: REACT_DIR,
      templates: [
        {
          file: 'entities/entity.model.ts',
          renameTo: generator => `shared/model/${generator.entityModelFileName}.model.ts`,
        },
      ],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      path: REACT_DIR,
      templates: [
        {
          file: 'entities/entity-delete-dialog.tsx',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-delete-dialog.tsx`,
        },
        {
          file: 'entities/entity-update.tsx',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-update.tsx`,
        },
      ],
    },
  ],
  test: [
    {
      condition: generator => !generator.embedded,
      path: REACT_DIR,
      templates: [
        {
          file: 'entities/entity-reducer.spec.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-reducer.spec.ts`,
        },
      ],
    },
    {
      condition: generator => generator.protractorTests && !generator.embedded,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        {
          file: 'e2e/entities/entity-page-object.ts',
          renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}.page-object.ts`,
        },
        {
          file: 'e2e/entities/entity.spec.ts',
          renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}.spec.ts`,
        },
      ],
    },
    {
      condition: generator => generator.protractorTests && !generator.readOnly && !generator.embedded,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        {
          file: 'e2e/entities/entity-update-page-object.ts',
          renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}-update.page-object.ts`,
        },
      ],
    },
  ],
};

export async function writeEntitiesReactFiles({ application, entities }) {
  if (!application.clientFrameworkReact) return;
  for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
    await addEnumerationFiles.call(this, { application, entity }, REACT_DIR);

    await this.writeFiles({
      sections: reactFiles,
      rootTemplatesPath: 'entity/react',
      transform: !application.enableTranslation ? [replaceReactTranslations] : undefined,
      context: { ...application, ...entity },
    });

    if (!entity.embedded) {
      const { entityInstance, entityClass, entityAngularName, entityFolderName, entityFileName } = entity;

      const { CLIENT_MAIN_SRC_DIR } = this;
      const { applicationTypeMicroservice } = application;
      this.needleApi.clientReact.addEntityToModule(entityInstance, entityClass, entityAngularName, entityFolderName, entityFileName, {
        applicationTypeMicroservice,
        CLIENT_MAIN_SRC_DIR,
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

export function cleanupEntitiesReact({ application, entities }) {
  if (!application.clientFrameworkReact) return;
  for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
    const { entityFolderName, entityFileName } = entity;

    if (this.isJhipsterVersionLessThan('7.0.0-beta.1')) {
      this.removeFile(`${this.CLIENT_TEST_SRC_DIR}spec/app/entities/${entityFolderName}/${entityFileName}-reducer.spec.ts`);
    }
  }
}
