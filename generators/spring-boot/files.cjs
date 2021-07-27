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
const { SRC_MAIN_JAVA_DIR, SRC_MAIN_RESOURCES_DIR, SRC_TEST_JAVA_DIR } = require('../java/constants.cjs');

module.exports.files = {
  springBootProject: [
    {
      templates: ['pom.xml.jhi.spring-boot', 'build.gradle.jhi.spring-boot'],
    },
    {
      path: SRC_MAIN_RESOURCES_DIR,
      templates: ['application.properties.jhi'],
    },
    {
      path: SRC_MAIN_JAVA_DIR,
      templates: [
        { file: 'package/Application.java.jhi', renameTo: generator => `${generator.packageFolder}/${generator.javaMainClass}.java.jhi` },
      ],
    },
    {
      path: SRC_TEST_JAVA_DIR,
      templates: [
        {
          file: 'package/ApplicationTests.java.jhi',
          renameTo: generator => `${generator.packageFolder}/${generator.javaMainClass}Tests.java.jhi`,
        },
      ],
    },
  ],
};
