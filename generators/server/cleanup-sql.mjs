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
/**
 * Removes server files that where generated in previous JHipster versions and therefore
 * need to be removed.
 *
 * @param {any} generator - reference to generator
 * @param {import('./types.mjs').SpringBootApplication} application
 * @param {string} javaDir - Java directory
 * @param {string} testDir - Java tests directory
 * @param {string} mainResourceDir - Main resources directory
 * @param {string} testResourceDir - Test resources directory
 */
export default function cleanupOldServerFiles(generator, application, javaDir, testDir, mainResourceDir, testResourceDir) {
  if (generator.isJhipsterVersionLessThan('4.0.0')) {
    if (application.devDatabaseTypeH2Any) {
      generator.removeFile(`${javaDir}domain/util/FixedH2Dialect.java`);
    }
    if (application.devDatabaseTypePostgres || application.prodDatabaseTypePostgres) {
      generator.removeFile(`${javaDir}domain/util/FixedPostgreSQL82Dialect`);
    }
  }
  if (generator.isJhipsterVersionLessThan('7.8.2')) {
    generator.removeFile(`${testResourceDir}config/application-testcontainers.yml`);
    if (application.reactive) {
      generator.removeFile(`${testDir}ReactiveSqlTestContainerExtension.java`);
    }
  }
  if (application.prodDatabaseTypeMysql && generator.isJhipsterVersionLessThan('7.9.0')) {
    generator.removeFile(`${testResourceDir}testcontainers/mysql/my.cnf`);
  }
}
