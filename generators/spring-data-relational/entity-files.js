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
import { javaMainPackageTemplatesBlock } from '../java/support/index.js';

const sqlFiles = {
  sqlFiles: [
    {
      condition: generator => !generator.reactive,
      ...javaMainPackageTemplatesBlock('_entityPackage_'),
      templates: ['domain/_persistClass_.java.jhi.jakarta_persistence'],
    },
    {
      condition: generator => !generator.reactive && generator.requiresPersistableImplementation,
      ...javaMainPackageTemplatesBlock('_entityPackage_'),
      templates: ['domain/_persistClass_.java.jhi.jakarta_lifecycle_events'],
    },
    {
      condition: generator => !generator.reactive && generator.enableHibernateCache,
      ...javaMainPackageTemplatesBlock('_entityPackage_'),
      templates: ['domain/_persistClass_.java.jhi.hibernate_cache'],
    },
    {
      condition: generator => !generator.reactive && !generator.embedded && generator.containsBagRelationships,
      ...javaMainPackageTemplatesBlock('_entityPackage_'),
      templates: [
        'repository/_entityClass_RepositoryWithBagRelationships.java',
        'repository/_entityClass_RepositoryWithBagRelationshipsImpl.java',
      ],
    },
    {
      condition: generator => generator.reactive,
      ...javaMainPackageTemplatesBlock('_entityPackage_'),
      templates: ['domain/_persistClass_.java.jhi.spring_data_reactive'],
    },
    {
      condition: generator => generator.requiresPersistableImplementation,
      ...javaMainPackageTemplatesBlock('_entityPackage_'),
      templates: ['domain/_persistClass_.java.jhi.spring_data_persistable'],
    },
    {
      condition: generator => generator.reactive && generator.requiresPersistableImplementation,
      ...javaMainPackageTemplatesBlock('_entityPackage_'),
      templates: ['domain/_persistClass_Callback.java'],
    },
    {
      condition: generator => generator.reactive && !generator.embedded,
      ...javaMainPackageTemplatesBlock('_entityPackage_'),
      templates: [
        'repository/_entityClass_RepositoryInternalImpl_reactive.java',
        'repository/_entityClass_SqlHelper_reactive.java',
        'repository/rowmapper/_entityClass_RowMapper_reactive.java',
      ],
    },
  ],
};

export function cleanupEntitiesTask() {}

export default async function writeEntitiesTask({ application, entities }) {
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
    } else if (!entity.builtIn) {
      await this.writeFiles({
        sections: sqlFiles,
        context: { ...application, ...entity },
      });
    }
  }
}
