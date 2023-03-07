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
import Generator from './generator.mjs';
import { moveToJavaPackageTestDir } from '../server/support/index.mjs';
import { SERVER_TEST_SRC_DIR, SERVER_TEST_RES_DIR } from '../generator-constants.mjs';
import { WriteFileSection } from '../base/api.mjs';
import { SpringBootApplication } from '../server/types.mjs';

const cucumberFiles: WriteFileSection<Generator, SpringBootApplication> = {
  cucumberFiles: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        // Create Cucumber test files
        'cucumber/CucumberIT.java',
        'cucumber/stepdefs/StepDefs.java',
        'cucumber/CucumberTestContextConfiguration.java',
      ],
    },
    {
      path: `${SERVER_TEST_RES_DIR}package/`,
      renameTo: (data, filename) => `${data.srcTestResources}${data.packageFolder}${filename}`,
      templates: ['cucumber/gitkeep'],
    },
    {
      condition: generator => generator.generateUserManagement && !generator.databaseTypeMongodb && !generator.databaseTypeCassandra,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['cucumber/stepdefs/UserStepDefs.java'],
    },
    {
      condition: generator => generator.generateUserManagement && !generator.databaseTypeMongodb && !generator.databaseTypeCassandra,
      path: `${SERVER_TEST_RES_DIR}package/`,
      renameTo: (data, filename) => `${data.srcTestResources}${data.packageFolder}${filename}`,
      templates: ['cucumber/user.feature'],
    },
  ],
};

export default async function writeTask(this: Generator, { application }) {
  await this.writeFiles({
    sections: cucumberFiles,
    context: application,
  });
}
