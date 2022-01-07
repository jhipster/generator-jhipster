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

const { isString } = require('lodash');
const { createToken } = require('chevrotain');
const { NAME, KEYWORD, namePattern } = require('./shared-tokens');

module.exports = {
  createTokenFromConfig,
};

function createTokenFromConfig(config) {
  if (!config) {
    throw new Error("Can't create a token without the proper config.");
  }
  // JDL has a great many keywords. Keywords can conflict with identifiers in a parsing
  // library with a separate lexing phase.
  // See: https://github.com/SAP/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
  // a Concise way to resolve the problem without manually adding the "longer_alt" property dozens of times.
  if (isString(config.pattern) && namePattern.test(config.pattern)) {
    config.longer_alt = NAME;
    if (!config.categories) {
      config.categories = [];
    }
    config.categories.push(KEYWORD);
  }

  // readable labels for diagrams
  if (isString(config.pattern) && !config.label) {
    config.label = `'${config.pattern}'`;
  }

  return createToken(config);
}
