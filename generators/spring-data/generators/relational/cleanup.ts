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
import { asWritingTask } from '../../../base-application/support/task-type-inference.ts';

import type { Application, Entity } from './types.ts';

/**
 * Removes server files that where generated in previous JHipster versions and therefore
 * need to be removed.
 */
export default asWritingTask<Entity, Application>(function cleanupOldServerFilesTask({ application, control }) {
  if (control.isJhipsterVersionLessThan('4.0.0')) {
    if (application.devDatabaseTypeH2Any) {
      this.removeFile(`${application.javaPackageSrcDir}domain/util/FixedH2Dialect.java`);
    }
    if (application.prodDatabaseTypePostgresql) {
      this.removeFile(`${application.javaPackageSrcDir}domain/util/FixedPostgreSQL82Dialect`);
    }
  }
  if (control.isJhipsterVersionLessThan('7.8.2')) {
    this.removeFile(`${application.srcTestResources}config/application-testcontainers.yml`);
    if (application.reactive) {
      this.removeFile(`${application.javaPackageTestDir}ReactiveSqlTestContainerExtension.java`);
    }
  }
  if (application.prodDatabaseTypeMysql && control.isJhipsterVersionLessThan('7.9.0')) {
    this.removeFile(`${application.srcTestResources}testcontainers/mysql/my.cnf`);
  }
});
