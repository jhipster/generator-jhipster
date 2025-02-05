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
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';
import { javaMainPackageTemplatesBlock } from '../server/support/index.js';

const domainFiles = [
  {
    condition: ctx => ctx.entityDomainLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['domain/_persistClass_.java.jhi.spring_data_couchbase'],
  },
];

const repositoryFiles = [
  {
    condition: generator => !generator.embedded && generator.entityPersistenceLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['repository/_entityClass_Repository.java'],
  },
];

export const entityFiles = {
  dbChangelog: [
    {
      condition: generator => !generator.skipDbChangelog && !generator.embedded,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/couchmove/changelog/entity.n1ql',
          renameTo: generator => `config/couchmove/changelog/V${generator.changelogDate}__${generator.entityInstance.toLowerCase()}.n1ql`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngineCouchbase && !generator.skipDbChangelog && !generator.embedded,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/couchmove/changelog/entity.fts',
          renameTo: generator =>
            `config/couchmove/changelog/V${parseInt(generator.changelogDate, 10) + 10}__${generator.entityInstance.toLowerCase()}.fts`,
        },
      ],
    },
  ],
  domainFiles,
  repositoryFiles,
};

export const cleanupCouchbaseEntityFilesTask = asWritingEntitiesTask(function ({ application, entities }) {
  for (const entity of entities.filter(entity => !entity.builtIn && !entity.skipServer)) {
    if (this.isJhipsterVersionLessThan('7.6.1')) {
      this.removeFile(
        `${application.srcMainResources}config/couchmove/changelog/V${entity.changelogDate}__${entity.entityInstance.toLowerCase()}.fts`,
      );
    }
  }
});

export default asWritingEntitiesTask(async function writeEntityCouchbaseFiles({ application, entities }) {
  for (const entity of entities.filter(entity => !entity.skipServer)) {
    await this.writeFiles({
      sections: entityFiles,
      context: { ...application, ...entity },
    });
  }
});
