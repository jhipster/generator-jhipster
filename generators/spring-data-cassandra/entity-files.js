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
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';
import { javaMainPackageTemplatesBlock } from '../server/support/index.js';

const domainFiles = [
  {
    condition: ctx => ctx.entityDomainLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['domain/_persistClass_.java.jhi.spring_data_cassandra'],
  },
];

const repositoryFiles = [
  {
    condition: ctx => ctx.entityPersistenceLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['repository/_entityClass_Repository.java', 'domain/_persistClass_.java.jhi.spring_data_cassandra'],
  },
];

export const entityFiles = {
  dbChangelog: [
    {
      condition: ctx => !ctx.skipDbChangelog,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/cql/changelog/added_entity.cql',
          renameTo: ctx => `config/cql/changelog/${ctx.changelogDate}_added_entity_${ctx.entityClass}.cql`,
        },
      ],
    },
  ],
  domainFiles,
  repositoryFiles,
};

export function cleanupCassandraEntityFilesTask() {}

export default async function writeEntityCassandraFiles({ application, entities }) {
  for (const entity of entities.filter(entity => !entity.skipServer)) {
    await this.writeFiles({
      sections: entity.builtIn ? { domainFiles } : entityFiles,
      context: { ...application, ...entity },
    });
  }
}
