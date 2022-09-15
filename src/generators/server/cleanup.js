/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const cleanupCassandra = require('./cleanup-cassandra');
const cleanupMongodb = require('./cleanup-mongodb');
const cleanupSql = require('./cleanup-sql');
const cleanupElasticsearch = require('./cleanup-elasticsearch');
const cleanupCacheProvider = require('./cleanup-cache-provider');
const cleanupAngular = require('./cleanup-angular');
const cleanupGradle = require('./cleanup-gradle');
const cleanupOauth2 = require('./cleanup-oauth2');
const cleanupKafka = require('./cleanup-kafka');
const cleanupReactive = require('./cleanup-reactive');
const cleanupCucumber = require('./cleanup-cucumber');
const cleanupMaven = require('./cleanup-maven');
const constants = require('../generator-constants');

/**
 * Removes server files that where generated in previous JHipster versions and therefore
 * need to be removed.
 *
 * @param {any} generator - reference to generator
 * @param {string} javaDir - Java directory
 * @param {string} testDir - Java tests directory
 * @param {string} mainResourceDir - Main resources directory
 * @param {string} testResourceDir - Test resources directory
 */
function cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir) {
  if (generator.databaseTypeSql) {
    cleanupSql.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  }
  if (generator.databaseTypeCassandra) {
    cleanupCassandra.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  }
  if (generator.databaseTypeMongodb) {
    cleanupMongodb.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  }
  cleanupCacheProvider.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  if (generator.clientFrameworkAngular) {
    cleanupAngular.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  }
  if (generator.searchEngineElasticsearch) {
    cleanupElasticsearch.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  }
  if (generator.buildToolGradle) {
    cleanupGradle.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  }
  if (generator.buildToolMaven) {
    cleanupMaven.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  }
  if (generator.authenticationTypeOauth2) {
    cleanupOauth2.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  }
  if (generator.messageBrokerKafka) {
    cleanupKafka.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  }
  if (generator.reactive) {
    cleanupReactive.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  }

  if (generator.cucumberTests) {
    cleanupCucumber.cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir);
  }

  if (generator.isJhipsterVersionLessThan('3.5.0')) {
    generator.removeFile(`${javaDir}domain/util/JSR310DateTimeSerializer.java`);
    generator.removeFile(`${javaDir}domain/util/JSR310LocalDateDeserializer.java`);
  }
  if (generator.isJhipsterVersionLessThan('3.6.0')) {
    generator.removeFile(`${javaDir}config/HerokuDatabaseConfiguration.java`);
  }
  if (generator.isJhipsterVersionLessThan('3.10.0')) {
    generator.removeFile(`${javaDir}security/CustomAccessDeniedHandler.java`);
    generator.removeFile(`${javaDir}web/filter/CsrfCookieGeneratorFilter.java`);
  }
  if (generator.isJhipsterVersionLessThan('4.0.0')) {
    generator.removeFile(`${javaDir}async/ExceptionHandlingAsyncTaskExecutor.java`);
    generator.removeFile(`${javaDir}async/package-info.java`);
    generator.removeFile(`${javaDir}config/jHipsterProperties.java`);
    generator.removeFile(`${javaDir}config/LoadBalancedResourceDetails.java`);
    generator.removeFile(`${javaDir}config/apidoc/package-info.java`);
    generator.removeFile(`${javaDir}config/apidoc/PageableParameterBuilderPlugin.java`);
    generator.removeFile(`${javaDir}config/apidoc/SwaggerConfiguration.java`);
    generator.removeFile(`${javaDir}config/jcache/SpringCacheRegionFactory.java`);
    generator.removeFile(`${javaDir}config/liquibase/AsyncSpringLiquibase.java`);
    generator.removeFile(`${javaDir}config/liquibase/package-info.java`);
    generator.removeFile(`${javaDir}config/locale/package-info.java`);
    generator.removeFile(`${javaDir}domain/util/JSR310DateConverters.java`);
    generator.removeFile(`${javaDir}domain/util/JSR310PersistenceConverters.java`);
    generator.removeFile(`${javaDir}security/AjaxAuthenticationFailureHandler.java`);
    generator.removeFile(`${javaDir}security/AjaxAuthenticationSuccessHandler.java`);
    generator.removeFile(`${javaDir}security/AjaxLogoutSuccessHandler.java`);
    generator.removeFile(`${javaDir}security/CustomPersistentRememberMeServices.java`);
    generator.removeFile(`${javaDir}security/Http401UnauthorizedEntryPoint.java`);
    generator.removeFile(`${javaDir}security/UserDetailsService.java`);
    generator.removeFile(`${javaDir}web/filter/CachingHttpHeadersFilter.java`);
    generator.removeFile(`${javaDir}web/filter/package-info.java`);
  }
  if (generator.isJhipsterVersionLessThan('4.3.0')) {
    generator.removeFile(`${javaDir}gateway/ratelimiting/RateLimitingRepository.java`);
  }
  if (generator.isJhipsterVersionLessThan('4.7.1')) {
    generator.removeFile(`${javaDir}web/rest/errors/ErrorVM.java`);
    generator.removeFile(`${javaDir}web/rest/errors/ParameterizedErrorVM.java`);
  }
  if (generator.isJhipsterVersionLessThan('5.0.0')) {
    generator.removeFile(`${javaDir}config/ThymeleafConfiguration.java`);
    generator.removeFile(`${javaDir}web/rest/ProfileInfoResource.java`);
    generator.removeFile(`${mainResourceDir}mails/activationEmail.html`);
    generator.removeFile(`${mainResourceDir}mails/creationEmail.html`);
    generator.removeFile(`${mainResourceDir}mails/passwordResetEmail.html`);
    generator.removeFile(`${mainResourceDir}mails/socialRegistrationValidationEmail.html`);
    generator.removeFile(`${testResourceDir}mail/testEmail.html`);
    generator.removeFile(`${testDir}web/rest/ProfileInfoResourceIT.java`);
  }
  if (generator.isJhipsterVersionLessThan('5.8.0')) {
    generator.removeFile(`${javaDir}config/MetricsConfiguration.java`);
  }
  if (generator.isJhipsterVersionLessThan('6.0.0')) {
    generator.removeFile(`${javaDir}web/rest/errors/CustomParameterizedException.java`);
    generator.removeFile(`${javaDir}web/rest/errors/InternalServerErrorException.java`);
    generator.removeFile(`${javaDir}web/rest/util/PaginationUtil.java`);
    generator.removeFile(`${javaDir}web/rest/util/HeaderUtil.java`);
    generator.removeFile(`${testDir}web/rest/util/PaginationUtilUnitTest.java`);
    generator.removeFile(`${javaDir}web/rest/vm/LoggerVM.java`);
    generator.removeFile(`${javaDir}web/rest/LogsResource.java`);
    generator.removeFile(`${testDir}web/rest/LogsResourceIT.java`);
  }
  if (generator.isJhipsterVersionLessThan('6.5.2')) {
    generator.removeFile(`${testDir}service/mapper/UserMapperIT.java`);
    generator.removeFile(`${testDir}web/rest/ClientForwardControllerIT.java`);
  }
  if (generator.isJhipsterVersionLessThan('6.6.1')) {
    generator.removeFile(`${javaDir}web/rest/errors/EmailNotFoundException.java`);
    generator.removeFile(`${javaDir}config/DefaultProfileUtil.java`);
    generator.removeFolder(`${javaDir}service/util`);
  }
  if (generator.isJhipsterVersionLessThan('6.8.0')) {
    generator.removeFile(`${javaDir}security/oauth2/JwtAuthorityExtractor.java`);
  }
  if (generator.isJhipsterVersionLessThan('7.0.0-beta.0')) {
    generator.removeFile(`${javaDir}config/apidoc/SwaggerConfiguration.java`);
    generator.removeFile(`${javaDir}config/metrics/package-info.java`);
    generator.removeFile(`${javaDir}config/metrics/JHipsterHealthIndicatorConfiguration.java`);
    generator.removeFile(`${javaDir}config/audit/package-info.java`);
    generator.removeFile(`${javaDir}config/audit/AuditEventConverter.java`);
    generator.removeFile(`${javaDir}domain/PersistentAuditEvent.java`);
    generator.removeFile(`${javaDir}repository/PersistenceAuditEventRepository.java`);
    generator.removeFile(`${javaDir}repository/CustomAuditEventRepository.java`);
    generator.removeFile(`${javaDir}service/AuditEventService.java`);
    generator.removeFile(`${javaDir}web/rest/AuditResource.java`);
    generator.removeFile(`${testDir}service/AuditEventServiceIT.java`);
    generator.removeFile(`${testDir}web/rest/AuditResourceIT.java`);
    generator.removeFile(`${testDir}repository/CustomAuditEventRepositoryIT.java`);
  }
  if (generator.isJhipsterVersionLessThan('7.0.0-beta.1')) {
    generator.removeFile(`${javaDir}config/CloudDatabaseConfiguration.java`);
  }
  if (generator.isJhipsterVersionLessThan('7.4.2')) {
    generator.removeFile(`${javaDir}config/apidocs/GatewaySwaggerResourcesProvider.java`);
    generator.removeFile(`${testDir}config/apidocs/GatewaySwaggerResourcesProviderTest.java`);
  }
  if (generator.isJhipsterVersionLessThan('7.5.1')) {
    if (generator.reactive && generator.databaseTypeSql) {
      generator.removeFile(`${javaDir}service/ColumnConverter.java`);
      generator.removeFile(`${javaDir}service/EntityManager.java`);
      generator.removeFile(`${testDir}ArchTest.java`);
    }
  }
  if (generator.isJhipsterVersionLessThan('7.7.1')) {
    generator.removeFile(`${testDir}TestContainersSpringContextCustomizerFactory.java`);
  }
  if (generator.isJhipsterVersionLessThan('7.8.1')) {
    if (generator.databaseTypeNeo4j) {
      generator.removeFile(`${testDir}AbstractNeo4jIT.java`);
    }
  }
  if (generator.isJhipsterVersionLessThan('7.8.2')) {
    generator.removeFile(`${constants.DOCKER_DIR}realm-config/jhipster-users-0.json`);
    generator.removeFile(`${testDir}NoOpMailConfiguration.java`);
  }
}

module.exports = {
  cleanupOldServerFiles,
};
