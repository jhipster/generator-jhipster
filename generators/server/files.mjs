/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import cleanupOldServerFiles from './cleanup.mjs';
import { TEST_DIR, SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_TEST_SRC_DIR, SERVER_TEST_RES_DIR } from '../generator-constants.mjs';
import { addSectionsCondition, mergeSections, moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from './support/utils.mjs';
import { writeSqlFiles } from './files-sql.mjs';

export const neo4jFiles = {
  serverResource: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/DatabaseConfiguration.java_neo4j'],
    },
    {
      condition: generator => generator.generateBuiltInUserEntity,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/neo4j/Neo4jMigrations.java', 'config/neo4j/package-info.java'],
    },
    {
      condition: generator => generator.generateBuiltInUserEntity,
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/neo4j/migrations/user__admin.json', 'config/neo4j/migrations/user__user.json'],
    },
  ],
  serverTestFw: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/Neo4jTestContainer.java', 'config/EmbeddedNeo4j.java'],
    },
  ],
};

const cucumberFiles = {
  cucumberFiles: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        // Create Cucumber test files
        'cucumber/CucumberIT.java',
        'cucumber/stepdefs/StepDefs.java',
        'cucumber/CucumberTestContextConfiguration.java',
      ],
    },
    {
      condition: generator => generator.generateUserManagement && !generator.databaseTypeMongodb && !generator.databaseTypeCassandra,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['cucumber/stepdefs/UserStepDefs.java'],
    },
    {
      path: SERVER_TEST_RES_DIR,
      templates: [{ file: 'package/features/gitkeep', renameTo: generator => `${generator.packageFolder}/cucumber/gitkeep`, noEjs: true }],
    },
    {
      condition: generator => generator.generateUserManagement && !generator.databaseTypeMongodb && !generator.databaseTypeCassandra,
      path: SERVER_TEST_RES_DIR,
      templates: [
        {
          file: 'package/features/user/user.feature',
          renameTo: generator => `${generator.packageFolder}/cucumber/user.feature`,
        },
      ],
    },
  ],
};

const jwtFiles = {
  jwtBaseFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/SecurityJwtConfiguration.java', 'management/SecurityMetersService.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
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
    {
      condition: data => data.applicationTypeMicroservice,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['security/jwt/TestAuthenticationResource.java'],
    },
  ],
  gatewayRelayFiles: [
    {
      condition: generator => generator.reactive && generator.applicationTypeGateway,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/jwt/JWTRelayGatewayFilterFactory.java'],
    },
  ],
  entrypointFiles: [
    {
      condition: generator => !generator.applicationTypeMicroservice,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/vm/LoginVM.java', 'web/rest/AuthenticateController.java'],
    },
    {
      condition: generator => !generator.applicationTypeMicroservice,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/AuthenticateControllerIT.java'],
    },
  ],
  microservice: [
    {
      condition: generator => !generator.reactive && generator.applicationTypeMicroservice,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/FeignConfiguration.java', 'client/UserFeignClientInterceptor_jwt.java'],
    },
  ],
};

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
export const baseServerFiles = {
  jib: [
    {
      path: 'src/main/docker/jib/',
      templates: ['entrypoint.sh'],
    },
  ],
  packageJson: [
    {
      condition: generator => generator.skipClient,
      templates: ['package.json'],
    },
  ],
  serverBuild: [
    {
      templates: ['checkstyle.xml', '.devcontainer/devcontainer.json', '.devcontainer/Dockerfile'],
    },
    {
      condition: generator => generator.buildToolGradle,
      templates: [
        'build.gradle',
        'settings.gradle',
        'gradle.properties',
        'gradle/sonar.gradle',
        'gradle/docker.gradle',
        'gradle/profile_dev.gradle',
        'gradle/profile_prod.gradle',
        'gradle/war.gradle',
        'gradle/zipkin.gradle',
      ],
    },
    {
      condition: generator => generator.buildToolGradle && !!generator.enableSwaggerCodegen,
      templates: ['gradle/swagger.gradle'],
    },
    {
      condition: generator => generator.buildToolMaven,
      templates: ['pom.xml'],
    },
    {
      condition: generator => !generator.skipClient,
      transform: false,
      templates: ['npmw', 'npmw.cmd'],
    },
  ],
  serverResource: [
    {
      condition: generator => generator.clientFrameworkReact || generator.clientFrameworkVue,
      path: SERVER_MAIN_RES_DIR,
      transform: false,
      templates: [
        {
          file: ctx => `banner-${ctx.clientFramework}.txt`,
          renameTo: () => 'banner.txt',
        },
      ],
    },
    {
      condition: generator => !generator.clientFrameworkReact && !generator.clientFrameworkVue,
      path: SERVER_MAIN_RES_DIR,
      transform: false,
      templates: ['banner.txt'],
    },
    {
      condition: generator => !!generator.enableSwaggerCodegen,
      path: SERVER_MAIN_RES_DIR,
      templates: ['swagger/api.yml'],
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
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/SpringSecurityAuditorAware.java'],
    },
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/SecurityUtils.java', 'security/AuthoritiesConstants.java', 'security/package-info.java'],
    },
    {
      condition: generator => !generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['security/SecurityUtilsUnitTest.java'],
    },
    {
      condition: generator => generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['security/SecurityUtilsUnitTest_reactive.java'],
    },
    {
      condition: generator => !generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/SecurityConfiguration.java'],
    },
    {
      condition: generator => generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/SecurityConfiguration_reactive.java'],
    },
    {
      condition: generator => generator.generateUserManagement && generator.authenticationTypeSession && !generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/PersistentTokenRememberMeServices.java', 'domain/PersistentToken.java'],
    },
    {
      condition: generator =>
        generator.generateUserManagement && generator.authenticationTypeSession && !generator.reactive && !generator.databaseTypeCouchbase,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['repository/PersistentTokenRepository.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'security/oauth2/AudienceValidator.java',
        'security/oauth2/JwtGrantedAuthorityConverter.java',
        'security/oauth2/OAuthIdpTokenResponseDTO.java',
      ],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['security/oauth2/AudienceValidatorTest.java', 'config/TestSecurityConfiguration.java'],
    },
    {
      condition: generator =>
        !generator.reactive &&
        generator.authenticationTypeOauth2 &&
        (generator.applicationTypeMicroservice || generator.applicationTypeGateway),
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['security/oauth2/AuthorizationHeaderUtilTest.java'],
    },
    {
      condition: generator => generator.generateUserManagement,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/DomainUserDetailsService.java', 'security/UserNotActivatedException.java'],
    },
    {
      condition: generator => !!generator.enableSwaggerCodegen,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/OpenApiConfiguration.java'],
    },
    {
      condition: generator => !generator.reactive && generator.authenticationTypeOauth2 && !generator.applicationTypeMicroservice,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/oauth2/CustomClaimConverter.java'],
    },
    {
      condition: generator => !generator.reactive && generator.authenticationTypeOauth2 && !generator.applicationTypeMicroservice,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['security/oauth2/CustomClaimConverterIT.java'],
    },
  ],
  serverJavaGateway: [
    {
      condition: generator => generator.applicationTypeGateway && generator.serviceDiscoveryAny,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/vm/RouteVM.java', 'web/rest/GatewayResource.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2 && (generator.applicationTypeMonolith || generator.applicationTypeGateway),
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/AuthInfoResource.java'],
    },
    {
      condition: generator =>
        generator.authenticationTypeOauth2 &&
        !generator.reactive &&
        (generator.applicationTypeMonolith || generator.applicationTypeGateway),
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/LogoutResource.java'],
    },
    {
      condition: generator =>
        generator.authenticationTypeOauth2 && generator.reactive && (generator.applicationTypeMonolith || generator.applicationTypeGateway),
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/LogoutResource_reactive.java'],
    },
    {
      condition: generator => generator.applicationTypeGateway && generator.serviceDiscoveryAny && generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/filter/ModifyServersOpenApiFilter.java'],
    },
    {
      condition: generator => generator.applicationTypeGateway && generator.serviceDiscoveryAny && generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/filter/ModifyServersOpenApiFilterTest.java'],
    },
  ],
  serverMicroservice: [
    {
      condition: generator =>
        !generator.reactive &&
        generator.authenticationTypeOauth2 &&
        (generator.applicationTypeMicroservice || generator.applicationTypeGateway),
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'security/oauth2/AuthorizationHeaderUtil.java',
        'config/FeignConfiguration.java',
        'client/AuthorizedFeignClient.java',
        'client/OAuth2InterceptedFeignConfiguration.java',
        'client/TokenRelayRequestInterceptor.java',
      ],
    },
    {
      condition: generator => !generator.reactive && generator.applicationTypeGateway && !generator.serviceDiscoveryAny,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/RestTemplateConfiguration.java'],
    },
    {
      condition: generator => generator.applicationTypeMicroservice,
      path: SERVER_MAIN_RES_DIR,
      templates: [{ file: 'static/index_microservices.html', renameTo: () => 'static/index.html' }],
    },
  ],
  serverMicroserviceAndGateway: [
    {
      condition: generator => generator.serviceDiscoveryAny,
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/bootstrap.yml', 'config/bootstrap-prod.yml'],
    },
  ],
  serverJavaApp: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [{ file: 'package/Application.java', renameTo: generator => `${generator.packageFolder}/${generator.mainClass}.java` }],
    },
    {
      condition: generator => generator.serviceDiscoveryAny && generator.serviceDiscoveryEureka,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/EurekaWorkaroundConfiguration.java'],
    },
    {
      condition: generator => !generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['ApplicationWebXml.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['TechnicalStructureTest.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/AsyncSyncConfiguration.java', 'IntegrationTest.java', 'config/SpringBootTestClassOrderer.java'],
    },
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['GeneratedByJHipster.java'],
    },
  ],
  serverJavaConfig: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'aop/logging/LoggingAspect.java',
        'config/package-info.java',
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
      condition: generator => !generator.skipClient && !generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/StaticResourcesWebConfiguration.java'],
    },
    {
      condition: generator =>
        generator.generateUserManagement ||
        generator.databaseTypeSql ||
        generator.databaseTypeMongodb ||
        generator.databaseTypeCouchbase ||
        generator.databaseTypeNeo4j,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/Constants.java'],
    },
    {
      condition: generator => !generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/LocaleConfiguration.java'],
    },
    {
      condition: generator => generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/ReactorConfiguration.java', 'config/LocaleConfiguration_reactive.java'],
    },
    {
      condition: generator =>
        generator.cacheProviderEhCache ||
        generator.cacheProviderCaffeine ||
        generator.cacheProviderHazelcast ||
        generator.cacheProviderInfinispan ||
        generator.cacheProviderMemcached ||
        generator.cacheProviderRedis,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/CacheConfiguration.java'],
    },
    {
      condition: generator => generator.cacheProviderInfinispan,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/CacheFactoryConfiguration.java'],
    },
    {
      condition: generator => generator.cacheProviderRedis,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/EmbeddedRedis.java', 'config/RedisTestContainer.java'],
    },
    {
      condition: generator => generator.communicationSpringWebsocket,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/WebsocketConfiguration.java', 'config/WebsocketSecurityConfiguration.java'],
    },
  ],
  serverJavaDomain: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['domain/package-info.java'],
    },
    {
      condition: generator =>
        generator.databaseTypeSql || generator.databaseTypeMongodb || generator.databaseTypeNeo4j || generator.databaseTypeCouchbase,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['domain/AbstractAuditingEntity.java'],
    },
  ],
  serverJavaPackageInfo: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['repository/package-info.java'],
    },
  ],
  serverJavaServiceError: [
    {
      condition: generator => generator.generateUserManagement,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'service/EmailAlreadyUsedException.java',
        'service/InvalidPasswordException.java',
        'service/UsernameAlreadyUsedException.java',
      ],
    },
  ],
  serverJavaService: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['service/package-info.java'],
    },
  ],
  serverJavaWebError: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'web/rest/errors/package-info.java',
        'web/rest/errors/BadRequestAlertException.java',
        'web/rest/errors/ErrorConstants.java',
        'web/rest/errors/ExceptionTranslator.java',
        'web/rest/errors/FieldErrorVM.java',
      ],
    },
    {
      condition: generator => generator.generateUserManagement,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'web/rest/errors/EmailAlreadyUsedException.java',
        'web/rest/errors/InvalidPasswordException.java',
        'web/rest/errors/LoginAlreadyUsedException.java',
      ],
    },
  ],
  serverJavaWeb: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/vm/package-info.java', 'web/rest/package-info.java'],
    },
    {
      condition: generator => !generator.skipClient && !generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/ClientForwardController.java'],
    },
    {
      condition: generator => !generator.skipClient && generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/filter/SpaWebFilter.java'],
    },
  ],
  serverJavaWebsocket: [
    {
      condition: generator => generator.communicationSpringWebsocket,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'web/websocket/package-info.java',
        'web/websocket/ActivityService.java',
        'web/websocket/dto/package-info.java',
        'web/websocket/dto/ActivityDTO.java',
      ],
    },
  ],
  serverTestReactive: [
    {
      condition: generator => generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/JHipsterBlockHoundIntegration.java'],
    },
    {
      condition: generator => generator.reactive,
      path: SERVER_TEST_RES_DIR,
      templates: ['META-INF/services/reactor.blockhound.integration.BlockHoundIntegration'],
    },
  ],
  springBootOauth2: [
    {
      condition: generator => generator.authenticationTypeOauth2 && generator.applicationTypeMonolith,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/OAuth2Configuration.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2 && !generator.applicationTypeMicroservice,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: generator => `package/web/filter/OAuth2${generator.reactive ? 'Reactive' : ''}RefreshTokensWebFilter.java`,
          renameTo: generator => `${generator.javaDir}web/filter/OAuth2${generator.reactive ? 'Reactive' : ''}RefreshTokensWebFilter.java`,
        },
      ],
    },
    {
      condition: generator => generator.authenticationTypeOauth2 && !generator.applicationTypeMicroservice,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['test/util/OAuth2TestUtil.java'],
    },
  ],
  serverTestFw: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/TestUtil.java', 'web/rest/errors/ExceptionTranslatorTestController.java'],
    },
    {
      condition: generator => !generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/errors/ExceptionTranslatorIT.java'],
    },
    {
      condition: generator => generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/errors/ExceptionTranslatorIT_reactive.java'],
    },
    {
      condition: generator => !generator.skipClient && !generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/ClientForwardControllerTest.java'],
    },
    {
      path: SERVER_TEST_RES_DIR,
      templates: ['config/application.yml', 'logback.xml', 'junit-platform.properties'],
    },
    {
      // TODO : add these tests to reactive
      condition: generator => !generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/WebConfigurerTest.java', 'config/WebConfigurerTestController.java'],
    },
    {
      // TODO : add these tests to reactive
      condition: generator => !generator.skipClient && !generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/StaticResourcesWebConfigurerTest.java'],
    },
    {
      condition: generator => generator.serviceDiscoveryAny,
      path: SERVER_TEST_RES_DIR,
      templates: ['config/bootstrap.yml'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2 && (generator.applicationTypeMonolith || generator.applicationTypeGateway),
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/LogoutResourceIT.java'],
    },
    {
      condition: generator => generator.gatlingTests,
      path: TEST_DIR,
      templates: [
        // Create Gatling test files
        'gatling/conf/gatling.conf',
        'gatling/conf/logback.xml',
      ],
    },
    {
      condition: generator => generator.generateUserManagement,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        // Create auth config test files
        'security/DomainUserDetailsServiceIT.java',
      ],
    },
  ],
  accountResource: [
    {
      condition: data => !data.generateUserManagement && !data.authenticationTypeOauth2 && !data.applicationTypeMicroservice,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/AccountResource_skipUserManagement.java'],
    },
    {
      condition: data => !data.generateUserManagement && !data.authenticationTypeOauth2 && !data.applicationTypeMicroservice,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/AccountResourceIT_skipUserManagement.java'],
    },
    {
      condition: data => data.authenticationTypeOauth2 && !data.applicationTypeMicroservice,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/AccountResource_oauth2.java'],
    },
    {
      condition: data => data.authenticationTypeOauth2 && !data.applicationTypeMicroservice,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/AccountResourceIT_oauth2.java'],
    },
    {
      condition: data => data.generateUserManagement && !data.authenticationTypeOauth2 && !data.applicationTypeMicroservice,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/AccountResource.java'],
    },
    {
      condition: data => data.generateUserManagement && !data.authenticationTypeOauth2 && !data.applicationTypeMicroservice,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/AccountResourceIT.java'],
    },
  ],
  serverJavaUserManagement: [
    {
      condition: generator => generator.generateBuiltInUserEntity,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/User.java',
          renameTo: generator => `${generator.javaDir}domain/${generator.user.persistClass}.java`,
        },
      ],
    },
    {
      condition: generator => generator.generateBuiltInAuthorityEntity,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['domain/Authority.java', 'repository/AuthorityRepository.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/Constants.java', 'service/UserService.java', 'service/dto/package-info.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/dto/AdminUserDTO.java',
          renameTo: generator => `${generator.javaDir}service/dto/${generator.user.adminUserDto}.java`,
        },
        {
          file: 'package/service/dto/UserDTO.java',
          renameTo: generator => `${generator.javaDir}service/dto/${generator.user.dtoClass}.java`,
        },
      ],
    },
    {
      condition: generator => generator.generateBuiltInUserEntity,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'service/mapper/package-info.java',
        'service/mapper/UserMapper.java',
        'repository/UserRepository.java',
        'web/rest/PublicUserResource.java',
        'web/rest/vm/ManagedUserVM.java',
      ],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['service/UserServiceIT.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2 && !generator.databaseTypeNo,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['service/mapper/UserMapperTest.java', 'web/rest/PublicUserResourceIT.java', 'web/rest/UserResourceIT.java'],
    },
    {
      condition: generator => generator.generateUserManagement,
      path: SERVER_MAIN_RES_DIR,
      templates: ['templates/mail/activationEmail.html', 'templates/mail/creationEmail.html', 'templates/mail/passwordResetEmail.html'],
    },
    {
      condition: generator => generator.generateUserManagement,
      path: SERVER_TEST_RES_DIR,
      templates: ['templates/mail/activationEmail.html', 'templates/mail/creationEmail.html', 'templates/mail/passwordResetEmail.html'],
    },
    {
      condition: generator => generator.generateUserManagement,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/dto/AdminUserDTO.java',
          renameTo: generator => `${generator.javaDir}service/dto/${generator.user.adminUserDto}.java`,
        },
        {
          file: 'package/service/dto/UserDTO.java',
          renameTo: generator => `${generator.javaDir}service/dto/${generator.user.dtoClass}.java`,
        },
      ],
    },
    {
      condition: generator => generator.generateUserManagement,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        /* User management java service files */
        'service/UserService.java',
        'service/MailService.java',

        /* User management java web files */
        'service/dto/package-info.java',
        'service/dto/PasswordChangeDTO.java',
        'web/rest/AccountResource.java',
        'web/rest/UserResource.java',
        'web/rest/vm/KeyAndPasswordVM.java',
        'service/mapper/package-info.java',
      ],
    },
    {
      condition: generator =>
        generator.databaseTypeSql ||
        generator.messageBrokerKafka ||
        generator.cacheProviderRedis ||
        generator.databaseTypeMongodb ||
        generator.databaseTypeCassandra ||
        generator.searchEngineElasticsearch ||
        generator.databaseTypeCouchbase ||
        generator.searchEngineCouchbase ||
        generator.databaseTypeNeo4j,
      path: SERVER_TEST_RES_DIR,
      templates: ['testcontainers.properties', 'META-INF/spring.factories'],
    },
    {
      condition: generator =>
        generator.databaseTypeSql ||
        generator.messageBrokerKafka ||
        generator.cacheProviderRedis ||
        generator.databaseTypeMongodb ||
        generator.databaseTypeCassandra ||
        generator.searchEngineElasticsearch ||
        generator.databaseTypeCouchbase ||
        generator.searchEngineCouchbase ||
        generator.databaseTypeNeo4j,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/TestContainersSpringContextCustomizerFactory.java'],
    },
    {
      condition: generator => generator.generateUserManagement,
      path: SERVER_TEST_RES_DIR,
      templates: [
        /* User management java test files */
        'templates/mail/testEmail.html',
      ],
    },
    {
      condition: generator => generator.generateUserManagement && !generator.enableTranslation,
      path: SERVER_TEST_RES_DIR,
      templates: ['i18n/messages_en.properties'],
    },
    {
      condition: generator => generator.generateUserManagement,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [
        'service/MailServiceIT.java',
        'service/UserServiceIT.java',
        'service/mapper/UserMapperTest.java',
        'web/rest/PublicUserResourceIT.java',
        'web/rest/UserResourceIT.java',
      ],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/WithUnauthenticatedMockUser.java'],
    },
  ],
};

export const serverFiles = mergeSections(
  baseServerFiles,
  addSectionsCondition(cucumberFiles, context => context.cucumberTests),
  addSectionsCondition(neo4jFiles, context => context.databaseTypeNeo4j),
  addSectionsCondition(jwtFiles, context => context.authenticationTypeJwt)
);

/**
 * @this {import('./index.mjs')}
 */
export function writeFiles() {
  return this.asWritingTaskGroup({
    setUp({ application }) {
      application.javaDir = `${application.packageFolder}/`;
      application.testDir = `${application.packageFolder}/`;

      this.generateKeyStore();
    },

    cleanupOldServerFiles,

    async writeFiles({ application }) {
      const recreateInitialChangelog = this.configOptions.recreateInitialChangelog;
      return this.writeFiles({
        sections: serverFiles,
        context: {
          ...application,
          recreateInitialChangelog,
        },
      });
    },
    ...writeSqlFiles.call(this),
  });
}
