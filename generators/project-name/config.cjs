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
const { version: jhipsterVersion } = require('../../package.json');

const { BASE_NAME, JHIPSTER_VERSION, PROJECT_NAME, PROJECT_NAME_DEFAULT_VALUE } = require('./constants.cjs');

/** Reproducible config */
const reproducibleConfigForTests = {
  [JHIPSTER_VERSION]: '0.0.0',
  [BASE_NAME]: 'jhipster',
};

/** Required config */
const requiredConfig = {
  [JHIPSTER_VERSION]: jhipsterVersion,
  [PROJECT_NAME]: PROJECT_NAME_DEFAULT_VALUE,
};

/** Default config for templates */
const defaultConfig = {
  ...requiredConfig,
};

module.exports = { requiredConfig, defaultConfig, reproducibleConfigForTests };
