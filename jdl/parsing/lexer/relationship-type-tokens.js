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

const { Lexer } = require('chevrotain');
const { createTokenFromConfig } = require('./token-creator');

const relationshipTypeCategoryToken = createTokenFromConfig({ name: 'RELATIONSHIP_TYPE', pattern: Lexer.NA });

const relationshipTypeTokens = [
  { name: 'ONE_TO_ONE', pattern: 'OneToOne' },
  { name: 'ONE_TO_MANY', pattern: 'OneToMany' },
  { name: 'MANY_TO_ONE', pattern: 'ManyToOne' },
  { name: 'MANY_TO_MANY', pattern: 'ManyToMany' },
].map(tokenConfig => {
  tokenConfig.categories = [relationshipTypeCategoryToken];
  return createTokenFromConfig(tokenConfig);
});

module.exports = {
  categoryToken: relationshipTypeCategoryToken,
  tokens: [relationshipTypeCategoryToken, ...relationshipTypeTokens],
};
