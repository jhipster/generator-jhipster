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
import utils from '../utils.cjs';
import constants from '../generator-constants.cjs';

/* Constants use throughout */
const { ANGULAR } = constants.SUPPORTED_CLIENT_FRAMEWORKS;

const CLIENT_COMMON_TEMPLATES_DIR = 'entity/common';

// eslint-disable-next-line import/prefer-default-export
export async function addEnumerationFiles({ application, entity }, clientFolder) {
  for (const field of entity.fields) {
    if (field.fieldIsEnum === true) {
      const { enumFileName } = field;
      const enumInfo = {
        ...utils.getEnumInfo(field, entity.clientRootFolder),
        frontendAppName: application.frontendAppName,
        packageName: application.packageName,
      };
      if (!entity.skipClient) {
        const modelPath = application.clientFramework === ANGULAR ? 'entities' : 'shared/model';
        const destinationFile = this.destinationPath(`${clientFolder}${modelPath}/enumerations/${enumFileName}.model.ts`);
        await this.writeFiles({
          templates: [
            {
              sourceFile: `${clientFolder}entities/enumerations/enum.model.ts`,
              destinationFile,
            },
          ],
          rootTemplatesPath: [CLIENT_COMMON_TEMPLATES_DIR],
          context: enumInfo,
        });
      }
    }
  }
}
