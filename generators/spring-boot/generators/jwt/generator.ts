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
import BaseApplicationGenerator from '../../../base-simple-application/index.ts';
import { SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../../../generator-constants.ts';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../../../java/support/files.ts';
import { SpringBootApplicationGenerator } from '../../generator.ts';

export default class JwtGenerator extends SpringBootApplicationGenerator {
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
      async writing({ application }) {
        await this.writeFiles({
          sections: {
            jwtBaseFiles: [
              {
                path: `${SERVER_MAIN_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageSrcDir,
                templates: ['config/SecurityJwtConfiguration.java', 'management/SecurityMetersService.java'],
              },
              {
                path: `${SERVER_TEST_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageTestDir,
                templates: [
                  'management/SecurityMetersServiceTests.java',
                  'security/jwt/AuthenticationIntegrationTest.java',
                  'security/jwt/JwtAuthenticationTestUtils.java',
                  'security/jwt/TokenAuthenticationSecurityMetersIT.java',
                  'security/jwt/TokenAuthenticationIT.java',
                ],
              },
              {
                condition: data => data.generateInMemoryUserCredentials && !data.reactive,
                path: `${SERVER_MAIN_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageSrcDir,
                templates: ['config/SecurityInMemoryConfiguration.java'],
              },
            ],
            entrypointFiles: [
              {
                condition: data => !data.generateAuthenticationApi,
                path: `${SERVER_TEST_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageTestDir,
                templates: ['security/jwt/TestAuthenticationResource.java'],
              },
              {
                condition: generator => generator.generateAuthenticationApi,
                path: `${SERVER_MAIN_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageSrcDir,
                templates: ['web/rest/vm/LoginVM.java', 'web/rest/AuthenticateController.java'],
              },
              {
                condition: data => data.generateAuthenticationApi,
                path: `${SERVER_TEST_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageTestDir,
                templates: ['web/rest/AuthenticateControllerIT.java'],
              },
            ],
          },
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
      dependencies({ source }) {
        source.addSpringBootModule?.('spring-boot-starter-security', 'spring-boot-starter-oauth2-resource-server');
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
