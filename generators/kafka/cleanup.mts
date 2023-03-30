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
import type KafkaGenerator from './generator.mjs';

export default function cleanupKafkaFilesTask(this: KafkaGenerator, { application }) {
  if (this.isJhipsterVersionLessThan('6.5.2')) {
    this.removeFile(`${application.javaPackageSrcDir}service/${application.upperFirstCamelCaseBaseName}KafkaConsumer.java`);
    this.removeFile(`${application.javaPackageSrcDir}service/${application.upperFirstCamelCaseBaseName}KafkaProducer.java`);
  }
  if (this.isJhipsterVersionLessThan('7.7.1')) {
    this.removeFile(`${application.javaPackageSrcDir}config/KafkaProperties.java`);
  }
  if (this.isJhipsterVersionLessThan('7.10.0')) {
    this.removeFile(`${application.javaPackageSrcDir}config/KafkaSseConsumer.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/KafkaSseProducer.java`);

    // make sure those files are removed and reacreated
    this.removeFile(`${application.srcTestResources}META-INF/spring.factories`);
    this.removeFile(`${application.javaPackageTestDir}config/TestContainersSpringContextCustomizerFactory.java`);
  }
}
