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
import path from 'path';
import ejs from 'ejs';
// eslint-disable-next-line  import/no-named-default
import { default as appendYeomanOptionsFromGeneratorOptions } from '../options.mjs';
import { resetFakerSeed } from '../sequences.mjs';

const appendCallBackToTemplate = (generator, cb, promise, source) => {
  if (cb) {
    return promise
      .then(res => cb(res))
      .catch(err => {
        generator.warning(`Copying template ${source} failed. [${err}]`);
        throw err;
      });
  }
  return promise;
};
/**
 * Render content
 *
 * @param {string} source source template
 * @param {object} generator reference to the generator
 * @param {any} context context
 * @param {object} options options
 * @param {function} [cb] callback function
 * @return {Promise<String>} Promise rendered content
 */
const renderContent = (source, generator, context, options, cb) => {
  const optionsWithYeoman = appendYeomanOptionsFromGeneratorOptions(generator, options);
  if (source) {
    const basename = path.basename(source);
    resetFakerSeed(context, basename);
  }
  const promise = ejs.renderFile(generator.templatePath(source), context, optionsWithYeoman);
  return appendCallBackToTemplate(generator, cb, promise, source);
};

const writeContent = (_this, context, destination, options, source) => {
  // TODO simplify: looks like there's no need of so much params
  return renderContent(source, _this, context, options)
    .then(res => {
      _this.fs.write(destination, res);
      return destination;
    })
    .catch(error => {
      this.warning(source);
      throw error;
    });
};

export { renderContent, writeContent };
