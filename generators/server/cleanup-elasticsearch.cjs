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
/**
 * Removes server files that where generated in previous JHipster versions and therefore
 * need to be removed.
 *
 * @param {any} generator - reference to generator
 * @param {string} javaDir - Java directory
 * @param {string} testDir - Java tests directory
 * @param {string} mainResourceDir - Main resources directory
 * @param {string} testResourceDir - Test resources directory
 */
function cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir) {
  if (generator.isJhipsterVersionLessThan('4.0.0')) {
    generator.removeFile(`${javaDir}config/ElasticSearchConfiguration.java`);
  }
  if (generator.isJhipsterVersionLessThan('5.2.2')) {
    generator.removeFile(`${javaDir}config/ElasticsearchConfiguration.java`);
  }
  if (generator.isJhipsterVersionLessThan('7.0.0-beta.0')) {
    generator.removeFile(`${testDir}config/ElasticsearchTestConfiguration.java`);
  }
  if (generator.isJhipsterVersionLessThan('7.7.1')) {
    if (!generator.skipUserManagement) {
      generator.removeFile(`${testDir}repository/search/UserSearchRepositoryMockConfiguration.java`);
    }
  }
  if (generator.isJhipsterVersionLessThan('7.9.3')) {
    if (generator.reactive) {
      generator.removeFile(`${testDir}config/ElasticsearchReactiveTestConfiguration.java`);
    }
  }
}

module.exports = {
  cleanupOldServerFiles,
};
