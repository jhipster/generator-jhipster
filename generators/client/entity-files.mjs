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
import { getEnumInfo } from '../utils.mjs';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.mjs';

const CLIENT_COMMON_TEMPLATES_DIR = 'entity/common';

async function addEnumerationFiles({ application, entity }) {
  for (const field of entity.fields) {
    if (field.fieldIsEnum === true) {
      const { enumFileName } = field;
      const enumInfo = {
        ...getEnumInfo(field, entity.clientRootFolder),
        frontendAppName: application.frontendAppName,
        packageName: application.packageName,
        webappEnumerationsDir: application.webappEnumerationsDir,
      };
      await this.writeFiles({
        templates: [
          {
            sourceFile: `${CLIENT_MAIN_SRC_DIR}app/entities/enumerations/enum.model.ts`,
            destinationFile: ctx => `${application.webappEnumerationsDir}${enumFileName}.model.ts`,
          },
        ],
        context: enumInfo,
      });
    }
  }
}

// eslint-disable-next-line import/prefer-default-export
export async function writeEnumerationFiles({ application, entities }) {
  if (!application.webappEnumerationsDir) return;
  for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
    await addEnumerationFiles.call(this, { application, entity });
  }
}
