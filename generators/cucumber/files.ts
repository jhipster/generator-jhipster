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
import { asWriteFilesSection, asWritingTask } from '../base-application/support/index.ts';
import { SERVER_TEST_RES_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.js';
import { moveToJavaPackageTestDir } from '../java/support/index.ts';

const cucumberFiles = asWriteFilesSection({
  cucumberFiles: [
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        // Create Cucumber test files
        'cucumber/CucumberTest.java',
        'cucumber/stepdefs/StepDefs.java',
        'cucumber/stepdefs/BasicStepDefs.java',
        'cucumber/CucumberTestContextConfiguration.java',
      ],
    },
    {
      path: `${SERVER_TEST_RES_DIR}_package_/`,
      renameTo: (data, filename) => `${data.srcTestResources}${data.packageFolder}${filename}`,
      templates: ['cucumber/basic.feature'],
    },
  ],
  account: [
    {
      condition: data => data.generateUserManagement,
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['cucumber/stepdefs/AccountStepDefs.java'],
    },
    {
      condition: data => data.generateUserManagement,
      path: `${SERVER_TEST_RES_DIR}_package_/`,
      renameTo: (data, filename) => `${data.srcTestResources}${data.packageFolder}${filename}`,
      templates: ['cucumber/account.feature'],
    },
  ],
  user: [
    {
      condition: data => data.generateUserManagement && !data.databaseTypeCassandra,
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['cucumber/stepdefs/UserStepDefs.java'],
    },
    {
      condition: data => data.generateUserManagement && !data.databaseTypeCassandra,
      path: `${SERVER_TEST_RES_DIR}_package_/`,
      renameTo: (data, filename) => `${data.srcTestResources}${data.packageFolder}${filename}`,
      templates: ['cucumber/user.feature'],
    },
  ],
});

export default asWritingTask(async function writeTask({ application }) {
  await this.writeFiles({
    sections: cucumberFiles,
    context: application,
  });
});
