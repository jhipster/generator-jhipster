import { asWritingTask } from '../../../base-application/support/task-type-inference.ts';

/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
export default asWritingTask(function cleanupCassandraFilesTask({ application, control }) {
  if (control.isJhipsterVersionLessThan('4.3.0')) {
    this.removeFile(`${application.javaPackageSrcDir}config/cassandra/CustomZonedDateTimeCodec.java`);
  }
  if (control.isJhipsterVersionLessThan('5.8.0')) {
    this.removeFile(`${application.srcTestResources}cassandra-random-port.yml`);
  }
  if (control.isJhipsterVersionLessThan('7.0.0-beta.0')) {
    this.removeFile(`${application.javaPackageSrcDir}config/metrics/CassandraHealthIndicator.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/cassandra/package-info.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/cassandra/CassandraConfiguration.java`);
    this.removeFile(`${application.javaPackageTestDir}config/CassandraConfigurationIT.java`);
  }
  if (control.isJhipsterVersionLessThan('7.7.1')) {
    this.removeFile(`${application.javaPackageTestDir}AbstractCassandraTest.java`);
  }
  if (control.isJhipsterVersionLessThan('7.10.0')) {
    this.removeFile(`${application.javaPackageTestDir}config/TestContainersSpringContextCustomizerFactory.java`);
  }
});
