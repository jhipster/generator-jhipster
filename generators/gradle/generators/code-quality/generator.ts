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
import type { Source as CommonSource } from '../../../common/types.d.ts';
import { GRADLE_BUILD_SRC_MAIN_DIR } from '../../../generator-constants.js';
import { GENERATOR_GRADLE } from '../../../generator-list.ts';
import { JavaApplicationGenerator } from '../../../java/generator.ts';

export default class CodeQualityGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java:bootstrap');
      await this.dependsOnJHipster(GENERATOR_GRADLE);
    }
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          blocks: [{ templates: [`${GRADLE_BUILD_SRC_MAIN_DIR}/jhipster.code-quality-conventions.gradle`] }],
          context: application,
        });
      },
    });
  }

  get [JavaApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      jacoco({ application, source }) {
        const { javaDependencies } = application;
        source.addGradleDependencyCatalogVersions!([{ name: 'jacoco', version: javaDependencies!['jacoco-maven-plugin'] }]);
        (source as CommonSource).addSonarProperties?.([
          { key: 'sonar.coverage.jacoco.xmlReportPaths', value: `${application.temporaryDir}reports/jacoco/test/jacocoTestReport.xml` },
          { key: 'sonar.java.codeCoveragePlugin', value: 'jacoco' },
          {
            key: 'sonar.junit.reportPaths',
            value: `${application.temporaryDir}test-results/test,${application.temporaryDir}test-results/integrationTest`,
          },
        ]);
      },
      customize({ application, source }) {
        const { javaDependencies } = application;
        source.addGradleDependencyCatalogVersions!([{ name: 'checkstyle', version: javaDependencies!.checkstyle }]);
        source.addGradleBuildSrcDependencyCatalogLibraries?.([
          {
            libraryName: 'sonarqube-plugin',
            module: 'org.sonarsource.scanner.gradle:sonarqube-gradle-plugin',
            version: javaDependencies!['gradle-sonarqube'],
            scope: 'implementation',
          },
          {
            libraryName: 'spotless-plugin',
            module: 'com.diffplug.spotless:spotless-plugin-gradle',
            version: javaDependencies!['spotless-gradle-plugin'],
            scope: 'implementation',
          },
          {
            libraryName: 'modernizer-plugin',
            module: 'com.github.andygoossens:gradle-modernizer-plugin',
            version: javaDependencies!['gradle-modernizer-plugin'],
            scope: 'implementation',
          },
          {
            libraryName: 'nohttp-plugin',
            module: 'io.spring.nohttp:nohttp-gradle',
            version: javaDependencies!['nohttp-checkstyle'],
            scope: 'implementation',
          },
        ]);
        source.addGradlePlugin?.({ id: 'jhipster.code-quality-conventions' });
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
