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
const chalk = require('chalk');
const needleServer = require('./needle-server');
const constants = require('../../generator-constants');
const { CAFFEINE, EHCACHE, REDIS } = require('../../../jdl/jhipster/cache-types');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

module.exports = class extends needleServer {
  addEntityToCache(entityClass, relationships, packageName, packageFolder, cacheProvider) {
    const entityAbsoluteClass = entityClass.includes('.') ? entityClass : `${packageName}.domain.${entityClass}`;
    const entityClassNameGetter = `${entityAbsoluteClass}.class.getName()`;
    this.addEntryToCache(entityClassNameGetter, packageFolder, cacheProvider);
    // Add the collections linked to that entity to cache
    relationships.forEach(relationship => {
      const relationshipType = relationship.relationshipType;
      if (relationshipType === 'one-to-many' || relationshipType === 'many-to-many') {
        this.addEntryToCache(`${entityClassNameGetter} + ".${relationship.relationshipFieldNamePlural}"`, packageFolder, cacheProvider);
      }
    });
  }

  addEntryToCache(entry, packageFolder, cacheProvider) {
    const errorMessage = chalk.yellow(`\nUnable to add ${entry} to CacheConfiguration.java file.`);
    const cachePath = `${SERVER_MAIN_SRC_DIR}${packageFolder}/config/CacheConfiguration.java`;

    if (cacheProvider === EHCACHE || cacheProvider === CAFFEINE) {
      const needle = `jhipster-needle-${cacheProvider}-add-entry`;
      const content = `createCache(cm, ${entry});`;

      this._doAddBlockContentToFile(cachePath, needle, content, errorMessage);
    } else if (cacheProvider === REDIS) {
      const needle = 'jhipster-needle-redis-add-entry';
      const content = `createCache(cm, ${entry}, jcacheConfiguration);`;

      this._doAddBlockContentToFile(cachePath, needle, content, errorMessage);
    }
  }

  _doAddBlockContentToFile(cachePath, needle, content, errorMessage) {
    const rewriteFileModel = this.generateFileModel(cachePath, needle, content);
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }
};
