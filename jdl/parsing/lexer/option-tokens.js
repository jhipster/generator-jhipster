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

const { createTokenFromConfig } = require('./token-creator');
const {
  KEYWORD,
  sharedCategoryTokens: { UNARY_OPTION, BINARY_OPTION },
} = require('./shared-tokens');

const optionTokens = [
  { name: 'WITH', pattern: 'with' },
  { name: 'EXCEPT', pattern: 'except' },
  { name: 'USE', pattern: 'use' },
  { name: 'FOR', pattern: 'for' },
  { name: 'CLIENT_ROOT_FOLDER', pattern: 'clientRootFolder', type: 'binary' },
  { name: 'NO_FLUENT_METHOD', pattern: 'noFluentMethod', type: 'unary' },
  { name: 'READ_ONLY', pattern: 'readOnly', type: 'unary' },
  { name: 'EMBEDDED', pattern: 'embedded', type: 'unary' },
  { name: 'DTO', pattern: 'dto', type: 'binary' },
  { name: 'PAGINATE', pattern: 'paginate', type: 'binary' },
  { name: 'SERVICE', pattern: 'service', type: 'binary' },
  { name: 'MICROSERVICE', pattern: 'microservice', type: 'binary' },
  { name: 'SEARCH', pattern: 'search', type: 'binary' },
  { name: 'ANGULAR_SUFFIX', pattern: 'angularSuffix', type: 'binary' },
  { name: 'FILTER', pattern: 'filter', type: 'unary' },
].map(tokenConfig => {
  if (tokenConfig.type === 'unary') {
    tokenConfig.categories = [UNARY_OPTION, KEYWORD];
  } else if (tokenConfig.type === 'binary') {
    tokenConfig.categories = [BINARY_OPTION, KEYWORD];
  }
  // clean up the custom attribute from the config, it doesn't belong to chevrotain and its sole purpose is to
  // temporarily flag tokens that won't have a category.
  delete tokenConfig.type;
  return createTokenFromConfig(tokenConfig);
});

module.exports = {
  tokens: optionTokens,
};
