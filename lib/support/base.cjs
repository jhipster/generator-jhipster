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
const { platform } = require('os');
const { normalizeLineEndings } = require('../../generators/utils');

const isWin32 = platform() === 'win32';

/**
 * Converts multiples EditFileCallback callbacks into one.
 *
 * @param {...import('../../generators/generator-base.js').EditFileCallback} callbacks
 * @returns {import('../../generators/generator-base.js').EditFileCallback}
 */
const joinCallbacks = (...callbacks) => {
  return function (content, filePath) {
    if (isWin32 && content.match(/\r\n/)) {
      callbacks = [ct => normalizeLineEndings(ct, '\n')].concat(callbacks).concat(ct => normalizeLineEndings(ct, '\r\n'));
    }
    for (const callback of callbacks) {
      content = callback.call(this, content, filePath);
    }
    return content;
  };
};

module.exports = {
  joinCallbacks,
};
