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
import { SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../../../generator-constants.ts';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../../../java/support/files.ts';
import { SpringBootApplicationGenerator } from '../../generator.ts';

export default class Oauth2Generator extends SpringBootApplicationGenerator {
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
            oauth2Files: [
              {
                path: `${SERVER_MAIN_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageSrcDir,
                templates: ['security/oauth2/AudienceValidator.java'],
              },
              {
                path: `${SERVER_TEST_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageTestDir,
                templates: ['security/oauth2/AudienceValidatorTest.java', 'config/TestSecurityConfiguration.java'],
              },
              {
                condition: generator => generator.applicationTypeMonolith,
                path: `${SERVER_MAIN_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageSrcDir,
                templates: ['config/OAuth2Configuration.java'],
              },
              {
                condition: generator => generator.generateAuthenticationApi,
                path: `${SERVER_MAIN_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageSrcDir,
                templates: ['web/rest/AuthInfoResource.java', data => `web/rest/LogoutResource_${data.imperativeOrReactive}.java`],
              },
              {
                condition: generator => generator.generateAuthenticationApi,
                path: SERVER_MAIN_SRC_DIR,
                templates: [
                  {
                    file: generator =>
                      `_package_/web/filter/${
                        generator.reactive ? 'OAuth2ReactiveRefreshTokensWebFilter.java' : 'OAuth2RefreshTokensWebFilter.java'
                      }`,
                    renameTo: generator =>
                      `${generator.packageFolder}web/filter/${
                        generator.reactive ? 'OAuth2ReactiveRefreshTokensWebFilter.java' : 'OAuth2RefreshTokensWebFilter.java'
                      }`,
                  },
                ],
              },
              {
                condition: generator => generator.generateAuthenticationApi,
                path: `${SERVER_TEST_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageTestDir,
                templates: ['test/util/OAuth2TestUtil.java', 'web/rest/LogoutResourceIT.java'],
              },
              {
                condition: generator => !generator.reactive && generator.generateAuthenticationApi,
                path: `${SERVER_MAIN_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageSrcDir,
                templates: ['security/oauth2/CustomClaimConverter.java'],
              },
              {
                condition: generator => !generator.reactive && generator.generateAuthenticationApi,
                path: `${SERVER_TEST_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageTestDir,
                templates: ['security/oauth2/CustomClaimConverterIT.java'],
              },
            ],
          },
          context: application,
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      dependencies({ source }) {
        source.addSpringBootModule?.('spring-boot-starter-oauth2-client', 'spring-boot-starter-oauth2-resource-server');
        source.addJavaDefinition!({
          dependencies: [{ groupId: 'com.github.ben-manes.caffeine', artifactId: 'caffeine' }],
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
