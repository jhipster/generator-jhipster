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
import { createTranslationReplacer } from './support/index.mjs';
import { clientApplicationBlock } from '../client/utils.mjs';
import { entityOptions } from '../../jdl/jhipster/index.mjs';
import AngularGenerator, { type GeneratorDefinition } from './generator.mjs';

const { ClientInterfaceTypes } = entityOptions;
const { NO: NO_CLIENT_INTERFACE } = ClientInterfaceTypes;

export const angularFiles = {
  client: [
    {
      ...clientApplicationBlock,
      templates: ['entities/_entityFolder/_entityFile.model.ts', 'entities/_entityFolder/_entityFile.test-samples.ts'],
    },
    {
      condition: generator => !generator.embedded,
      ...clientApplicationBlock,
      templates: [
        'entities/_entityFolder/_entityFile.routes.ts',
        'entities/_entityFolder/detail/_entityFile-detail.component.html',
        'entities/_entityFolder/detail/_entityFile-detail.component.ts',
        'entities/_entityFolder/detail/_entityFile-detail.component.spec.ts',
        'entities/_entityFolder/list/_entityFile.component.html',
        'entities/_entityFolder/list/_entityFile.component.ts',
        'entities/_entityFolder/list/_entityFile.component.spec.ts',
        'entities/_entityFolder/route/_entityFile-routing-resolve.service.ts',
        'entities/_entityFolder/route/_entityFile-routing-resolve.service.spec.ts',
        'entities/_entityFolder/service/_entityFile.service.ts',
        'entities/_entityFolder/service/_entityFile.service.spec.ts',
      ],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      ...clientApplicationBlock,
      templates: [
        'entities/_entityFolder/update/_entityFile-form.service.ts',
        'entities/_entityFolder/update/_entityFile-form.service.spec.ts',
        'entities/_entityFolder/update/_entityFile-update.component.html',
        'entities/_entityFolder/update/_entityFile-update.component.spec.ts',
        'entities/_entityFolder/delete/_entityFile-delete-dialog.component.html',
        'entities/_entityFolder/update/_entityFile-update.component.ts',
        'entities/_entityFolder/delete/_entityFile-delete-dialog.component.ts',
        'entities/_entityFolder/delete/_entityFile-delete-dialog.component.spec.ts',
      ],
    },
  ],
};

export async function writeEntitiesFiles(
  this: AngularGenerator,
  { application, entities, control }: GeneratorDefinition['writingEntitiesTaskParam']
) {
  await control.loadClientTranslations?.();

  for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn && entity.clientInterface !== NO_CLIENT_INTERFACE)) {
    await this.writeFiles({
      sections: angularFiles,
      transform: !application.enableTranslation ? [createTranslationReplacer(control.getWebappTranslation)] : undefined,
      context: { ...application, ...entity, getWebappTranslation: control.getWebappTranslation },
    });
  }
}

export async function postWriteEntitiesFiles(this: AngularGenerator, taskParam: GeneratorDefinition['postWritingEntitiesTaskParam']) {
  const { source, application } = taskParam;
  const entities = taskParam.entities.filter(
    entity => !entity.skipClient && !entity.builtIn && !entity.embedded && entity.clientInterface !== NO_CLIENT_INTERFACE
  );
  source.addEntitiesToClient({ application, entities });
}

export function cleanupEntitiesFiles(this: AngularGenerator, { application, entities }: GeneratorDefinition['writingEntitiesTaskParam']) {
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
        `${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}-delete-dialog.component.spec.ts`
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
