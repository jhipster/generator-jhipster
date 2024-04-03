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
import BaseApplicationGenerator from '../../../base-application/index.js';
import { mutateData } from '../../../base/support/index.js';
import { javaBeanCase, javaTestPackageTemplatesBlock } from '../../../server/support/index.js';
import { entityServerFiles, enumFiles } from './entity-files.js';
import { getEnumInfo } from '../../../base-application/support/index.js';

export default class DomainGenerator extends BaseApplicationGenerator {
  generateEntities!: boolean;
  useJakartaValidation!: boolean;
  useJacksonIdentityInfo!: boolean;
  generateEnums!: boolean;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplication();
      await this.dependsOnJHipster('jhipster:java:bootstrap');
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      async parseCommand() {
        await this.parseCurrentJHipsterCommand();
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        mutateData(entity, {
          entityDomainLayer: true,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareEntity({ entity, field }) {
        field.propertyJavaBeanName = javaBeanCase(field.propertyName);
        if (entity.dtoMapstruct || entity.builtIn) {
          field.propertyDtoJavaType = field.blobContentTypeText ? 'String' : field.fieldType;
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareEntity({ entity, relationship }) {
        relationship.propertyJavaBeanName = javaBeanCase(relationship.propertyName);
        if (entity.dtoMapstruct) {
          relationship.propertyDtoJavaType = relationship.collection
            ? `Set<${relationship.otherEntity.dtoClass}>`
            : relationship.otherEntity.dtoClass;
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityRelationship);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      checkForCircularRelationships({ entity }) {
        entity.skipJunitTests = entity.hasCyclicRequiredRelationship ? 'Cyclic required relationships detected' : undefined;
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeDomainBaseFiles({ application }) {
        await this.writeFiles({
          blocks: [
            javaTestPackageTemplatesBlock({
              templates: ['domain/AssertUtils.java'],
            }),
          ],
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      async writeServerFiles({ application, entities }) {
        if (!this.generateEntities) return;

        const { useJakartaValidation, useJacksonIdentityInfo } = this;
        for (const entity of entities.filter(entity => !entity.skipServer)) {
          await this.writeFiles({
            sections: entityServerFiles,
            context: { ...application, ...entity, useJakartaValidation, useJacksonIdentityInfo },
          });
        }
      },

      async writeEnumFiles({ application, entities }) {
        if (!this.generateEnums) return;

        for (const entity of entities.filter(entity => !entity.skipServer)) {
          for (const field of entity.fields.filter(field => field.fieldIsEnum)) {
            const enumInfo = {
              ...getEnumInfo(field, (entity as any).clientRootFolder),
              frontendAppName: (entity as any).frontendAppName,
              packageName: application.packageName,
              javaPackageSrcDir: application.javaPackageSrcDir,
              entityJavaPackageFolder: (entity as any).entityJavaPackageFolder,
              entityAbsolutePackage: (entity as any).entityAbsolutePackage || application.packageName,
            };
            await this.writeFiles({
              sections: enumFiles,
              context: enumInfo,
            });
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }
}
