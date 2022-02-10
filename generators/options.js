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
const commonOptions = {
  'from-cli': {
    desc: 'Indicates the command is run from JHipster CLI',
    type: Boolean,
    hide: true,
  },
  'skip-prettier': {
    desc: 'Skip prettier',
    type: Boolean,
    hide: true,
  },
  'skip-prompts': {
    desc: 'Skip prompts',
    type: Boolean,
  },
  defaults: {
    desc: 'Use default config',
    type: Boolean,
  },
  reproducible: {
    desc: 'Force a reproducible project for testing',
    type: Boolean,
    hide: true,
  },
  add: {
    desc: 'Compose with a generator at current project',
    type: Boolean,
  },
  regenerate: {
    desc: 'Regenerate a generator at current project',
    type: Boolean,
  },
  configure: {
    desc: 'Configure the generator',
    type: Boolean,
  },
  'skip-jhipster-dependencies': {
    desc: "Don't add generator-jhipster and blueprints to package.json.",
    type: Boolean,
  },
};

module.exports = {
  commonOptions,
};
