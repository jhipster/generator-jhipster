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
import { mutateData, mutateDefaults, overrideMutateDataProperty } from '../../../../lib/utils/object.ts';
import { fieldIsEnum } from '../../../base-application/support/field-utils.ts';
import { mutateApplication } from '../../application.ts';
import clientCommand from '../../command.ts';
import { mutateEntity, mutateField } from '../../entity.ts';
import { ClientApplicationGenerator } from '../../generator.ts';
import {
  filterEntitiesForClient,
  filterEntityFieldsForClient,
  filterEntityPropertiesForClient,
  getRestDomainNewProperties,
  isClientField,
  mutateRestDomainField,
  mutateRestDomainRelationship,
  preparePostEntityClientDerivedProperties,
} from '../../support/index.ts';
import type { Application as ClientApplication, Features as ClientFeatures, Options as ClientOptions } from '../../types.d.ts';

export default class ClientBootstrap extends ClientApplicationGenerator {
  constructor(args?: string[], options?: ClientOptions, features?: ClientFeatures) {
    super(args, options, { loadCommand: [clientCommand], ...features });
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (this.delegateToBlueprint) {
      throw new Error('Only sbs blueprint is supported');
    }

    await this.dependsOnBootstrap('common');
  }

  get composingBootstrap() {
    return this.asComposingBootstrapTaskGroup({
      async composing({ application }) {
        const { clientFramework = this.jhipsterConfigWithDefaults.clientFramework } = application;
        if (['angular', 'react', 'vue'].includes(clientFramework as string)) {
          await this.composeWithJHipster(`jhipster:${clientFramework}:bootstrap`);
        }
      },
    });
  }

  get [ClientApplicationGenerator.COMPOSING_BOOTSTRAP]() {
    return this.delegateTasksToBlueprint(() => this.composingBootstrap);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      loadDefaults({ applicationDefaults }) {
        applicationDefaults(mutateApplication);
      },
      prepareApplication({ applicationDefaults }) {
        applicationDefaults({
          clientThemeVariant: undefined,
        });
      },
      prettierFolders({ applicationDefaults }) {
        applicationDefaults({
          // Waits for clientSrcDir. A folder formatted recursively may hold it already, like the 'src/**/' of java:bootstrap.
          prettierFolders: overrideMutateDataProperty(({ clientFrameworkAny, clientSrcDir, prettierFolders }: ClientApplication) =>
            (
              clientFrameworkAny &&
              !prettierFolders.some(folder => folder.endsWith('**/') && clientSrcDir.startsWith(folder.slice(0, -'**/'.length)))
            ) ?
              [...prettierFolders, `${clientSrcDir}**/`]
            : prettierFolders,
          ),
        });
      },
    });
  }

  get [ClientApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      preparing({ application, entityDefaults }) {
        entityDefaults(mutateEntity, {
          entityPage: ({ microserviceName, entityFileName, adminEntity }) => {
            if (adminEntity && !application.applicationTypeMicroservice) {
              // The pages of an entity of the administration are among the administration ones.
              return `admin/${entityFileName}`;
            }
            return microserviceName && application.microfrontend && application.applicationTypeMicroservice ?
                `${microserviceName.toLowerCase()}/${entityFileName}`
              : entityFileName;
          },
          enumTypeFields: ({ fields }) => {
            // The enum of a field the clients skip has no file, the forms list no value of it.
            const enumFields = fields.filter(
              field => fieldIsEnum(field.fieldType) && !field.clientConstantsAsValues && isClientField(field),
            );
            return enumFields.filter((field, index) => enumFields.findIndex(({ fieldType }) => fieldType === field.fieldType) === index);
          },
          restDomainTypeName: ({ entityAngularName }) => `${application.restDomainPrefix}${entityAngularName}`,
        });
      },
    });
  }

  get [ClientApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      preparing({ fieldDefaults }) {
        fieldDefaults(mutateField);
      },
      prepareRestDomainField({ application, field }) {
        // The command of the client gives the prefix its default.
        mutateData(field, mutateRestDomainField({ restDomainPrefix: application.restDomainPrefix! }));
      },
    });
  }

  get [ClientApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      prepareRestDomainRelationships({ entity }) {
        // The types of the REST API, which client:rest-domain writes, read the other entities once they are prepared.
        for (const relationship of entity.relationships) {
          mutateData(relationship, mutateRestDomainRelationship);
        }
        entity.restDomainNewProperties ??= getRestDomainNewProperties(entity);
        // The fields of the JSON: the ones of the client, the content type field of each blob included.
        entity.restDomainFields ??= entity.fields.filter(field => isClientField(field));
      },
      prepareFormAndListFields({ entity }) {
        const { builtInUserManagement } = entity;
        // The fields the clients skip, like the content type the server keeps next to a blob, are left out.
        const clientFields = entity.fields.filter(field => isClientField(field) && !field.hidden);
        mutateDefaults(entity, {
          entityClientFormFields: () =>
            clientFields.filter(
              field => (!field.id || builtInUserManagement || !field.autoGenerate) && !(builtInUserManagement && field.readonly),
            ),
          entityClientListFields: () => clientFields.filter(field => !field.id && !field.hideListView),
        });
      },
    });
  }

  get [ClientApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }

  get default() {
    return this.asDefaultTaskGroup({
      addFallback({ application }) {
        application.filterEntitiesForClient ??= filterEntitiesForClient;
        application.filterEntityPropertiesForClient ??= filterEntityPropertiesForClient;
        application.filterEntitiesAndPropertiesForClient ??= entities =>
          // The fields the clients skip are left out; the relationships are kept as they are.
          application.filterEntitiesForClient!(entities).map(filterEntityFieldsForClient);
      },
      postPreparingEntity({ entities }) {
        for (const entity of entities) {
          preparePostEntityClientDerivedProperties(entity);
        }
      },
    });
  }

  get [ClientApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}
