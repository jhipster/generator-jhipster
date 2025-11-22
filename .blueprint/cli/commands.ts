/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

const defaultCommands = {
  'code-workspace': {
    desc: 'Prepare a code-workspace for jhipster development',
    blueprint: '@jhipster/jhipster-dev',
  },
  'from-issue': {
    desc: 'Generate a sample from issue',
    blueprint: '@jhipster/jhipster-dev',
  },
  'generate-generator': {
    desc: 'Generate a generator',
    blueprint: '@jhipster/jhipster-dev',
  },
  'generate-sample': {
    desc: 'Generate a test sample',
    blueprint: '@jhipster/jhipster-dev',
  },
  'github-build-matrix': {
    desc: 'Generate a matrix for GitHub Actions',
    blueprint: '@jhipster/jhipster-dev',
  },
  'update-generators': {
    desc: 'Update generator-jhipster generators files',
    blueprint: '@jhipster/jhipster-dev',
  },
  'update-spring-boot': {
    desc: 'Update Spring Boot metadata files',
    blueprint: '@jhipster/jhipster-dev',
  },
  'update-vscode': {
    desc: 'Update generator-jhipster vscode files',
    blueprint: '@jhipster/jhipster-dev',
  },
};

export default defaultCommands;
