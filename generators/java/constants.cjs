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
const { MAVEN: BUILD_TOOL_MAVEN, MAVEN_DESCRIPTION, BUILD_DESTINATION_VALUE } = require('../maven/constants.cjs');
const { GRADLE: BUILD_TOOL_GRADLE, GRADLE_DESCRIPTION } = require('../gradle/constants.cjs');

const JAVA_VERSION = '11';
const JAVA_COMPATIBLE_VERSIONS = ['11', '12', '13', '14', '15', '16', '17'];
const JAVA_APP_VERSION = '0.0.1-SNAPSHOT';
const JAVA_SOURCE_DIR = 'src/main/java/';
const JAVA_RESOURCE_DIR = 'src/main/resources/';
const JAVA_TEST_DIR = 'src/test/java/';

const PACKAGE_NAME = 'packageName';
const PACKAGE_NAME_DESCRIPTION = 'Package name';
const PACKAGE_NAME_DEFAULT_VALUE = 'com.mycompany.myapp';

const PRETTIER_JAVA_INDENT = 'prettierJavaIndent';
const PRETTIER_JAVA_INDENT_DEFAULT_VALUE = 4;

const BUILD_TOOL = 'buildTool';
const BUILD_TOOL_DESCRIPTION = 'Build tool';
const BUILD_TOOL_DEFAULT_VALUE = 'maven';
const BUILD_TOOL_PROMPT_CHOICES = [
  { value: BUILD_TOOL_MAVEN, name: MAVEN_DESCRIPTION },
  { value: BUILD_TOOL_GRADLE, name: GRADLE_DESCRIPTION },
];

const BUILD_DESTINATION = 'buildDestination';
const BUILD_DESTINATION_DESCRIPTION = 'Build destination';
const BUILD_DESTINATION_DEFAULT_VALUE = BUILD_DESTINATION_VALUE;

module.exports = {
  JAVA_VERSION,
  JAVA_COMPATIBLE_VERSIONS,
  JAVA_APP_VERSION,
  JAVA_SOURCE_DIR,
  JAVA_RESOURCE_DIR,
  JAVA_TEST_DIR,
  PACKAGE_NAME,
  PACKAGE_NAME_DESCRIPTION,
  PACKAGE_NAME_DEFAULT_VALUE,
  PRETTIER_JAVA_INDENT,
  PRETTIER_JAVA_INDENT_DEFAULT_VALUE,
  BUILD_TOOL,
  BUILD_TOOL_DESCRIPTION,
  BUILD_TOOL_MAVEN,
  BUILD_TOOL_GRADLE,
  BUILD_TOOL_DEFAULT_VALUE,
  BUILD_TOOL_PROMPT_CHOICES,
  BUILD_DESTINATION,
  BUILD_DESTINATION_DESCRIPTION,
  BUILD_DESTINATION_DEFAULT_VALUE,
};
