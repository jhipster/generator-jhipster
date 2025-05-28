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
import { asWritingEntitiesTask } from '../base-application/support/task-type-inference.js';
import { javaMainPackageTemplatesBlock } from '../java/support/index.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType } from '../../lib/types/application/application.js';

const domainFiles = [
  {
    condition: generator => !generator.reactive && generator.entityDomainLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['domain/_persistClass_.java.jhi.jakarta_persistence'],
  },
  {
    condition: generator => !generator.reactive && generator.requiresPersistableImplementation && generator.entityDomainLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['domain/_persistClass_.java.jhi.jakarta_lifecycle_events'],
  },
  {
    condition: generator => !generator.reactive && generator.enableHibernateCache && generator.entityDomainLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['domain/_persistClass_.java.jhi.hibernate_cache'],
  },
  {
    condition: generator => generator.reactive && generator.entityDomainLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['domain/_persistClass_.java.jhi.spring_data_reactive'],
  },
  {
    condition: generator => generator.requiresPersistableImplementation && generator.entityDomainLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['domain/_persistClass_.java.jhi.spring_data_persistable'],
  },
  {
    condition: generator => generator.reactive && generator.requiresPersistableImplementation && generator.entityDomainLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['domain/_persistClass_Callback.java'],
  },
];

const sqlFiles = {
  domainFiles,
  repositoryFiles: [
    {
      condition: generator => !generator.reactive && !generator.embedded && generator.entityPersistenceLayer,
      ...javaMainPackageTemplatesBlock('_entityPackage_/'),
      templates: ['repository/_entityClass_Repository.java'],
    },
    {
      condition: generator =>
        !generator.reactive && !generator.embedded && generator.containsBagRelationships && generator.entityPersistenceLayer,
      ...javaMainPackageTemplatesBlock('_entityPackage_'),
      templates: [
        'repository/_entityClass_RepositoryWithBagRelationships.java',
        'repository/_entityClass_RepositoryWithBagRelationshipsImpl.java',
      ],
    },
    {
      condition: ctx => ctx.reactive && !ctx.embedded && ctx.entityPersistenceLayer && !ctx.entityR2dbcRepository,
      ...javaMainPackageTemplatesBlock('_entityPackage_'),
      templates: [
        'repository/_entityClass_Repository_reactive.java',
        'repository/_entityClass_RepositoryInternalImpl_reactive.java',
        'repository/_entityClass_SqlHelper_reactive.java',
        'repository/rowmapper/_entityClass_RowMapper_reactive.java',
      ],
    },
    {
      condition: ctx => ctx.reactive && !ctx.embedded && ctx.entityPersistenceLayer && ctx.entityR2dbcRepository,
      ...javaMainPackageTemplatesBlock('_entityPackage_'),
      templates: ['repository/_entityClass_Repository_r2dbc.java'],
    },
  ],
};

export function cleanupEntitiesTask() {}

export default asWritingEntitiesTask<
  DeprecatedField,
  DeprecatedPrimarykey<DeprecatedField>,
  DeprecatedRelationship<any>,
  DeprecatedEntity<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
  ApplicationType,
  any
>(async function writeEntitiesTask({ application, entities }) {
  for (const entity of entities.filter(entity => !entity.skipServer)) {
    if (entity.builtInUser) {
      await this.writeFiles({
        blocks: [
          {
            condition: generator => generator.reactive && generator.requiresPersistableImplementation,
            ...javaMainPackageTemplatesBlock('_entityPackage_'),
            templates: ['domain/_persistClass_Callback.java'],
          },
        ],
        context: { ...application, ...entity },
      });
    } else {
      await this.writeFiles({
        sections: sqlFiles,
        context: { ...application, ...entity },
      });
    }
  }
});
