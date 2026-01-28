/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { SpringBootApplicationGenerator } from '../../generator.ts';

import writeCouchbaseEntityFilesTask, { cleanupCouchbaseEntityFilesTask } from './entity-files.ts';
import writeCouchbaseFilesTask, { cleanupCouchbaseFilesTask } from './files.ts';

export default class CouchbaseGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('spring-boot');
    }
  }

  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ application, control }) {
        await control.cleanupFiles({
          '9.0.0-beta.1': [
            `${application.javaPackageTestDir}config/TestContainersSpringContextCustomizerFactory.java`,
            `${application.javaPackageTestDir}config/EmbeddedCouchbase.java`,
            `${application.srcTestResources}META-INF/spring.factories`,
          ],
        });
      },
      cleanupCouchbaseFilesTask,
      writeCouchbaseFilesTask,
    });
  }

  get [SpringBootApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      cleanupCouchbaseEntityFilesTask,
      writeCouchbaseEntityFilesTask,
    });
  }

  get [SpringBootApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addDependencies({ application, source }) {
        const { reactive, javaDependencies } = application;
        source.addSpringBootModule?.(`spring-boot-starter-data-couchbase${reactive ? '-reactive' : ''}`, 'spring-boot-testcontainers');
        source.addJavaDependencies?.([
          { groupId: 'commons-codec', artifactId: 'commons-codec' },
          { groupId: 'com.couchbase.client', artifactId: 'java-client' },
          { groupId: 'com.github.differentway', artifactId: 'couchmove', version: javaDependencies!.couchmove },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers-junit-jupiter' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers-couchbase' },
        ]);
      },
      integrationTest({ application, source }) {
        source.editJavaFile!(`${application.javaPackageTestDir}IntegrationTest.java`, {
          annotations: [
            {
              package: 'org.springframework.test.context',
              annotation: 'ActiveProfiles',
              parameters: (_, cb) => cb.addKeyValue('value', 'JHipsterConstants.SPRING_PROFILE_TEST'),
            },
            {
              package: 'org.springframework.boot.testcontainers.context',
              annotation: 'ImportTestcontainers',
              parameters: (_, cb) => cb.addKeyValue('value', 'CouchbaseTestContainer.class'),
            },
          ],
          imports: ['tech.jhipster.config.JHipsterConstants', `${application.packageName}.config.CouchbaseTestContainer`],
        });
      },
      couchmoveSetup({ application }) {
        if (application.buildToolGradle) {
          this.editFile('build.gradle', {
            needle: '',
            contentToAdd: `
bootJar {
    loaderImplementation = org.springframework.boot.loader.tools.LoaderImplementation.CLASSIC
}`,
          });
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
