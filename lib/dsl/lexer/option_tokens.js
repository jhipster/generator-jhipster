/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { createTokenFromConfig } = require('./token_creator');

const optionTokens = [
  { name: 'WITH', pattern: 'with' },
  { name: 'EXCEPT', pattern: 'except' },
  { name: 'CLIENT_ROOT_FOLDER', pattern: 'clientRootFolder' },
  { name: 'NO_FLUENT_METHOD', pattern: 'noFluentMethod' },
  { name: 'READ_ONLY', pattern: 'readOnly' },
  { name: 'EMBEDDED', pattern: 'embedded' },
  { name: 'DTO', pattern: 'dto' },
  { name: 'PAGINATE', pattern: 'paginate' },
  { name: 'SERVICE', pattern: 'service' },
  { name: 'MICROSERVICE', pattern: 'microservice' },
  { name: 'SEARCH', pattern: 'search' },
  { name: 'ANGULAR_SUFFIX', pattern: 'angularSuffix' },
  { name: 'FILTER', pattern: 'filter' }
].map(createTokenFromConfig);

module.exports = {
  tokens: optionTokens
};
