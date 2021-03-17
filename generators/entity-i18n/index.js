/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const writeFiles = require('./files').writeFiles;
const utils = require('../utils');
const BaseBlueprintGenerator = require('../generator-base-blueprint');

/* constants used throughout */
let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts);

    this.entity = opts.context;
    this.jhipsterContext = opts.jhipsterContext || opts.context;

    useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('entity-i18n', { context: opts.context });
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      ...super._missingPreDefault(),

      loadEntityIntoGenerator() {
        utils.copyObjectProps(this, this.entity);
      },
    };
  }

  get default() {
    if (useBlueprints) return;
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return { ...writeFiles(), ...super._missingPostWriting() };
  }

  get writing() {
    if (useBlueprints) return;
    return this._writing();
  }
};
