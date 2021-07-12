/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const { MAVEN: BUILD_TOOL_MAVEN, MAVEN_DESCRIPTION } = require('../maven/constants.cjs');
const { GRADLE: BUILD_TOOL_GRADLE, GRADLE_DESCRIPTION } = require('../gradle/constants.cjs');

const JAVA_VERSION = '11';
const JAVA_COMPATIBLE_VERSIONS = ['1.8', '1.9', '10', '11', '12', '13', '14', '15', '16'];
const JAVA_APP_VERSION = '0.0.1-SNAPSHOT';
const JHIPSTER_BOM_VERSION = '7.1.1-SNAPSHOT';

const SRC_MAIN_JAVA_DIR = 'src/main/java/';
const SRC_MAIN_RESOURCES_DIR = 'src/main/resources/';
const SRC_TEST_JAVA_DIR = 'src/test/java/';

const BUILD_TOOL = 'buildTool';
const PACKAGE_NAME = 'packageName';
const PRETTIER_JAVA_INDENT = 'prettierJavaIndent';

const BUILD_TOOL_DEFAULT = BUILD_TOOL_MAVEN;

const SUPPORTED_BUILD_TOOLS = [BUILD_TOOL_MAVEN, BUILD_TOOL_GRADLE];

const BUILD_TOOL_PROMPT_CHOICES = [
  { value: BUILD_TOOL_MAVEN, name: MAVEN_DESCRIPTION },
  { value: BUILD_TOOL_GRADLE, name: GRADLE_DESCRIPTION },
];

module.exports = {
  JAVA_VERSION,
  JAVA_COMPATIBLE_VERSIONS,
  JAVA_APP_VERSION,
  JHIPSTER_BOM_VERSION,
  BUILD_TOOL,
  BUILD_TOOL_DEFAULT,
  BUILD_TOOL_DESCRIPTION: 'Build tool',
  BUILD_TOOL_MAVEN,
  BUILD_TOOL_GRADLE,
  BUILD_TOOL_PROMPT_CHOICES,
  PACKAGE_NAME,
  PACKAGE_NAME_DESCRIPTION: 'Application package name',
  PRETTIER_JAVA_INDENT,
  SRC_MAIN_JAVA_DIR,
  SRC_MAIN_RESOURCES_DIR,
  SRC_TEST_JAVA_DIR,
  SUPPORTED_BUILD_TOOLS,
};
