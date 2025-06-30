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
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { javaMainPackageTemplatesBlock } from '../../../java/support/files.ts';
import type {
  Application as SpringCloudApplication,
  Config as SpringCloudConfig,
  Entity as SpringCloudEntity,
  Options as SpringCloudOptions,
  Source as SpringCloudSource,
} from '../../types.ts';

const WAIT_TIMEOUT = 3 * 60000;

export default class GatewayGenerator extends BaseApplicationGenerator<
  SpringCloudEntity,
  SpringCloudApplication<SpringCloudEntity>,
  SpringCloudConfig,
  SpringCloudOptions,
  SpringCloudSource
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('java');
      await this.dependsOnJHipster('jhipster:java:build-tool');
    }
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      reactiveByDefault() {
        this.jhipsterConfig.reactive = this.jhipsterConfig.reactive ?? true;
        if (this.jhipsterConfig.reactive === false) {
          const message = 'Spring Cloud Gateway MVC support is experimental and not officially supported.';
          if (!this.experimental) {
            throw new Error(`${message} To use it, run the generator with the --experimental flag.`);
          }
          this.log.warn(message);
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareGateway({ application }) {
        application.gatewayServicesApiAvailable = application.serviceDiscoveryAny || !application.reactive;
        application.gatewayRoutes = (application.routes ?? []).map(routeDef => {
          const [route, host = route, serverPort = '8080'] = routeDef.split(':');
          return { route, serverPort, host };
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ control, application }) {
        await control.cleanupFiles({
          '8.6.1': [
            [
              application.reactive && application.serviceDiscoveryAny,
              `${application.javaPackageSrcDir}/web/filter/ModifyServersOpenApiFilter.java`,
              `${application.javaPackageTestDir}/web/filter/ModifyServersOpenApiFilterTest.java`,
            ],
          ],
        });
      },
      async writing({ application }) {
        await this.writeFiles({
          blocks: [
            javaMainPackageTemplatesBlock({
              condition: ctx => ctx.reactive && ctx.authenticationTypeJwt,
              templates: ['security/jwt/JWTRelayGatewayFilterFactory.java'],
            }),
            javaMainPackageTemplatesBlock({
              condition: ctx => ctx.serviceDiscoveryAny || !ctx.reactive,
              templates: ['web/rest/vm/RouteVM.java'],
            }),
            javaMainPackageTemplatesBlock({
              condition: ctx => !ctx.reactive,
              templates: ['web/rest/GatewayResource_imperative.java'],
            }),
            javaMainPackageTemplatesBlock({
              condition: ctx => ctx.reactive && ctx.serviceDiscoveryAny,
              templates: ['web/rest/GatewayResource_reactive.java'],
            }),
          ],
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addDependencies({ application, source }) {
        const { reactive } = application;
        source.addJavaDependencies!([
          { groupId: 'org.springframework.cloud', artifactId: `spring-cloud-starter-gateway-${reactive ? 'server-webflux' : 'mvc'}` },
        ]);
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      packageJsonE2eScripts({ application, entities }) {
        if (application.applicationTypeGateway) {
          const { serverPort, lowercaseBaseName } = application;
          const microservices = [...new Set(entities.map(entity => entity.microserviceName))].filter(Boolean).map(ms => ms!.toLowerCase());
          const scriptsStorage = this.packageJson.createStorage('scripts');
          const waitServices = microservices
            .concat(lowercaseBaseName)
            .map(ms => `npm run ci:server:await:${ms}`)
            .join(' && ');

          scriptsStorage.set({
            [`ci:server:await:${lowercaseBaseName}`]: `wait-on -t ${WAIT_TIMEOUT} http-get://127.0.0.1:$npm_package_config_backend_port/management/health`,
            ...Object.fromEntries(
              microservices.map(ms => [
                `ci:server:await:${ms}`,
                `wait-on -t ${WAIT_TIMEOUT} http-get://127.0.0.1:${serverPort}/services/${ms}/management/health/readiness`,
              ]),
            ),
            'ci:server:await': `echo "Waiting for services to start" && ${waitServices} && echo "Services started"`,
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }
}
