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

import { Lexer } from 'chevrotain';
import { KEYWORD } from './shared-tokens.js';
import createTokenFromConfig from './token-creator.js';

const mixMaxCategoryToken = createTokenFromConfig({ name: 'MIN_MAX_KEYWORD', pattern: Lexer.NA, categories: KEYWORD });

const minMaxTokens = [
  { name: 'MINLENGTH', pattern: 'minlength' },
  { name: 'MAXLENGTH', pattern: 'maxlength' },
  { name: 'MINBYTES', pattern: 'minbytes' },
  { name: 'MAXBYTES', pattern: 'maxbytes' },
  { name: 'MIN', pattern: 'min' },
  { name: 'MAX', pattern: 'max' },
].map(tokenConfig => {
  (tokenConfig as any).categories = [mixMaxCategoryToken];
  return createTokenFromConfig(tokenConfig);
});

export default {
  categoryToken: mixMaxCategoryToken,
  tokens: [mixMaxCategoryToken, ...minMaxTokens],
};
