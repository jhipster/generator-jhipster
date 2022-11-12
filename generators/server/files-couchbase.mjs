/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import { SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.mjs';

const shouldSkipUserManagement = generator =>
  generator.skipUserManagement && (!generator.applicationTypeMonolith || !generator.authenticationTypeOauth2);

export const couchbaseFiles = {
  serverJavaConfig: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/JHipsterCouchbaseRepository.java',
          renameTo: generator => `${generator.javaDir}repository/JHipsterCouchbaseRepository.java`,
        },
      ],
    },
    {
      condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationTypeSession && !generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/PersistentTokenRepository_couchbase.java',
          renameTo: generator => `${generator.javaDir}repository/PersistentTokenRepository.java`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngineCouchbase,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/CouchbaseSearchRepository.java',
          renameTo: generator => `${generator.javaDir}repository/CouchbaseSearchRepository.java`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngineCouchbase,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/repository/CouchbaseSearchRepositoryTest.java',
          renameTo: generator => `${generator.testDir}repository/CouchbaseSearchRepositoryTest.java`,
        },
      ],
    },
  ],
  serverResource: [
    {
      condition: generator => generator.generateUserManagement,
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/couchmove/changelog/V0__create_collections.n1ql', 'config/couchmove/changelog/V0.2__create_indexes.n1ql'],
    },
    {
      condition: generator => generator.generateBuiltInUserEntity,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        'config/couchmove/changelog/V0.1__initial_setup/authority/ROLE_ADMIN.json',
        'config/couchmove/changelog/V0.1__initial_setup/authority/ROLE_USER.json',
        'config/couchmove/changelog/V0.1__initial_setup/user/admin.json',
        'config/couchmove/changelog/V0.1__initial_setup/user/user.json',
      ],
    },
  ],
  serverTestFw: [
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/CouchbaseTestContainer.java',
          renameTo: generator => `${generator.testDir}config/CouchbaseTestContainer.java`,
        },
        {
          file: 'package/config/EmbeddedCouchbase.java',
          renameTo: generator => `${generator.testDir}config/EmbeddedCouchbase.java`,
        },
      ],
    },
  ],
};

export function writeCouchbaseFiles() {
  return {
    cleanupCouchbaseFiles({ application }) {
      if (!application.databaseTypeCouchbase) return;

      if (this.isJhipsterVersionLessThan('7.1.1')) {
        this.removeFile(`${application.javaDir}repository/CustomReactiveCouchbaseRepository.java `);
        this.removeFile(`${application.testDir}config/DatabaseConfigurationIT.java`);
        this.removeFile(`${application.javaDir}repository/N1qlCouchbaseRepository.java`);
        this.removeFile(`${application.javaDir}repository/ReactiveN1qlCouchbaseRepository.java`);
        this.removeFile(`${application.javaDir}repository/CustomN1qlCouchbaseRepository.java`);
        this.removeFile(`${application.javaDir}repository/CustomCouchbaseRepository.java`);
        this.removeFile(`${application.javaDir}repository/SearchCouchbaseRepository.java`);
        this.removeFile(`${application.testDir}repository/CustomCouchbaseRepositoryTest.java`);
      }

      if (this.isJhipsterVersionLessThan('7.6.1')) {
        this.removeFile(`${SERVER_TEST_SRC_DIR}${application.testDir}repository/JHipsterCouchbaseRepositoryTest.java`);
        this.removeFolder(`${SERVER_MAIN_SRC_DIR}${application.javaDir}config/couchbase`);
        this.removeFile(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0__create_indexes.n1ql`);
        this.removeFile(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/ROLE_ADMIN.json`);
        this.removeFile(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/ROLE_USER.json`);
        this.removeFile(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__admin.json`);
        this.removeFile(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__user.json`);
      }
    },

    async writeCouchbaseFiles({ application }) {
      if (!application.databaseTypeCouchbase) return;

      await this.writeFiles({
        sections: couchbaseFiles,
        rootTemplatesPath: 'couchbase',
        context: application,
      });
    },
  };
}
