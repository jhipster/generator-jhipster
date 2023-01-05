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
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../server/utils.mjs';

export const mongoDbFiles = {
  serverResource: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/dbmigrations/package-info.java'],
    },
    {
      condition: generator => generator.generateBuiltInUserEntity,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/dbmigrations/InitialSetupMigration.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/MongoDbTestContainer.java', 'config/EmbeddedMongo.java'],
    },
  ],
};

export default async function writeMongodbFilesTask({ application }) {
  await this.writeFiles({
    sections: mongoDbFiles,
    context: application,
  });
}
