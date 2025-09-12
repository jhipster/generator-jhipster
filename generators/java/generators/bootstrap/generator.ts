/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { upperFirst } from 'lodash-es';
import pluralize from 'pluralize';

import { mutateData } from '../../../../lib/utils/index.ts';
import { mutateApplication } from '../../application.ts';
import { JavaApplicationGenerator } from '../../generator.ts';
import { prepareEntity } from '../../support/index.ts';

export default class JavaBootstrapGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    const projectNameGenerator = await this.dependsOnJHipster('project-name');
    projectNameGenerator.javaApplication = true;
    await this.dependsOnBootstrap('base-application');
    await this.dependsOnBootstrap('java-simple-application');
    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('server');
    }
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loading({ application, applicationDefaults }) {
        applicationDefaults(
          {
            __override__: false,
            useNpmWrapper: application => Boolean(application.clientFramework ?? 'no' !== 'no'),
          },
          {
            __override__: true,
            nodePackageManagerCommand: data => (data.useNpmWrapper ? './npmw' : data.nodePackageManagerCommand),
          },
          mutateApplication,
        );
        if (application.prettierFolders && !application.prettierFolders.includes('src/**/')) {
          application.prettierFolders.push('src/**/');
        }
      },
    });
  }

  get [JavaApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ application, entity }) {
        prepareEntity(entity, application);
      },
    });
  }

  get [JavaApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelationship({ application, relationship }) {
        mutateData(relationship, {
          relationshipNameCapitalizedPlural: ({ relationshipNameCapitalized, relationshipName }) =>
            relationshipName.length > 1 ? pluralize(relationshipNameCapitalized) : upperFirst(pluralize(relationshipName)),
          relationshipUpdateBackReference: ({ ownerSide, relationshipRightSide, otherEntity }) =>
            !otherEntity.embedded && (application.databaseTypeNeo4j ? relationshipRightSide : !ownerSide),
        });
      },
    });
  }

  get [JavaApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityRelationship);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      postPreparingEntity({ entity, application }) {
        entity.relationships
          .filter(relationship => relationship.ignoreOtherSideProperty === undefined)
          .forEach(relationship => {
            relationship.ignoreOtherSideProperty =
              (application as any).databaseType !== 'neo4j' &&
              !entity.embedded &&
              !relationship.otherEntity.embedded &&
              relationship.otherEntity.relationships.length > 0;
          });
        entity.relationshipsContainOtherSideIgnore = entity.relationships.some(relationship => relationship.ignoreOtherSideProperty);
      },
    });
  }

  get [JavaApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }

  get default() {
    return this.asDefaultTaskGroup({
      loadDomains({ application, entities }) {
        const entityPackages = [
          ...new Set([application.packageName, ...entities.map(entity => entity.entityAbsolutePackage).filter(Boolean)]),
        ] as string[];
        application.entityPackages.push(...entityPackages);
        application.domains.push(...entityPackages);
      },
    });
  }

  get [JavaApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }
}
