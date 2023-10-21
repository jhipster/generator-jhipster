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
import { WriteFileSection } from '../base/api.mjs';
import { SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.mjs';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../server/support/index.mjs';
import KafkaGenerator from './generator.mjs';

export const kafkaFiles: WriteFileSection<any, any> = {
  config: [
    {
      condition: data => data.buildToolGradle,
      templates: ['gradle/kafka.gradle'],
    },
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [data => `broker/KafkaConsumer_${data.imperativeOrReactive}.java`, 'broker/KafkaProducer.java'],
    },
  ],
  resources: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      to: moveToJavaPackageSrcDir,
      templates: [
        {
          sourceFile: data => `web/rest/KafkaResource_${data.imperativeOrReactive}.java`,
          destinationFile: data => `web/rest/${data.upperFirstCamelCaseBaseName}KafkaResource.java`,
        },
      ],
    },
  ],
  test: [
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        'config/KafkaTestContainer.java',
        'config/EmbeddedKafka.java',
        'config/KafkaTestContainersSpringContextCustomizerFactory.java',
      ],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      to: moveToJavaPackageTestDir,
      templates: [
        {
          sourceFile: data => `web/rest/KafkaResourceIT_${data.imperativeOrReactive}.java`,
          destinationFile: data => `web/rest/${data.upperFirstCamelCaseBaseName}KafkaResourceIT.java`,
        },
      ],
    },
  ],
};

export const pulsarFiles: WriteFileSection<any, any> = {
  config: [
    {
      condition: data => data.buildToolGradle,
      templates: ['gradle/pulsar.gradle'],
    },
  ],
  test: [
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        'broker/PulsarIT.java',
        'config/BrokerConfiguration.java',
        'config/EmbeddedPulsar.java',
        'config/PulsarTestContainer.java',
        'config/PulsarTestContainersSpringContextCustomizerFactory.java',
      ],
    },
  ],
};

export default async function writeFilesTask(this: KafkaGenerator, { application }) {
  if (application.messageBrokerKafka) {
    await this.writeFiles({
      sections: kafkaFiles,
      context: application,
    });
  }
  if (application.messageBrokerPulsar) {
    await this.writeFiles({
      sections: pulsarFiles,
      context: application,
    });
  }
}
