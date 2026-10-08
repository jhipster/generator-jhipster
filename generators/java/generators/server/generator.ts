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
import type { Source as CommonSource } from '../../../common/types.d.ts';
import { JavaApplicationGenerator } from '../../generator.ts';

const WAIT_TIMEOUT = 3 * 60000;

export default class ServerGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('java');
    }
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      packageJsonScripts({ application }) {
        const packageJsonConfigStorage = this.packageJson.createStorage('config').createProxy();
        packageJsonConfigStorage.backend_port = application.gatewayServerPort || application.serverPort;
        packageJsonConfigStorage.packaging = application.defaultPackaging;
      },
      packageJsonBackendScripts({ application }) {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const javaCommonLog = `-Dlogging.level.ROOT=OFF -Dlogging.level.tech.jhipster=OFF -Dlogging.level.${application.packageName}=OFF`;
        const javaTestLog =
          '-Dlogging.level.org.springframework=OFF -Dlogging.level.org.springframework.web=OFF -Dlogging.level.org.springframework.security=OFF';

        const { buildTool } = application;
        if (buildTool === 'maven') {
          const excludeWebapp = application.skipClient ? '' : ' -Dskip.installnodenpm -Dskip.npm';
          scriptsStorage.set({
            'app:start': 'node .mvn/mvnw.mjs -ntp --batch-mode',
            'backend:info': 'node .mvn/mvnw.mjs --version',
            'backend:doc:test': 'node .mvn/mvnw.mjs -ntp javadoc:javadoc --batch-mode',
            'backend:nohttp:test': 'node .mvn/mvnw.mjs -ntp checkstyle:check --batch-mode',
            'backend:start': `node .mvn/mvnw.mjs${excludeWebapp} -ntp --batch-mode`,
            'java:jar': 'node .mvn/mvnw.mjs -ntp verify -DskipTests --batch-mode',
            'java:war': 'node .mvn/mvnw.mjs -ntp verify -DskipTests --batch-mode -Pwar',
            'java:docker': 'node .mvn/mvnw.mjs -ntp verify -DskipTests -Pprod jib:dockerBuild',
            'java:docker:arm64': 'npm run java:docker -- -Djib-maven-plugin.architecture=arm64',
            'backend:unit:test': `node .mvn/mvnw.mjs -ntp${excludeWebapp} verify --batch-mode ${javaCommonLog} ${javaTestLog}`,
            'backend:build-cache': 'node .mvn/mvnw.mjs dependency:go-offline -ntp',
            'backend:debug':
              'node .mvn/mvnw.mjs -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:8000"',
          });
        } else if (buildTool === 'gradle') {
          const excludeWebapp = application.skipClient ? '' : '-x webapp -x webapp_test';
          scriptsStorage.set({
            'app:start': 'node gradle/gradlew.mjs',
            'backend:info': 'node gradle/gradlew.mjs -v',
            'backend:doc:test': `node gradle/gradlew.mjs javadoc ${excludeWebapp}`,
            'backend:nohttp:test': `node gradle/gradlew.mjs checkstyleNohttp checkstyleMain spotlessCheck ${excludeWebapp}`,
            'backend:start': `node gradle/gradlew.mjs ${excludeWebapp}`,
            'java:jar': 'node gradle/gradlew.mjs bootJar -x test -x integrationTest',
            'java:war': 'node gradle/gradlew.mjs bootWar -Pwar -x test -x integrationTest',
            'java:docker': 'node gradle/gradlew.mjs bootJar -Pprod jibDockerBuild',
            'java:docker:arm64': 'npm run java:docker -- -PjibArchitecture=arm64',
            'backend:unit:test': `node gradle/gradlew.mjs test integrationTest ${excludeWebapp} ${javaCommonLog} ${javaTestLog}`,
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
          'ci:e2e:server:start': `java -jar ${application.javaPackagingDestDir}e2e.$npm_package_config_packaging --spring.profiles.active=e2e,secret-samples,$npm_package_config_default_environment${application.e2eTls ? ',tls' : ''} ${javaCommonLog} ${javaTestLog} --logging.level.org.springframework.web=ERROR`,
        });
      },
      packageJsonE2eScripts({ application }) {
        const scriptsStorage = this.packageJson.createStorage('scripts');

        let applicationWaitTimeout = WAIT_TIMEOUT * (application.applicationTypeGateway ? 2 : 1);
        applicationWaitTimeout = application.authenticationTypeOauth2 ? applicationWaitTimeout * 2 : applicationWaitTimeout;
        // With e2eTls, `ci:e2e:run` sets E2E_SERVER_PROTOCOL to https, the packaged server being started with its tls
        // profile; the server of the development flows keeps http. wait-on does not verify the certificate, which is
        // self-signed.
        // eslint-disable-next-line no-template-curly-in-string
        const protocol = application.e2eTls ? '${E2E_SERVER_PROTOCOL:-http}' : 'http';
        const applicationEndpoint =
          application.applicationTypeMicroservice ?
            `http-get://127.0.0.1:${application.gatewayServerPort}/${application.endpointPrefix}/management/health/readiness`
          : `${protocol}-get://127.0.0.1:$npm_package_config_backend_port/management/health`;
        scriptsStorage.set({
          'ci:server:await': `echo "Waiting for server at port $npm_package_config_backend_port to start" && wait-on -t ${applicationWaitTimeout} ${applicationEndpoint} && echo "Server at port $npm_package_config_backend_port started"`,
        });
      },
      sonar({ application, source }) {
        (source as CommonSource).ignoreSonarRule?.({
          ruleId: 'S7027-dto',
          ruleKey: 'javaarchitecture:S7027',
          resourceKey: `${application.javaPackageSrcDir}service/dto/**/*`,
          comment: 'Rule https://rules.sonarsource.com/java/RSPEC-7027 is ignored for dtos',
        });

        (source as CommonSource).ignoreSonarRule?.({
          ruleId: 'UndocumentedApi',
          ruleKey: 'squid:UndocumentedApi',
          resourceKey: `${application.javaPackageSrcDir}**/*`,
          comment:
            'Rule https://rules.sonarsource.com/java/RSPEC-1176 is ignored, as we want to follow "clean code" guidelines and classes, methods and arguments names should be self-explanatory',
        });
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
