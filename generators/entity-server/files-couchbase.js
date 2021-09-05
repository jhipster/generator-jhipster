/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const { SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR } = require('../generator-constants');

const entityCouchbaseFiles = {
  dbChangelog: [
    {
      condition: generator => generator.searchEngineCouchbase && !generator.skipDbChangelog,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/couchmove/changelog/entity.fts',
          renameTo: generator => `config/couchmove/changelog/V${generator.changelogDate}__${generator.entityInstance.toLowerCase()}.fts`,
        },
      ],
    },
  ],
  server: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.spring_data_couchbase',
          renameTo: generator => `${generator.packageFolder}/domain/${generator.persistClass}.java.jhi.spring_data_couchbase`,
        },
      ],
    },
    {
      condition: generator => !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepository.java',
          renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}Repository.java`,
        },
      ],
    },
  ],
};

function writeEntityCouchbaseFiles() {
  return {
    async writeEntityCouchbaseFiles() {
      if (this.skipServer || !this.databaseTypeCouchbase) return;

      await this.writeFiles({
        sections: entityCouchbaseFiles,
        rootTemplatesPath: 'couchbase',
      });
    },
  };
}

module.exports = {
  writeEntityCouchbaseFiles,
  entityCouchbaseFiles,
};
