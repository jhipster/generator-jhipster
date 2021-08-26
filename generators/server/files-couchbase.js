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
const constants = require('../generator-constants');
const { MONOLITH } = require('../../jdl/jhipster/application-types');
const { OAUTH2, SESSION } = require('../../jdl/jhipster/authentication-types');
const { COUCHBASE } = require('../../jdl/jhipster/database-types');

/* Constants use throughout */
const DOCKER_DIR = constants.DOCKER_DIR;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

const shouldSkipUserManagement = generator =>
  generator.skipUserManagement && (generator.applicationType !== MONOLITH || generator.authenticationType !== OAUTH2);

const couchbaseFiles = {
  docker: [
    {
      path: DOCKER_DIR,
      templates: ['couchbase-cluster.yml', 'couchbase/Couchbase.Dockerfile', 'couchbase/scripts/configure-node.sh'],
    },
  ],
  serverJavaConfig: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/couchbase/CustomCouchbaseRepositoryFactory.java',
          renameTo: generator => `${generator.javaDir}config/couchbase/CustomCouchbaseRepositoryFactory.java`,
        },
        {
          file: 'package/config/couchbase/CustomCouchbaseRepositoryFactoryBean.java',
          renameTo: generator => `${generator.javaDir}config/couchbase/CustomCouchbaseRepositoryFactoryBean.java`,
        },
        {
          file: 'package/config/couchbase/CustomCouchbaseRepositoryQuery.java',
          renameTo: generator => `${generator.javaDir}config/couchbase/CustomCouchbaseRepositoryQuery.java`,
        },
        {
          file: 'package/config/couchbase/CustomN1qlQueryCreator.java',
          renameTo: generator => `${generator.javaDir}config/couchbase/CustomN1qlQueryCreator.java`,
        },
        {
          file: 'package/config/couchbase/CustomN1qlRepositoryQueryExecutor.java',
          renameTo: generator => `${generator.javaDir}config/couchbase/CustomN1qlRepositoryQueryExecutor.java`,
        },
        {
          file: 'package/config/couchbase/package-info.java',
          renameTo: generator => `${generator.javaDir}config/couchbase/package-info.java`,
        },
        {
          file: 'package/repository/JHipsterCouchbaseRepository.java',
          renameTo: generator => `${generator.javaDir}repository/JHipsterCouchbaseRepository.java`,
        },
      ],
    },
    {
      condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType === SESSION && !generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/PersistentTokenRepository_couchbase.java',
          renameTo: generator => `${generator.javaDir}repository/PersistentTokenRepository.java`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngine === COUCHBASE,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/repository/JHipsterCouchbaseRepositoryTest.java',
          renameTo: generator => `${generator.testDir}repository/JHipsterCouchbaseRepositoryTest.java`,
        },
      ],
    },
  ],
  serverResource: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/couchmove/changelog/V0__create_indexes.n1ql'],
    },
    {
      condition: generator => !generator.skipUserManagement || generator.authenticationType === OAUTH2,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        'config/couchmove/changelog/V0.1__initial_setup/ROLE_ADMIN.json',
        'config/couchmove/changelog/V0.1__initial_setup/ROLE_USER.json',
        'config/couchmove/changelog/V0.1__initial_setup/user__admin.json',
        'config/couchmove/changelog/V0.1__initial_setup/user__user.json',
      ],
    },
  ],
  serverTestFw: [
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/CouchbaseTestContainerExtension.java',
          renameTo: generator => `${generator.testDir}CouchbaseTestContainerExtension.java`,
        },
      ],
    },
  ],
};

function writeCouchbaseFiles() {
  return {
    cleanupCouchbaseFiles() {
      if (!this.databaseTypeCouchbase) return;

      if (this.isJhipsterVersionLessThan('7.1.1')) {
        this.removeFile(`${this.javaDir}repository/CustomReactiveCouchbaseRepository.java `);
        this.removeFile(`${this.testDir}config/DatabaseConfigurationIT.java`);
        this.removeFile(`${this.javaDir}repository/N1qlCouchbaseRepository.java`);
        this.removeFile(`${this.javaDir}repository/ReactiveN1qlCouchbaseRepository.java`);
        this.removeFile(`${this.javaDir}repository/CustomN1qlCouchbaseRepository.java`);
        this.removeFile(`${this.javaDir}repository/CustomCouchbaseRepository.java`);
        this.removeFile(`${this.javaDir}repository/SearchCouchbaseRepository.java`);
        this.removeFile(`${this.testDir}repository/CustomCouchbaseRepositoryTest.java`);
      }
    },

    async writeCouchbaseFiles() {
      if (!this.databaseTypeCouchbase) return;

      await this.writeFiles({
        sections: couchbaseFiles,
        rootTemplatesPath: 'couchbase',
      });
    },
  };
}

module.exports = {
  couchbaseFiles,
  writeCouchbaseFiles,
};
