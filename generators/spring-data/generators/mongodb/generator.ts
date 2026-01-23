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
import { SpringBootApplicationGenerator } from '../../../spring-boot/generator.ts';

import writeMongodbEntityFilesTask from './entity-files.ts';
import writeMongodbFilesTask from './files.ts';

export default class MongoDBGenerator extends SpringBootApplicationGenerator {
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
      async cleanupMongodbFilesTask({ application, control }) {
        await control.cleanupFiles({
          '3.10.0': [`${application.javaPackageSrcDir}config/CloudMongoDbConfiguration.java`],
          '7.7.1': [`${application.javaPackageTestDir}MongoDbTestContainerExtension.java`],
          '9.0.0-beta.1': [
            `${application.javaPackageSrcDir}TestContainersSpringContextCustomizerFactory.java`,
            `${application.javaPackageSrcDir}config/EmbeddedMongo.java`,
            `${application.javaPackageSrcDir}config/MongoDbTestContainer.java`,
            `${application.srcTestResources}META-INF/spring.factories`,
          ],
        });
      },
      writeMongodbFilesTask,
    });
  }

  get [SpringBootApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      writeMongodbEntityFilesTask,
    });
  }

  get [SpringBootApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addDependencies({ application, source }) {
        const { reactive, javaDependencies } = application;
        source.addSpringBootModule?.(`spring-boot-starter-data-mongodb${reactive ? '-reactive' : ''}`, 'spring-boot-testcontainers');
        if (application.springBoot4) {
          source.addSpringBootModule?.(`spring-boot-starter-data-mongodb${reactive ? '-reactive' : ''}-test`);
        }
        source.addJavaDependencies?.([
          { groupId: 'io.mongock', artifactId: 'mongock-bom', type: 'pom', version: javaDependencies!['mongock-bom'], scope: 'import' },
          { groupId: 'io.mongock', artifactId: 'mongock-springboot-v3' },
          { groupId: 'io.mongock', artifactId: reactive ? 'mongodb-reactive-driver' : 'mongodb-springdata-v4-driver' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers-junit-jupiter' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers-mongodb' },
        ]);
        if (reactive) {
          // Mongock requires non reactive starter workaround https://github.com/mongock/mongock/issues/613.
          source.addSpringBootModule?.('spring-boot-starter-data-mongodb');
          source.addJavaDependencies?.([
            // Mongock requires non reactive driver workaround https://github.com/mongock/mongock/issues/613.
            // switch to mongodb-reactive-driver
            { groupId: 'io.mongock', artifactId: 'mongodb-springdata-v4-driver' },
          ]);
        }
      },
      integrationTest({ application, source }) {
        source.editJavaFile!(`${application.javaPackageTestDir}IntegrationTest.java`, {
          imports: [`${application.packageName}.config.MongoDbTestContainer`],
          annotations: [
            {
              package: 'org.springframework.boot.test.context',
              annotation: 'SpringBootTest',
              parameters: (_, cb) => cb.addKeyValue('classes', 'MongoDbTestContainer.class'),
            },
          ],
        });
      },
      blockhound({ application, source }) {
        const { reactive } = application;
        if (reactive) {
          source.addAllowBlockingCallsInside!({ classPath: 'com.mongodb.internal.Locks', method: 'checkedWithLock' });
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
