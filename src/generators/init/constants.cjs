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
const NODE_VERSION = '14.18.1';

const PRETTIER_DEFAULT_INDENT = 'prettierDefaultIndent';
const PRETTIER_DEFAULT_INDENT_DEFAULT_VALUE = 2;

const SKIP_COMMIT_HOOK = 'skipCommitHook';
const SKIP_COMMIT_HOOK_DESCRIPTION = 'Skip adding husky commit hooks';
const SKIP_COMMIT_HOOK_DEFAULT_VALUE = false;

module.exports = {
  NODE_VERSION,
  PRETTIER_DEFAULT_INDENT,
  PRETTIER_DEFAULT_INDENT_DEFAULT_VALUE,
  SKIP_COMMIT_HOOK,
  SKIP_COMMIT_HOOK_DESCRIPTION,
  SKIP_COMMIT_HOOK_DEFAULT_VALUE,
};
