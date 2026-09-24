/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { type ITokenConfig, type TokenType, createToken } from 'chevrotain';

import { KEYWORD, namePattern } from './shared-tokens.ts';

export default function createTokenFromConfig(tokenConfig: ITokenConfig, keywordCategory: TokenType = KEYWORD) {
  if (!tokenConfig) {
    throw new Error("Can't create a token without the proper config.");
  }
  // Token configs may be shared between runtimes, so never mutate the passed config.
  const originalCategories = tokenConfig.categories ?? [];
  const categories = Array.isArray(originalCategories) ? [...originalCategories] : [originalCategories];
  const config: ITokenConfig = { ...tokenConfig, categories };
  if (typeof config.pattern === 'string') {
    // readable labels for diagrams
    config.label ??= `'${config.pattern}'`;
  }
  // JDL has a great many keywords. Keywords can conflict with identifiers in a parsing
  // library with a separate lexing phase.
  // See: https://github.com/Chevrotain/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
  // A keyword is matched only as a whole word: it must not be followed by another identifier character.
  // Otherwise a keyword that is a prefix of an identifier (`entity` in `entityName`) or of another keyword
  // (`microfrontend` in `microfrontends`) would match first, whatever the order the tokens are declared in.
  if (typeof config.pattern === 'string' && namePattern.test(config.pattern)) {
    config.pattern = new RegExp(`${config.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zA-Z_\\-\\d])`);
    config.longer_alt ??= keywordCategory.CATEGORIES?.[0];
    categories.push(keywordCategory);
  }

  return createToken(config);
}
