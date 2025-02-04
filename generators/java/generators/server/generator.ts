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
import BaseApplicationGenerator from '../../../base-application/index.js';

const WAIT_TIMEOUT = 3 * 60000;

export default class ServerGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplication();
    }
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      packageJsonScripts({ application }) {
        const packageJsonConfigStorage = this.packageJson.createStorage('config').createProxy();
        (packageJsonConfigStorage as any).backend_port = application.gatewayServerPort || application.serverPort;
        (packageJsonConfigStorage as any).packaging = application.defaultPackaging;
      },
      packageJsonBackendScripts({ application }) {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const javaCommonLog = `-Dlogging.level.ROOT=OFF -Dlogging.level.tech.jhipster=OFF -Dlogging.level.${application.packageName}=OFF`;
        const javaTestLog =
          '-Dlogging.level.org.springframework=OFF -Dlogging.level.org.springframework.web=OFF -Dlogging.level.org.springframework.security=OFF';

        const buildTool = application.buildTool;
        let e2ePackage = 'target/e2e';
        if (buildTool === 'maven') {
          const excludeWebapp = application.skipClient ? '' : ' -Dskip.installnodenpm -Dskip.npm';
          scriptsStorage.set({
            'app:start': './mvnw -ntp --batch-mode',
            'backend:info': './mvnw --version',
            'backend:doc:test': './mvnw -ntp javadoc:javadoc --batch-mode',
            'backend:nohttp:test': './mvnw -ntp checkstyle:check --batch-mode',
            'backend:start': `./mvnw${excludeWebapp} -ntp --batch-mode`,
            'java:jar': './mvnw -ntp verify -DskipTests --batch-mode',
            'java:war': './mvnw -ntp verify -DskipTests --batch-mode -Pwar',
            'java:docker': './mvnw -ntp verify -DskipTests -Pprod jib:dockerBuild',
            'java:docker:arm64': 'npm run java:docker -- -Djib-maven-plugin.architecture=arm64',
            'backend:unit:test': `./mvnw -ntp${excludeWebapp} verify --batch-mode ${javaCommonLog} ${javaTestLog}`,
            'backend:build-cache': './mvnw dependency:go-offline -ntp',
            'backend:debug': './mvnw -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:8000"',
          });
        } else if (buildTool === 'gradle') {
          const excludeWebapp = application.skipClient ? '' : '-x webapp -x webapp_test';
          e2ePackage = 'e2e';
          scriptsStorage.set({
            'app:start': './gradlew',
            'backend:info': './gradlew -v',
            'backend:doc:test': `./gradlew javadoc ${excludeWebapp}`,
            'backend:nohttp:test': `./gradlew checkstyleNohttp ${excludeWebapp}`,
            'backend:start': `./gradlew ${excludeWebapp}`,
            'java:jar': './gradlew bootJar -x test -x integrationTest',
            'java:war': './gradlew bootWar -Pwar -x test -x integrationTest',
            'java:docker': './gradlew bootJar -Pprod jibDockerBuild',
            'java:docker:arm64': 'npm run java:docker -- -PjibArchitecture=arm64',
            'backend:unit:test': `./gradlew test integrationTest ${excludeWebapp} ${javaCommonLog} ${javaTestLog}`,
            'postci:e2e:package': 'cp build/libs/*.$npm_package_config_packaging e2e.$npm_package_config_packaging',
            'backend:build-cache':
              'npm run backend:info && npm run backend:nohttp:test && npm run ci:e2e:package -- -x webapp -x webapp_test',
          });
        }

        scriptsStorage.set({
          'java:jar:dev': 'npm run java:jar -- -Pdev,webapp',
          'java:jar:prod': 'npm run java:jar -- -Pprod',
          'java:war:dev': 'npm run java:war -- -Pdev,webapp',
          'java:war:prod': 'npm run java:war -- -Pprod',
          'java:docker:dev': 'npm run java:docker -- -Pdev,webapp',
          'java:docker:prod': 'npm run java:docker -- -Pprod',
          'ci:backend:test':
            'npm run backend:info && npm run backend:doc:test && npm run backend:nohttp:test && npm run backend:unit:test -- -P$npm_package_config_default_environment',
          'ci:e2e:package':
            'npm run java:$npm_package_config_packaging:$npm_package_config_default_environment -- -Pe2e -Denforcer.skip=true',
          'preci:e2e:server:start': 'npm run services:db:await --if-present && npm run services:others:await --if-present',
          'ci:e2e:server:start': `java -jar ${e2ePackage}.$npm_package_config_packaging --spring.profiles.active=e2e,$npm_package_config_default_environment ${javaCommonLog} ${javaTestLog} --logging.level.org.springframework.web=ERROR`,
        });
      },
      packageJsonE2eScripts({ application }) {
        const scriptsStorage = this.packageJson.createStorage('scripts');

        let applicationWaitTimeout = WAIT_TIMEOUT * (application.applicationTypeGateway ? 2 : 1);
        applicationWaitTimeout = application.authenticationTypeOauth2 ? applicationWaitTimeout * 2 : applicationWaitTimeout;
        const applicationEndpoint = application.applicationTypeMicroservice
          ? `http-get://127.0.0.1:${application.gatewayServerPort}/${application.endpointPrefix}/management/health/readiness`
          : 'http-get://127.0.0.1:$npm_package_config_backend_port/management/health';
        scriptsStorage.set({
          'ci:server:await': `echo "Waiting for server at port $npm_package_config_backend_port to start" && wait-on -t ${applicationWaitTimeout} ${applicationEndpoint} && echo "Server at port $npm_package_config_backend_port started"`,
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
