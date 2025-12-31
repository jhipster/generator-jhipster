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
import { mutateData } from '../../../../lib/utils/index.ts';
import { getEnumInfo } from '../../../base-application/support/index.ts';
import type { Source as CommonSource } from '../../../common/types.d.ts';
import { JavaApplicationGenerator } from '../../generator.ts';
import { javaBeanCase, javaTestPackageTemplatesBlock } from '../../support/index.ts';
import { isReservedJavaKeyword } from '../../support/reserved-keywords.ts';

import { entityServerFiles, enumFiles } from './entity-files.ts';

export default class DomainGenerator extends JavaApplicationGenerator {
  generateEntities!: boolean;
  useJakartaValidation!: boolean;
  useJacksonIdentityInfo!: boolean;
  generateEnums!: boolean;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('java');
    }
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      checkForReservedKeyword({ entityName }) {
        if (isReservedJavaKeyword(entityName)) {
          throw new Error(`The entity name '${entityName}' is a reserved Java keyword.`);
        }
      },
      prepareEntity({ entity }) {
        mutateData(entity, {
          entityDomainLayer: true,
        });
      },
    });
  }

  get [JavaApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      checkForReservedKeyword({ entityName, field }) {
        if (isReservedJavaKeyword(field.fieldName)) {
          throw new Error(`The field '${field.fieldName}' in entity '${entityName}' is a reserved Java keyword.`);
        }
      },
      prepareEntity({ entity, field }) {
        field.propertyJavaBeanName = javaBeanCase(field.propertyName);
        if (entity.dtoMapstruct || entity.builtIn) {
          field.propertyDtoJavaType = field.fieldTypeBlobContent === 'text' ? 'String' : field.fieldType;
        }
      },
    });
  }

  get [JavaApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      checkForReservedKeyword({ entityName, relationship }) {
        if (isReservedJavaKeyword(relationship.relationshipName)) {
          throw new Error(`The relationship '${relationship.relationshipName}' in entity '${entityName}' is a reserved Java keyword.`);
        }
      },
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

  get [JavaApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityRelationship);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      checkForCircularRelationships({ entity }) {
        entity.skipJunitTests = entity.hasCyclicRequiredRelationship ? 'Cyclic required relationships detected' : undefined;
      },
    });
  }

  get [JavaApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
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

  get [JavaApplicationGenerator.WRITING]() {
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
              ...application,
              ...getEnumInfo(field, entity.clientRootFolder),
              frontendAppName: application.frontendAppName,
              packageName: application.packageName,
              javaPackageSrcDir: application.javaPackageSrcDir,
              entityJavaPackageFolder: entity.entityJavaPackageFolder,
              entityAbsolutePackage: entity.entityAbsolutePackage || application.packageName,
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

  get [JavaApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      sonar({ application, source }) {
        (source as CommonSource).ignoreSonarRule?.({
          ruleId: 'S7027-domain',
          ruleKey: 'javaarchitecture:S7027',
          resourceKey: `${application.javaPackageSrcDir}domain/**/*`,
          comment: 'Rule https://rules.sonarsource.com/java/RSPEC-7027 is ignored for entities',
        });

        // TODO improve comment
        (source as CommonSource).ignoreSonarRule?.({
          ruleId: 'S3437',
          ruleKey: 'squid:S3437',
          resourceKey: `${application.javaPackageSrcDir}**/*`,
          comment: 'Rule https://rules.sonarsource.com/java/RSPEC-3437 is ignored',
        });
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
