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

module.exports.files = {
  gradle: [
    {
      templates: [
        '.eslintignore.jhi.gradle',
        '.gitignore.jhi.gradle',
        '.prettierignore.jhi.gradle',
        'build.gradle.jhi',
        'settings.gradle.jhi',
        'gradle.properties.jhi',
        { file: 'gradlew', method: 'copy', noEjs: true },
        { file: 'gradlew.bat', method: 'copy', noEjs: true },
        { file: 'gradle/wrapper/gradle-wrapper.jar', method: 'copy', noEjs: true },
        'gradle/wrapper/gradle-wrapper.properties',
      ],
    },
  ],
};
