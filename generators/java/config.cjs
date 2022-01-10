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
const {
  PACKAGE_NAME,
  PACKAGE_NAME_DEFAULT_VALUE,
  PRETTIER_JAVA_INDENT,
  PRETTIER_JAVA_INDENT_DEFAULT_VALUE,
  BUILD_TOOL,
  BUILD_TOOL_DEFAULT_VALUE,
  BUILD_DESTINATION,
  BUILD_DESTINATION_DEFAULT_VALUE,
} = require('./constants.cjs');

/** Config required at .yo-rc.json */
const requiredConfig = {
  [PACKAGE_NAME]: PACKAGE_NAME_DEFAULT_VALUE,
  [BUILD_TOOL]: BUILD_TOOL_DEFAULT_VALUE,
};

/** Default config for templates */
const defaultConfig = {
  ...requiredConfig,
  [PRETTIER_JAVA_INDENT]: PRETTIER_JAVA_INDENT_DEFAULT_VALUE,
  [BUILD_DESTINATION]: BUILD_DESTINATION_DEFAULT_VALUE,
};

module.exports = { requiredConfig, defaultConfig };
