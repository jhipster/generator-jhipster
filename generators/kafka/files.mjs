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
import { SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.mjs';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../server/support/utils.mjs';

/**
 * @type {import('../base/api.mjs').WriteFileSection}
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
export const kafkaFiles = {
  config: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/KafkaSseConsumer.java', 'config/KafkaSseProducer.java'],
    },
  ],
  resources: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      to: moveToJavaPackageSrcDir,
      templates: [
        {
          sourceFile: data => `web/rest/KafkaResource${data.reactive ? '_reactive' : ''}.java`,
          destinationFile: data => `web/rest/${data.upperFirstCamelCaseBaseName}KafkaResource.java`,
        },
      ],
    },
  ],
  test: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/KafkaTestContainer.java', 'config/EmbeddedKafka.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      to: moveToJavaPackageTestDir,
      templates: [
        {
          sourceFile: data => `web/rest/KafkaResourceIT${data.reactive ? '_reactive' : ''}.java`,
          destinationFile: data => `web/rest/${data.upperFirstCamelCaseBaseName}KafkaResourceIT.java`,
        },
      ],
    },
  ],
};

export default function writeKafkaFilesTask({ application }) {
  return this.writeFiles({
    sections: kafkaFiles,
    context: application,
  });
}
