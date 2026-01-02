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

import { mutateData } from '../../lib/utils/object.ts';
import BaseApplicationGenerator from '../base-application/index.ts';
import { getGradleLibsVersionsProperties } from '../java-simple-application/generators/gradle/support/dependabot-gradle.ts';

import type {
  Application as SpringCloudApplication,
  Config as SpringCloudConfig,
  Entity as SpringCloudEntity,
  Options as SpringCloudOptions,
  Source as SpringCloudSource,
} from './types.ts';

/**
 * Utility class with types.
 */
export class SpringCloudApplicationGenerator extends BaseApplicationGenerator<
  SpringCloudEntity,
  SpringCloudApplication<SpringCloudEntity>,
  SpringCloudConfig,
  SpringCloudOptions,
  SpringCloudSource
> {}

export default class SpringCloudGenerator extends SpringCloudApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('spring-boot');
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composeCloud() {
        const { applicationType, feignClient, messageBroker } = this.jhipsterConfigWithDefaults;

        if (applicationType === 'gateway') {
          await this.composeWithJHipster('jhipster:spring-cloud:gateway');
        }
        if (messageBroker === 'kafka') {
          await this.composeWithJHipster('jhipster:spring-cloud:kafka');
        }
        if (messageBroker === 'pulsar') {
          await this.composeWithJHipster('jhipster:spring-cloud:pulsar');
        }
        if (feignClient) {
          await this.composeWithJHipster('jhipster:spring-cloud:feign-client');
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      async loadJavaDependencies({ application }) {
        const gradleLibsVersions = this.readTemplate(
          this.fetchFromInstalledJHipster('spring-cloud/resources/gradle/libs.versions.toml'),
        )?.toString();
        const applicationJavaDependencies = this.prepareDependencies(
          {
            ...getGradleLibsVersionsProperties(gradleLibsVersions!),
          },
          'java',
        );

        mutateData(application.javaDependencies, applicationJavaDependencies);
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addJHipsterBomDependencies({ application, source }) {
        source.addJavaDefinitions?.(
          {
            dependencies: [
              {
                groupId: 'org.springframework.cloud',
                artifactId: 'spring-cloud-dependencies',
                type: 'pom',
                scope: 'import',
                version: application.javaDependencies!['spring-cloud-dependencies'],
              },
            ],
          },
          {
            condition: application.applicationTypeMicroservice || application.applicationTypeGateway,
            dependencies: [
              { groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter' },
              {
                groupId: 'org.springframework.cloud',
                artifactId: `spring-cloud-starter-circuitbreaker-${application.reactive ? 'reactor-' : ''}resilience4j`,
              },
            ],
          },
          {
            condition: application.serviceDiscoveryAny,
            dependencies: [{ groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-bootstrap' }],
          },
          {
            condition: application.serviceDiscoveryEureka,
            dependencies: [
              { groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-config' },
              { groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-netflix-eureka-client' },
            ],
          },
          {
            condition: application.serviceDiscoveryConsul,
            dependencies: [
              { groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-consul-config' },
              { groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-consul-discovery' },
            ],
          },
        );
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
