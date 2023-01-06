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
 * @param {import('../base')} this - reference to generator
 * @param {Object} application
 * @param {Object} entity
 */
// eslint-disable-next-line import/prefer-default-export
export function cleanupOldFiles({
  application: { packageFolder, srcMainJava, srcTestJava, searchEngineElasticsearch },
  entity: { entityClass, entityAbsoluteFolder },
}) {
  if (this.isJhipsterVersionLessThan('7.6.1')) {
    if (searchEngineElasticsearch) {
      this.removeFile(`${srcMainJava}${packageFolder}/repository/search/SortToFieldSortBuilderConverter.java`);
    }
  }
  if (this.isJhipsterVersionLessThan('7.7.1')) {
    this.removeFile(`${srcMainJava}${packageFolder}/repository/search/SortToSortBuilderListConverter.java`);
    this.removeFile(`${srcTestJava}${entityAbsoluteFolder}/repository/search/${entityClass}SearchRepositoryMockConfiguration.java`);
  }
}
