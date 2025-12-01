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
import { JavaApplicationGenerator } from '../../generator.ts';

import cleanupTask from './cleanup.ts';
import writeEntityTask, { cleanupEntitiesTask } from './entity-files.ts';
import writeTask from './files.ts';

export default class GatlingGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('java');
    }
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupTask,
      writeTask,
    });
  }

  get [JavaApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      cleanupEntitiesTask,
      writeEntityTask,
    });
  }

  get [JavaApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addDependencies({ application, source }) {
        const { javaDependencies } = application;
        if (application.buildToolMaven) {
          source.addMavenDefinition?.({
            properties: [
              { property: 'gatling.version', value: javaDependencies?.gatling },
              { property: 'gatling-maven-plugin.version', value: javaDependencies?.['gatling-maven-plugin'] },
            ],
            dependencies: [
              // eslint-disable-next-line no-template-curly-in-string
              { groupId: 'io.gatling.highcharts', artifactId: 'gatling-charts-highcharts', version: '${gatling.version}', scope: 'test' },
            ],
            plugins: [{ groupId: 'io.gatling', artifactId: 'gatling-maven-plugin' }],
            pluginManagement: [
              {
                groupId: 'io.gatling',
                artifactId: 'gatling-maven-plugin',
                // eslint-disable-next-line no-template-curly-in-string
                version: '${gatling-maven-plugin.version}',
                additionalContent: `
<configuration>
    <runMultipleSimulations>true</runMultipleSimulations>
</configuration>
`,
              },
            ],
          });
        }
        if (application.buildToolGradle) {
          source.addGradleDependencyCatalogVersion?.({ name: 'gatling-plugin', version: javaDependencies?.['gatling-gradle'] });
          source.addGradleDependencyCatalogVersion?.({ name: 'gatling-highcharts', version: javaDependencies?.gatling });
          source.addGradleBuildSrcDependencyCatalogVersion?.({ name: 'gatling-plugin', version: javaDependencies?.['gatling-gradle'] });
          source.addGradleBuildSrcDependencyCatalogVersion?.({ name: 'gatling-highcharts', version: javaDependencies?.gatling });
          source.addGradleBuildSrcDependency?.({
            groupId: 'gradle.plugin.io.gatling.gradle',
            artifactId: 'gatling-gradle-plugin',
            // eslint-disable-next-line no-template-curly-in-string
            version: '${libs.versions.gatling.plugin.get()}',
            scope: 'implementation',
          });
          source.addGradlePlugin?.({ id: 'jhipster.gatling-conventions' });
        }
      },
      addSonarProperties({ application, source }) {
        const commonSource = source as CommonSource;
        commonSource.ignoreSonarRule?.({
          ruleId: 'S2187',
          ruleKey: 'java:S2187',
          resourceKey: `${application.srcTestJava}gatling/**/*`,
          comment: 'Rule https://rules.sonarsource.com/java/RSPEC-2187 is ignored, gatling tests are not supported by sonar',
        });
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
