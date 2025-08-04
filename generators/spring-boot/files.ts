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
import { asWriteFilesSection } from '../base-application/support/task-type-inference.ts';
import { addSectionsCondition, mergeSections } from '../base-core/support/index.ts';
import { SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR, SERVER_TEST_RES_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.js';
import {
  javaMainPackageTemplatesBlock,
  moveToJavaPackageSrcDir,
  moveToJavaPackageTestDir,
  moveToSrcMainResourcesDir,
} from '../java/support/index.ts';

import type { Application as SpringBootApplication } from './types.ts';

const imperativeConfigFiles = asWriteFilesSection<SpringBootApplication>({
  imperativeFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['ApplicationWebXml.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/CRLFLogConverterTest.java', 'config/WebConfigurerTest.java', 'config/WebConfigurerTestController.java'],
    },
  ],
});

const reactiveConfigFiles = asWriteFilesSection<SpringBootApplication>({
  reactiveFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/ReactorConfiguration.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/JHipsterBlockHoundIntegration.java'],
    },
    {
      path: SERVER_TEST_RES_DIR,
      templates: ['META-INF/services/reactor.blockhound.integration.BlockHoundIntegration'],
    },
  ],
});

const oauth2Files = asWriteFilesSection<SpringBootApplication>({
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
});

const accountFiles = asWriteFilesSection<SpringBootApplication>({
  accountResource: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        data => {
          if (data.authenticationTypeOauth2 && data.generateBuiltInUserEntity) return 'web/rest/AccountResource_oauth2.java';
          if (data.generateUserManagement) return 'web/rest/AccountResource.java';
          return 'web/rest/AccountResource_skipUserManagement.java';
        },
      ],
    },
    {
      condition: data => data.generateUserManagement,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/vm/ManagedUserVM.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        data => {
          if (data.authenticationTypeOauth2) return 'web/rest/AccountResourceIT_oauth2.java';
          if (data.generateUserManagement) return 'web/rest/AccountResourceIT.java';
          return 'web/rest/AccountResourceIT_skipUserManagement.java';
        },
      ],
    },
  ],
});

const userManagementFiles = asWriteFilesSection<SpringBootApplication>({
  userManagementFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'security/DomainUserDetailsService.java',
        'security/UserNotActivatedException.java',
        'service/MailService.java',
        'service/dto/PasswordChangeDTO.java',
        'service/EmailAlreadyUsedException.java',
        'service/InvalidPasswordException.java',
        'service/UsernameAlreadyUsedException.java',
        'web/rest/vm/KeyAndPasswordVM.java',
        'web/rest/errors/EmailAlreadyUsedException.java',
        'web/rest/errors/InvalidPasswordException.java',
        'web/rest/errors/LoginAlreadyUsedException.java',
      ],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['service/MailServiceIT.java', 'security/DomainUserDetailsServiceIT.java'],
    },
    {
      path: SERVER_MAIN_RES_DIR,
      templates: ['templates/mail/activationEmail.html', 'templates/mail/creationEmail.html', 'templates/mail/passwordResetEmail.html'],
    },
    {
      path: SERVER_TEST_RES_DIR,
      templates: [
        'templates/mail/activationEmail.html',
        'templates/mail/creationEmail.html',
        'templates/mail/passwordResetEmail.html',
        'templates/mail/testEmail.html',
      ],
    },
    {
      condition: generator => !generator.enableTranslation,
      path: SERVER_TEST_RES_DIR,
      templates: ['i18n/messages_en.properties'],
    },
  ],
});

const jwtFiles = asWriteFilesSection<SpringBootApplication>({
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
        'security/jwt/AuthenticationIntegrationTest.java',
        'security/jwt/TokenAuthenticationSecurityMetersIT.java',
        'security/jwt/TokenAuthenticationIT.java',
      ],
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
      condition: generator => generator.generateAuthenticationApi,
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/AuthenticateControllerIT.java'],
    },
  ],
});

const swaggerFiles = asWriteFilesSection<SpringBootApplication>({
  swagger: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/OpenApiConfiguration.java'],
    },
  ],
});

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
export const baseServerFiles = asWriteFilesSection<SpringBootApplication>({
  readme: [
    {
      templates: ['README.md.jhi.spring-boot'],
    },
  ],
  packageJson: [
    {
      condition: generator => generator.clientFrameworkNo,
      templates: ['package.json'],
    },
  ],
  serverBuild: [
    {
      templates: ['.devcontainer/devcontainer.json', '.devcontainer/Dockerfile'],
    },
    {
      condition: generator => generator.buildToolGradle,
      templates: [
        'build.gradle',
        'settings.gradle',
        'gradle.properties',
        'gradle/profile_dev.gradle',
        'gradle/profile_prod.gradle',
        'gradle/war.gradle',
        'gradle/zipkin.gradle',
      ],
    },
    {
      condition: generator => generator.buildToolMaven,
      templates: ['pom.xml'],
    },
  ],
  serverResource: [
    {
      path: SERVER_MAIN_RES_DIR,
      renameTo: moveToSrcMainResourcesDir,
      transform: false,
      templates: [data => (data.clientFrameworkReact || data.clientFrameworkVue ? `banner_${data.clientFramework}.txt` : 'banner.txt')],
    },
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        // Thymeleaf templates
        'templates/error.html',
        'logback-spring.xml',
        'config/application.yml',
        'config/application-dev.yml',
        'config/application-tls.yml',
        'config/application-prod.yml',
        'i18n/messages.properties',
      ],
    },
  ],
  serverJavaAuthConfig: [
    {
      condition: generator =>
        !generator.reactive && (generator.databaseTypeSql || generator.databaseTypeMongodb || generator.databaseTypeCouchbase),
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/SpringSecurityAuditorAware.java'],
    },
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/SecurityUtils.java', 'security/AuthoritiesConstants.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [data => `security/SecurityUtilsUnitTest_${data.imperativeOrReactive}.java`],
    },
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [data => `config/SecurityConfiguration_${data.imperativeOrReactive}.java`],
    },
    {
      condition: data => data.generateInMemoryUserCredentials && !data.reactive && data.authenticationTypeJwt,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/SecurityInMemoryConfiguration.java'],
    },
    {
      condition: generator => generator.generateUserManagement && generator.authenticationTypeSession && !generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/PersistentTokenRememberMeServices.java', 'domain/PersistentToken.java'],
    },
    {
      condition: generator =>
        generator.generateUserManagement && generator.authenticationTypeSession && !generator.reactive && !generator.databaseTypeCouchbase,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['repository/PersistentTokenRepository.java'],
    },
  ],
  serverMicroservice: [
    javaMainPackageTemplatesBlock({
      condition: generator => generator.applicationTypeMicroservice,
      templates: ['config/SpringDocConfiguration.java'],
    }),
    {
      condition: generator => generator.applicationTypeMicroservice,
      path: SERVER_MAIN_RES_DIR,
      templates: [{ file: 'static/index_microservices.html', renameTo: () => 'static/index.html' }],
    },
  ],
  serviceDiscovery: [
    {
      condition: generator => generator.serviceDiscoveryAny,
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/bootstrap.yml', 'config/bootstrap-prod.yml'],
    },
    {
      condition: generator => generator.serviceDiscoveryAny,
      path: SERVER_TEST_RES_DIR,
      templates: ['config/bootstrap.yml'],
    },
    {
      condition: generator => generator.serviceDiscoveryAny && generator.serviceDiscoveryEureka,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/EurekaWorkaroundConfiguration.java'],
    },
  ],
  serverJavaApp: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: (data, filename) => moveToJavaPackageSrcDir(data, filename.replace('Application.java', `${data.mainClass}.java`)),
      templates: ['Application.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        'TechnicalStructureTest.java',
        'config/AsyncSyncConfiguration.java',
        'IntegrationTest.java',
        'config/SpringBootTestClassOrderer.java',
      ],
    },
  ],
  serverJavaConfig: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'aop/logging/LoggingAspect.java',
        'config/AsyncConfiguration.java',
        'config/CRLFLogConverter.java',
        'config/DateTimeFormatConfiguration.java',
        'config/LoggingConfiguration.java',
        'config/ApplicationProperties.java',
        'config/JacksonConfiguration.java',
        'config/LoggingAspectConfiguration.java',
        'config/WebConfigurer.java',
      ],
    },
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/Constants.java'],
    },
  ],
  serverJavaDomain: [
    {
      condition: ctx => ctx.generateSpringAuditor,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['domain/AbstractAuditingEntity.java'],
    },
  ],
  serverJavaWebError: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'web/rest/errors/BadRequestAlertException.java',
        'web/rest/errors/ErrorConstants.java',
        'web/rest/errors/ExceptionTranslator.java',
        'web/rest/errors/FieldErrorVM.java',
      ],
    },
  ],
  serverJavaWeb: [
    {
      condition: generator => generator.clientFrameworkAny && !generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/StaticResourcesWebConfiguration.java'],
    },
    {
      // TODO : add these tests to reactive
      condition: generator => generator.clientFrameworkAny && !generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/StaticResourcesWebConfigurerTest.java'],
    },
    {
      condition: generator => generator.clientFrameworkAny,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [data => `web/filter/SpaWebFilter_${data.imperativeOrReactive}.java`],
    },
    {
      condition: generator => generator.clientFrameworkAny,
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [data => `web/filter/SpaWebFilterIT_${data.imperativeOrReactive}.java`],
    },
    {
      condition: generator => generator.clientFrameworkAny && generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/filter/SpaWebFilterTestController_reactive.java'],
    },
  ],
  serverTestFw: [
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/TestUtil.java', 'web/rest/errors/ExceptionTranslatorTestController.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [data => `web/rest/errors/ExceptionTranslatorIT_${data.imperativeOrReactive}.java`],
    },
    {
      path: SERVER_TEST_RES_DIR,
      templates: ['config/application.yml', 'logback.xml', 'junit-platform.properties'],
    },
  ],
  serverJavaUserManagement: [
    {
      condition: generator =>
        generator.databaseTypeMongodb ||
        generator.searchEngineElasticsearch ||
        generator.databaseTypeCouchbase ||
        generator.searchEngineCouchbase,
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/TestContainersSpringContextCustomizerFactory.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/WithUnauthenticatedMockUser.java'],
    },
  ],
});

export const serverFiles = mergeSections(
  baseServerFiles,
  addSectionsCondition(jwtFiles, context => context.authenticationTypeJwt),
  addSectionsCondition(oauth2Files, context => context.authenticationTypeOauth2),
  addSectionsCondition(accountFiles, context => context.generateAuthenticationApi),
  addSectionsCondition(userManagementFiles, context => context.generateUserManagement),
  addSectionsCondition(imperativeConfigFiles, context => !context.reactive),
  addSectionsCondition(reactiveConfigFiles, context => context.reactive),
  addSectionsCondition(swaggerFiles, context => context.enableSwaggerCodegen),
);
