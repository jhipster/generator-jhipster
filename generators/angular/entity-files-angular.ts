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
import type { GeneratorDefinition } from '../base-application/generator.js';
import { clientApplicationTemplatesBlock } from '../client/support/files.js';
import CoreGenerator from '../base-core/index.js';
import { WriteFileBlock, WriteFileSection } from '../base/api.js';

const entityModelFiles: WriteFileBlock = {
  ...clientApplicationTemplatesBlock(),
  templates: ['entities/_entityFolder_/_entityFile_.model.ts', 'entities/_entityFolder_/_entityFile_.test-samples.ts'],
};

const entityServiceFiles: WriteFileBlock = {
  ...clientApplicationTemplatesBlock(),
  condition: generator => !generator.embedded,
  templates: ['entities/_entityFolder_/service/_entityFile_.service.ts', 'entities/_entityFolder_/service/_entityFile_.service.spec.ts'],
};

export const userFiles: WriteFileSection = {
  model: [entityModelFiles],
  service: [entityServiceFiles],
};

export const angularFiles = {
  model: [entityModelFiles],
  service: [entityServiceFiles],
  client: [
    {
      condition: generator => !generator.embedded,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'entities/_entityFolder_/_entityFile_.routes.ts',
        'entities/_entityFolder_/detail/_entityFile_-detail.component.html',
        'entities/_entityFolder_/detail/_entityFile_-detail.component.ts',
        'entities/_entityFolder_/detail/_entityFile_-detail.component.spec.ts',
        'entities/_entityFolder_/list/_entityFile_.component.html',
        'entities/_entityFolder_/list/_entityFile_.component.ts',
        'entities/_entityFolder_/list/_entityFile_.component.spec.ts',
        'entities/_entityFolder_/route/_entityFile_-routing-resolve.service.ts',
        'entities/_entityFolder_/route/_entityFile_-routing-resolve.service.spec.ts',
      ],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'entities/_entityFolder_/update/_entityFile_-form.service.ts',
        'entities/_entityFolder_/update/_entityFile_-form.service.spec.ts',
        'entities/_entityFolder_/update/_entityFile_-update.component.html',
        'entities/_entityFolder_/update/_entityFile_-update.component.spec.ts',
        'entities/_entityFolder_/delete/_entityFile_-delete-dialog.component.html',
        'entities/_entityFolder_/update/_entityFile_-update.component.ts',
        'entities/_entityFolder_/delete/_entityFile_-delete-dialog.component.ts',
        'entities/_entityFolder_/delete/_entityFile_-delete-dialog.component.spec.ts',
      ],
    },
  ],
};

export async function writeEntitiesFiles(this: CoreGenerator, { application, entities }: GeneratorDefinition['writingEntitiesTaskParam']) {
  for (const entity of entities.filter(entity => !entity.skipClient)) {
    if (!entity.builtIn) {
      await this.writeFiles({
        sections: angularFiles,
        context: { ...application, ...entity },
      });
    } else if ((entity as any).builtInUser) {
      await this.writeFiles({
        sections: userFiles,
        context: {
          ...application,
          ...entity,
          fields: entity.fields.filter(field => ['id', 'login'].includes(field.fieldName)),
          readOnly: true,
        },
      });
    }
  }
}

export async function postWriteEntitiesFiles(this: CoreGenerator, taskParam: GeneratorDefinition['postWritingEntitiesTaskParam']) {
  const { source, application } = taskParam;
  const entities = taskParam.entities.filter(entity => !entity.skipClient && !entity.builtIn && !entity.embedded);
  source.addEntitiesToClient({ application, entities });
}

export function cleanupEntitiesFiles(this: CoreGenerator, { application, entities }: GeneratorDefinition['writingEntitiesTaskParam']) {
  for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
    const { entityFolderName, entityFileName, name: entityName } = entity;
    if (this.isJhipsterVersionLessThan('5.0.0')) {
      this.removeFile(`${application.clientSrcDir}app/entities/${entityName}/${entityName}.model.ts`);
    }

    if (this.isJhipsterVersionLessThan('6.3.0')) {
      this.removeFile(`${application.clientSrcDir}app/entities/${entityFolderName}/index.ts`);
    }

    if (this.isJhipsterVersionLessThan('7.0.0-beta.0')) {
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}.route.ts`);
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}.component.ts`);
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}.component.html`);
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}-detail.component.ts`);
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}-detail.component.html`);
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}-delete-dialog.component.ts`);
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}-delete-dialog.component.html`);
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}-update.component.ts`);
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}-update.component.html`);
      this.removeFile(`${application.clientSrcDir}/app/shared/model/${entity.entityModelFileName}.model.ts`);
      entity.fields.forEach(field => {
        if (field.fieldIsEnum === true) {
          const { enumFileName } = field;
          this.removeFile(`${application.clientSrcDir}/app/shared/model/enumerations/${enumFileName}.model.ts`);
        }
      });
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}-routing-resolve.service.ts`);
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}-routing.module.ts`);
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}.service.ts`);
      this.removeFile(`${application.clientSrcDir}/app/entities/${entityFolderName}/${entityFileName}.service.spec.ts`);
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}.component.spec.ts`);
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}-detail.component.spec.ts`);
      this.removeFile(
        `${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}-delete-dialog.component.spec.ts`,
      );
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}-update.component.spec.ts`);
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}.service.spec.ts`);
    }

    if (this.isJhipsterVersionLessThan('7.10.0')) {
      this.removeFile(`${application.clientSrcDir}app/entities/${entityFolderName}/${entityFileName}.module.ts`);
      this.removeFile(`${application.clientSrcDir}app/entities/${entityFolderName}/route/${entityFileName}-routing.module.ts`);
    }
  }
}
