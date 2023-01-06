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
import cleanupSql from './cleanup-sql.mjs';
import cleanupCacheProvider from './cleanup-cache-provider.mjs';
import cleanupOauth2 from './cleanup-oauth2.mjs';
import cleanupCucumber from './cleanup-cucumber.mjs';
import { DOCKER_DIR } from '../generator-constants.mjs';

import type BaseGenerator from '../base/generator.mjs';
import { type ApplicationTaskParam } from '../base-application/tasks.mjs';
import { type SpringBootApplication } from './types.mjs';

/**
 * Removes server files that where generated in previous JHipster versions and therefore
 * need to be removed.
 */
export default function cleanupOldServerFilesTask(this: BaseGenerator, taskParam: ApplicationTaskParam<SpringBootApplication>) {
  const { application } = taskParam;
  if (application.databaseTypeSql) {
    cleanupSql.call(this, taskParam);
  }
  cleanupCacheProvider.call(this, taskParam as any);
  if (application.authenticationTypeOauth2) {
    cleanupOauth2.call(this, taskParam);
  }
  if ((application as any).cucumberTests) {
    cleanupCucumber.call(this, taskParam);
  }

  if (this.isJhipsterVersionLessThan('3.5.0')) {
    this.removeFile(`${application.javaPackageSrcDir}domain/util/JSR310DateTimeSerializer.java`);
    this.removeFile(`${application.javaPackageSrcDir}domain/util/JSR310LocalDateDeserializer.java`);
  }
  if (this.isJhipsterVersionLessThan('3.6.0')) {
    this.removeFile(`${application.javaPackageSrcDir}config/HerokuDatabaseConfiguration.java`);
  }
  if (this.isJhipsterVersionLessThan('3.10.0')) {
    this.removeFile(`${application.javaPackageSrcDir}security/CustomAccessDeniedHandler.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/filter/CsrfCookieGeneratorFilter.java`);
  }
  if (this.isJhipsterVersionLessThan('4.0.0')) {
    this.removeFile(`${application.javaPackageSrcDir}config/locale/AngularCookieLocaleResolver.java`);
  }
  if (this.isJhipsterVersionLessThan('4.0.0')) {
    this.removeFile(`${application.javaPackageSrcDir}async/ExceptionHandlingAsyncTaskExecutor.java`);
    this.removeFile(`${application.javaPackageSrcDir}async/package-info.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/jHipsterProperties.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/LoadBalancedResourceDetails.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/apidoc/package-info.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/apidoc/PageableParameterBuilderPlugin.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/apidoc/SwaggerConfiguration.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/jcache/SpringCacheRegionFactory.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/liquibase/AsyncSpringLiquibase.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/liquibase/package-info.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/locale/package-info.java`);
    this.removeFile(`${application.javaPackageSrcDir}domain/util/JSR310DateConverters.java`);
    this.removeFile(`${application.javaPackageSrcDir}domain/util/JSR310PersistenceConverters.java`);
    this.removeFile(`${application.javaPackageSrcDir}security/AjaxAuthenticationFailureHandler.java`);
    this.removeFile(`${application.javaPackageSrcDir}security/AjaxAuthenticationSuccessHandler.java`);
    this.removeFile(`${application.javaPackageSrcDir}security/AjaxLogoutSuccessHandler.java`);
    this.removeFile(`${application.javaPackageSrcDir}security/CustomPersistentRememberMeServices.java`);
    this.removeFile(`${application.javaPackageSrcDir}security/Http401UnauthorizedEntryPoint.java`);
    this.removeFile(`${application.javaPackageSrcDir}security/UserDetailsService.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/filter/CachingHttpHeadersFilter.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/filter/package-info.java`);
  }
  if (this.isJhipsterVersionLessThan('4.3.0')) {
    this.removeFile(`${application.javaPackageSrcDir}gateway/ratelimiting/RateLimitingRepository.java`);
  }
  if (this.isJhipsterVersionLessThan('4.7.1')) {
    this.removeFile(`${application.javaPackageSrcDir}web/rest/errors/ErrorVM.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/errors/ParameterizedErrorVM.java`);
  }
  if (this.isJhipsterVersionLessThan('5.0.0')) {
    this.removeFile(`${application.javaPackageSrcDir}config/ThymeleafConfiguration.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/ProfileInfoResource.java`);
    this.removeFile(`${application.srcMainResources}mails/activationEmail.html`);
    this.removeFile(`${application.srcMainResources}mails/creationEmail.html`);
    this.removeFile(`${application.srcMainResources}mails/passwordResetEmail.html`);
    this.removeFile(`${application.srcMainResources}mails/socialRegistrationValidationEmail.html`);
    this.removeFile(`${application.srcTestResources}mail/testEmail.html`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/ProfileInfoResourceIT.java`);
  }
  if (this.isJhipsterVersionLessThan('5.8.0')) {
    this.removeFile(`${application.javaPackageSrcDir}config/MetricsConfiguration.java`);
  }
  if (this.isJhipsterVersionLessThan('6.0.0')) {
    this.removeFile(`${application.javaPackageSrcDir}web/rest/errors/CustomParameterizedException.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/errors/InternalServerErrorException.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/util/PaginationUtil.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/util/HeaderUtil.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/util/PaginationUtilUnitTest.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/vm/LoggerVM.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/LogsResource.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/LogsResourceIT.java`);
  }
  if (this.isJhipsterVersionLessThan('6.5.2')) {
    this.removeFile(`${application.javaPackageSrcDir}service/mapper/UserMapperIT.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/ClientForwardControllerIT.java`);
  }
  if (this.isJhipsterVersionLessThan('6.6.1')) {
    this.removeFile(`${application.javaPackageSrcDir}web/rest/errors/EmailNotFoundException.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/DefaultProfileUtil.java`);
    this.removeFolder(`${application.javaPackageSrcDir}service/util`);
  }
  if (this.isJhipsterVersionLessThan('6.8.0')) {
    this.removeFile(`${application.javaPackageSrcDir}security/oauth2/JwtAuthorityExtractor.java`);
  }
  if (this.isJhipsterVersionLessThan('6.8.1')) {
    if (application.reactive) {
      this.removeFile(`${application.javaPackageSrcDir}config/ReactivePageableHandlerMethodArgumentResolver.java`);
      this.removeFile(`${application.javaPackageSrcDir}config/ReactiveSortHandlerMethodArgumentResolver.java`);
    }
  }
  if (this.isJhipsterVersionLessThan('7.0.0-beta.0')) {
    this.removeFile(`${application.javaPackageSrcDir}config/apidoc/SwaggerConfiguration.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/metrics/package-info.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/metrics/JHipsterHealthIndicatorConfiguration.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/audit/package-info.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/audit/AuditEventConverter.java`);
    this.removeFile(`${application.javaPackageSrcDir}domain/PersistentAuditEvent.java`);
    this.removeFile(`${application.javaPackageSrcDir}repository/PersistenceAuditEventRepository.java`);
    this.removeFile(`${application.javaPackageSrcDir}repository/CustomAuditEventRepository.java`);
    this.removeFile(`${application.javaPackageSrcDir}service/AuditEventService.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/AuditResource.java`);
    this.removeFile(`${application.javaPackageSrcDir}service/AuditEventServiceIT.java`);
    this.removeFile(`${application.javaPackageSrcDir}web/rest/AuditResourceIT.java`);
    this.removeFile(`${application.javaPackageSrcDir}repository/CustomAuditEventRepositoryIT.java`);
  }
  if (this.isJhipsterVersionLessThan('7.0.0-beta.1')) {
    this.removeFile(`${application.javaPackageSrcDir}config/CloudDatabaseConfiguration.java`);
  }
  if (this.isJhipsterVersionLessThan('7.4.2')) {
    this.removeFile(`${application.javaPackageSrcDir}config/apidocs/GatewaySwaggerResourcesProvider.java`);
    this.removeFile(`${application.javaPackageSrcDir}config/apidocs/GatewaySwaggerResourcesProviderTest.java`);
  }
  if (this.isJhipsterVersionLessThan('7.5.1')) {
    if (application.reactive && application.databaseTypeSql) {
      this.removeFile(`${application.javaPackageSrcDir}service/ColumnConverter.java`);
      this.removeFile(`${application.javaPackageSrcDir}service/EntityManager.java`);
      this.removeFile(`${application.javaPackageSrcDir}ArchTest.java`);
    }
  }
  if (this.isJhipsterVersionLessThan('7.7.1')) {
    this.removeFile(`${application.javaPackageSrcDir}TestContainersSpringContextCustomizerFactory.java`);
  }
  if (this.isJhipsterVersionLessThan('7.8.1')) {
    if (application.databaseTypeNeo4j) {
      this.removeFile(`${application.javaPackageSrcDir}AbstractNeo4jIT.java`);
    }
  }
  if (this.isJhipsterVersionLessThan('7.8.2')) {
    this.removeFile(`${DOCKER_DIR}realm-config/jhipster-users-0.json`);
    this.removeFile(`${application.javaPackageSrcDir}NoOpMailConfiguration.java`);
  }
  if (this.isJhipsterVersionLessThan('7.10.0')) {
    if (application.authenticationTypeJwt) {
      this.removeFile(`${application.javaPackageSrcDir}web/rest/UserJWTController.java`);
      this.removeFile(`${application.javaPackageSrcDir}security/jwt/JWTConfigurer.java`);
      this.removeFile(`${application.javaPackageSrcDir}security/jwt/JWTFilter.java`);
      this.removeFile(`${application.javaPackageSrcDir}security/jwt/TokenProvider.java`);
      this.removeFile(`${application.javaPackageTestDir}web/rest/UserJWTControllerIT.java`);
      this.removeFile(`${application.javaPackageTestDir}security/jwt/JWTFilterTest.java`);
      this.removeFile(`${application.javaPackageTestDir}security/jwt/TokenProviderSecurityMetersTests.java`);
      this.removeFile(`${application.javaPackageTestDir}security/jwt/TokenProviderTest.java`);
    }
  }
}
