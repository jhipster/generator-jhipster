/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../server/support/utils.mjs';

export const couchbaseFiles = {
  serverJavaConfig: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['repository/JHipsterCouchbaseRepository.java', 'config/DatabaseConfiguration.java'],
    },
    {
      condition: data => data.authenticationTypeSession && !data.reactive && data.generateUserManagement,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['repository/PersistentTokenRepository_couchbase.java'],
    },
    {
      condition: data => data.searchEngineCouchbase,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['repository/CouchbaseSearchRepository.java'],
    },
    {
      condition: data => data.searchEngineCouchbase,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['repository/CouchbaseSearchRepositoryTest.java'],
    },
  ],
  serverResource: [
    {
      condition: data => data.generateBuiltInUserEntity,
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/couchmove/changelog/V0__create_collections.n1ql', 'config/couchmove/changelog/V0.2__create_indexes.n1ql'],
    },
    {
      condition: data => data.generateBuiltInUserEntity,
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
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/CouchbaseTestContainer.java', 'config/EmbeddedCouchbase.java'],
    },
  ],
};

export function cleanupCouchbaseFilesTask({ application }) {
  if (this.isJhipsterVersionLessThan('7.1.1')) {
    this.removeFile(`${application.javaPackageSrcDir}repository/CustomReactiveCouchbaseRepository.java `);
    this.removeFile(`${application.javaPackageSrcDir}config/DatabaseConfigurationIT.java`);
    this.removeFile(`${application.javaPackageSrcDir}repository/N1qlCouchbaseRepository.java`);
    this.removeFile(`${application.javaPackageSrcDir}repository/ReactiveN1qlCouchbaseRepository.java`);
    this.removeFile(`${application.javaPackageSrcDir}repository/CustomN1qlCouchbaseRepository.java`);
    this.removeFile(`${application.javaPackageSrcDir}repository/CustomCouchbaseRepository.java`);
    this.removeFile(`${application.javaPackageSrcDir}repository/SearchCouchbaseRepository.java`);
    this.removeFile(`${application.javaPackageTestDir}repository/CustomCouchbaseRepositoryTest.java`);
  }

  if (this.isJhipsterVersionLessThan('7.6.1')) {
    this.removeFile(`${application.javaPackageTestDir}repository/JHipsterCouchbaseRepositoryTest.java`);
    this.removeFolder(`${application.javaPackageSrcDir}config/couchbase`);
    this.removeFile(`${application.srcMainResources}config/couchmove/changelog/V0__create_indexes.n1ql`);
    this.removeFile(`${application.srcMainResources}config/couchmove/changelog/V0.1__initial_setup/ROLE_ADMIN.json`);
    this.removeFile(`${application.srcMainResources}config/couchmove/changelog/V0.1__initial_setup/ROLE_USER.json`);
    this.removeFile(`${application.srcMainResources}config/couchmove/changelog/V0.1__initial_setup/user__admin.json`);
    this.removeFile(`${application.srcMainResources}config/couchmove/changelog/V0.1__initial_setup/user__user.json`);
  }
}

export default async function writeCouchbaseFilesTask({ application }) {
  await this.writeFiles({
    sections: couchbaseFiles,
    context: application,
  });
}
