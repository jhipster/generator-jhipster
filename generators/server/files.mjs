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
import { SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_TEST_SRC_DIR, SERVER_TEST_RES_DIR } from '../generator-constants.mjs';
import { addSectionsCondition, mergeSections } from '../base/support/index.mjs';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir, moveToSrcMainResourcesDir } from './support/index.mjs';
import { communications } from './server-base.mjs';

const imperativeConfigFiles = {
  imperativeFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['ApplicationWebXml.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/WebConfigurerTest.java', 'config/WebConfigurerTestController.java'],
    },
  ],
};

const reactiveConfigFiles = {
  reactiveFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/ReactorConfiguration.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/JHipsterBlockHoundIntegration.java'],
    },
    {
      path: SERVER_TEST_RES_DIR,
      templates: ['META-INF/services/reactor.blockhound.integration.BlockHoundIntegration'],
    },
  ],
};

const feignFiles = {
  microserviceFeignFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/FeignConfiguration.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'security/oauth2/AuthorizationHeaderUtil.java',
        'client/AuthorizedFeignClient.java',
        'client/OAuth2InterceptedFeignConfiguration.java',
        'client/TokenRelayRequestInterceptor.java',
      ],
    },
    {
      condition: generator => generator.authenticationTypeJwt,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['client/UserFeignClientInterceptor_jwt.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['security/oauth2/AuthorizationHeaderUtilTest.java'],
    },
  ],
};

const oauth2Files = {
  oauth2Files: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'security/oauth2/AudienceValidator.java',
        'security/oauth2/JwtGrantedAuthorityConverter.java',
        'security/oauth2/OAuthIdpTokenResponseDTO.java',
      ],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['security/oauth2/AudienceValidatorTest.java', 'config/TestSecurityConfiguration.java'],
    },
    {
      condition: generator => generator.applicationTypeMonolith,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/OAuth2Configuration.java'],
    },
    {
      condition: generator => generator.generateAuthenticationApi,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/AuthInfoResource.java', data => `web/rest/LogoutResource_${data.imperativeOrReactive}.java`],
    },
    {
      condition: generator => generator.generateAuthenticationApi,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: generator => `package/web/filter/OAuth2${generator.reactive ? 'Reactive' : ''}RefreshTokensWebFilter.java`,
          renameTo: generator =>
            `${generator.packageFolder}web/filter/OAuth2${generator.reactive ? 'Reactive' : ''}RefreshTokensWebFilter.java`,
        },
      ],
    },
    {
      condition: generator => generator.generateAuthenticationApi,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['test/util/OAuth2TestUtil.java', 'web/rest/LogoutResourceIT.java'],
    },
    {
      condition: generator => !generator.reactive && generator.generateAuthenticationApi,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/oauth2/CustomClaimConverter.java'],
    },
    {
      condition: generator => !generator.reactive && generator.generateAuthenticationApi,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['security/oauth2/CustomClaimConverterIT.java'],
    },
  ],
};

const accountFiles = {
  accountResource: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
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
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/vm/ManagedUserVM.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
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
};

const userManagementFiles = {
  userManagementFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'security/DomainUserDetailsService.java',
        'security/UserNotActivatedException.java',
        'service/MailService.java',
        'service/dto/PasswordChangeDTO.java',
        'service/EmailAlreadyUsedException.java',
        'service/InvalidPasswordException.java',
        'service/UsernameAlreadyUsedException.java',
        'web/rest/UserResource.java',
        'web/rest/vm/KeyAndPasswordVM.java',
        'web/rest/errors/EmailAlreadyUsedException.java',
        'web/rest/errors/InvalidPasswordException.java',
        'web/rest/errors/LoginAlreadyUsedException.java',
      ],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
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
  ],
  entrypointFiles: [
    {
      condition: data => !data.generateAuthenticationApi,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['security/jwt/TestAuthenticationResource.java'],
    },
    {
      condition: generator => generator.generateAuthenticationApi,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/vm/LoginVM.java', 'web/rest/AuthenticateController.java'],
    },
    {
      condition: generator => generator.generateAuthenticationApi,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/AuthenticateControllerIT.java'],
    },
  ],
};

const gatewayFiles = {
  gatewayFiles: [
    {
      condition: generator => generator.authenticationTypeJwt,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/jwt/JWTRelayGatewayFilterFactory.java'],
    },
    {
      condition: generator => generator.serviceDiscoveryAny,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['web/rest/vm/RouteVM.java', 'web/rest/GatewayResource.java', 'web/filter/ModifyServersOpenApiFilter.java'],
    },
    {
      condition: generator => generator.serviceDiscoveryAny,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/filter/ModifyServersOpenApiFilterTest.java'],
    },
    // adding BE files for usecase only when it is gateway or microservice application @cmi-tic-harika
    {
      condition: generator => (generator.clientFrameworkReact && (generator.applicationTypeGateway && generator.withExample)) || (generator.applicationTypeMicroservice),
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'domain/Reminder.java',
        'domain/ReminderCallback.java',
        'repository/ReminderRepository.java',
        'repository/ReminderRepositoryInternalImpl.java',
        'repository/ReminderSqlHelper.java',
        'repository/rowmapper/ReminderRowMapper.java',
        'web/rest/ReminderResource.java'       
    ],
    },
    {
      condition: generator => (generator.clientFrameworkReact && (generator.applicationTypeGateway && generator.withExample)) || (generator.applicationTypeMicroservice),
      path: `${SERVER_MAIN_RES_DIR}`,
      templates: [    
        'config/liquibase/changelog/20230228095256_added_entity_Reminder.xml',
        'config/liquibase/fake-data/reminder.csv'
    ],
    },
    {
      condition: generator => (generator.clientFrameworkReact && (generator.applicationTypeGateway && generator.withExample)) || (generator.applicationTypeMicroservice),
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/ReminderResourceIT.java'],
    },
  ],
};

const swaggerFiles = {
  swagger: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/OpenApiConfiguration.java'],
    },
    {
      condition: generator => generator.buildToolGradle,
      templates: ['gradle/swagger.gradle'],
    },
    {
      path: SERVER_MAIN_RES_DIR,
      templates: ['swagger/api.yml'],
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
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/SpringSecurityAuditorAware.java'],
    },
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['security/SecurityUtils.java', 'security/AuthoritiesConstants.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [data => `security/SecurityUtilsUnitTest_${data.imperativeOrReactive}.java`],
    },
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [data => `config/SecurityConfiguration_${data.imperativeOrReactive}.java`],
    },
    {
      condition: data => data.generateInMemoryUserCredentials && !data.reactive && data.authenticationTypeJwt,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/SecurityInMemoryConfiguration.java'],
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
  ],
  serverMicroservice: [
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
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/EurekaWorkaroundConfiguration.java'],
    },
  ],
  serverJavaApp: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package`,
      renameTo: (data, filename) => moveToJavaPackageSrcDir(data, filename.replace('Application.java', `${data.mainClass}.java`)),
      templates: ['Application.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
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
      path: `${SERVER_MAIN_SRC_DIR}package/`,
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
      condition: generator =>
        generator.generateUserManagement ||
        generator.authenticationTypeOauth2 ||
        generator.databaseTypeSql ||
        generator.databaseTypeMongodb ||
        generator.databaseTypeCouchbase,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/Constants.java'],
    },
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [data => `config/LocaleConfiguration_${data.imperativeOrReactive}.java`],
    },
  ],
  serverJavaDomain: [
    {
      condition: generator =>
        generator.databaseTypeSql || generator.databaseTypeMongodb || generator.databaseTypeNeo4j || generator.databaseTypeCouchbase,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['domain/AbstractAuditingEntity.java'],
    },
  ],
  serverJavaWebError: [
    {
      path: `${SERVER_MAIN_SRC_DIR}package/`,
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
      condition: generator => !generator.skipClient && !generator.reactive,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/StaticResourcesWebConfiguration.java'],
    },
    {
      // TODO : add these tests to reactive
      condition: generator => !generator.skipClient && !generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/StaticResourcesWebConfigurerTest.java'],
    },
    {
      condition: generator => !generator.skipClient,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [data => `web/filter/SpaWebFilter_${data.imperativeOrReactive}.java`],
    },
    {
      condition: generator => !generator.skipClient,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: [data => `web/filter/SpaWebFilterIT_${data.imperativeOrReactive}.java`],
    },
    {
      condition: generator => !generator.skipClient && generator.reactive,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/filter/SpaWebFilterTestController_reactive.java'],
    },
  ],
  serverTestFw: [
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['web/rest/TestUtil.java', 'web/rest/errors/ExceptionTranslatorTestController.java'],
    },
    {
      path: `${SERVER_TEST_SRC_DIR}package/`,
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
      condition: generator => generator.generateBuiltInAuthorityEntity,
      path: `${SERVER_MAIN_SRC_DIR}package/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['domain/Authority.java', 'repository/AuthorityRepository.java'],
    },
    {
      condition: generator =>
        generator.messageBrokerKafka ||
        generator.messageBrokerRabbitMQ || // cmi-tic-varun
        generator.cacheProviderRedis ||
        generator.databaseTypeMongodb ||
        generator.searchEngineElasticsearch ||
        generator.databaseTypeCouchbase ||
        generator.searchEngineCouchbase,
      path: `${SERVER_TEST_SRC_DIR}package/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['config/TestContainersSpringContextCustomizerFactory.java'],
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
  addSectionsCondition(jwtFiles, context => context.authenticationTypeJwt),
  addSectionsCondition(oauth2Files, context => context.authenticationTypeOauth2),
  addSectionsCondition(gatewayFiles, context => context.applicationTypeGateway),
  addSectionsCondition(accountFiles, context => context.generateAuthenticationApi),
  addSectionsCondition(feignFiles, context => !context.reactive && context.applicationTypeMicroservice),
  addSectionsCondition(userManagementFiles, context => context.generateUserManagement),
  addSectionsCondition(imperativeConfigFiles, context => !context.reactive),
  addSectionsCondition(reactiveConfigFiles, context => context.reactive),
  addSectionsCondition(swaggerFiles, context => context.enableSwaggerCodegen)
);

/**
 * @this {import('./index.mjs')}
 */
export function writeFiles() {
  return this.asWritingTaskGroup({
    cleanupOldServerFiles,

    async writeFiles({ application }) {
      return this.writeFiles({
        sections: serverFiles,
        context: application,
      });
    },
    /**
     * This function will write the files which will allow the communication
     * between the server and the client simply saying between gateway/microservice
     * applications.
     * @cmi-tic-craxkumar
     */
    writeCommunicationFile() {
      // Write client files
      for (let i = 0; i < communications.length;i++){
        if(this.jhipsterConfig.baseName === communications[i].client){
          var capitalizeServerName = communications[i].server.charAt(0).toUpperCase() + communications[i].server.slice(1)
          this.fs.copyTpl(
            this.templatePath("src/main/java/package/web/rest/ClientResource.java.ejs"),
            this.destinationPath(`${SERVER_MAIN_SRC_DIR}`.concat(this.jhipsterConfig.packageFolder).concat("/web/rest/comm/ClientResource".concat(capitalizeServerName).concat(".java"))),{
              packageName : this.jhipsterConfig.packageName,
              capitalizeServerName : capitalizeServerName,
              serverName  : communications[i].server.toLowerCase()
            }
          );
        }
      }
      
      // Write client UT files
      for (let i = 0; i < communications.length;i++){
        if(this.jhipsterConfig.baseName === communications[i].client){
          var capitalizeServerName = communications[i].server.charAt(0).toUpperCase() + communications[i].server.slice(1)
          this.fs.copyTpl(
            this.templatePath("src/test/java/package/web/rest/ClientResourceUT.java.ejs"),
            this.destinationPath(`${SERVER_TEST_SRC_DIR}`.concat(this.jhipsterConfig.packageFolder).concat("/web/rest/comm/ClientResource".concat(capitalizeServerName).concat("UT").concat(".java"))),{
              packageName : this.jhipsterConfig.packageName,
              capitalizeServerName : capitalizeServerName,
              serverName  : communications[i].server.toLowerCase()
            }
          );
        }
      }

      // Write server files
      for (let i = 0; i < communications.length;i++){
        if(this.jhipsterConfig.baseName === communications[i].server){
          this.fs.copyTpl(
            this.templatePath("src/main/java/package/web/rest/ServerResource.java.ejs"),
            this.destinationPath(`${SERVER_MAIN_SRC_DIR}`.concat(this.jhipsterConfig.packageFolder).concat("/web/rest/comm/ServerResource.java")),{
              packageName : this.jhipsterConfig.packageName,
              serverName  : communications[i].server.toLowerCase()
            }
          );
        }
      }

      // Write server UT files
      for (let i = 0; i < communications.length;i++){
        if(this.jhipsterConfig.baseName === communications[i].server){
          this.fs.copyTpl(
            this.templatePath("src/test/java/package/web/rest/ServerResourceUT.java.ejs"),
            this.destinationPath(`${SERVER_TEST_SRC_DIR}`.concat(this.jhipsterConfig.packageFolder).concat("/web/rest/comm/ServerResourceUT.java")),{
              packageName : this.jhipsterConfig.packageName,
              serverName  : communications[i].server.toLowerCase()
            }
          );
        }
      }

      this.fs.copyTpl(
        this.templatePath("src/main/java/package/config/webClient/AccessToken.java.ejs"),
        this.destinationPath(`${SERVER_MAIN_SRC_DIR}`.concat(this.jhipsterConfig.packageFolder).concat("/config/webClient/AccessToken.java")),{
          packageName : this.jhipsterConfig.packageName
        }
      );

      this.fs.copyTpl(
        this.templatePath("src/main/java/package/config/webClient/WebClientConfig.java.ejs"),
        this.destinationPath(`${SERVER_MAIN_SRC_DIR}`.concat(this.jhipsterConfig.packageFolder).concat("/config/webClient/WebClientConfig.java")),{
          packageName : this.jhipsterConfig.packageName
        }
      );
    }
  });
}
