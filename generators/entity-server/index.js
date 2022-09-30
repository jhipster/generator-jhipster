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
/* eslint-disable consistent-return */
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { WRITING_PRIORITY, POST_WRITING_PRIORITY } = require('../../lib/constants/priorities.cjs').compat;

const { entityDefaultConfig } = require('../generator-defaults');
const { writeFiles, customizeFiles } = require('./files');
const { GENERATOR_ENTITY_SERVER } = require('../generator-list');
const { SQL } = require('../../jdl/jhipster/database-types');
const { isReservedTableName } = require('../../jdl/jhipster/reserved-keywords');

/* constants used throughout */

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.application = this.options.application;
    this.entity = this.options.context || { ...entityDefaultConfig };

    this.jhipsterContext = this.options.jhipsterContext || this.options.context;
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_ENTITY_SERVER, { context: this.options.context });
    }
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      ...writeFiles(),
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  // Public API method used by the getter and also by Blueprints
  _postWriting() {
    return {
      customizeFiles() {
        return customizeFiles.call(this);
      },
    };
  }

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._postWriting();
  }

  _generateSqlSafeName(name) {
    if (isReservedTableName(name, SQL)) {
      return `e_${name}`;
    }
    return name;
  }
};
