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
  const rootTestDir = generator.TEST_DIR;
  if (generator.isJhipsterVersionLessThan('3.5.0')) {
    generator.removeFile(`${javaDir}domain/util/JSR310DateTimeSerializer.java`);
    generator.removeFile(`${javaDir}domain/util/JSR310LocalDateDeserializer.java`);
  }
  if (generator.isJhipsterVersionLessThan('3.6.0')) {
    generator.removeFile(`${javaDir}config/HerokuDatabaseConfiguration.java`);
  }
  if (generator.isJhipsterVersionLessThan('3.10.0')) {
    generator.removeFile(`${javaDir}config/CloudMongoDbConfiguration.java`);
    generator.removeFile(`${javaDir}security/CustomAccessDeniedHandler.java`);
    generator.removeFile(`${javaDir}web/filter/CsrfCookieGeneratorFilter.java`);
  }
  if (generator.isJhipsterVersionLessThan('3.12.0')) {
    generator.removeFile(`${javaDir}config/hazelcast/HazelcastCacheRegionFactory.java`);
    generator.removeFile(`${javaDir}config/hazelcast/package-info.java`);
  }
  if (generator.isJhipsterVersionLessThan('4.0.0')) {
    generator.removeFile(`${javaDir}async/ExceptionHandlingAsyncTaskExecutor.java`);
    generator.removeFile(`${javaDir}async/package-info.java`);
    generator.removeFile(`${javaDir}config/jHipsterProperties.java`);
    generator.removeFile(`${javaDir}config/LoadBalancedResourceDetails.java`);
    generator.removeFile(`${javaDir}config/ElasticSearchConfiguration.java`);
    generator.removeFile(`${javaDir}config/apidoc/package-info.java`);
    generator.removeFile(`${javaDir}config/apidoc/PageableParameterBuilderPlugin.java`);
    generator.removeFile(`${javaDir}config/apidoc/SwaggerConfiguration.java`);
    generator.removeFile(`${javaDir}config/jcache/SpringCacheRegionFactory.java`);
    generator.removeFile(`${javaDir}config/jcache/SpringCacheRegionFactory.java`);
    generator.removeFile(`${javaDir}config/liquibase/AsyncSpringLiquibase.java`);
    generator.removeFile(`${javaDir}config/liquibase/package-info.java`);
    generator.removeFile(`${javaDir}config/locale/AngularCookieLocaleResolver.java`);
    generator.removeFile(`${javaDir}config/locale/package-info.java`);
    generator.removeFile(`${javaDir}domain/util/FixedH2Dialect.java`);
    generator.removeFile(`${javaDir}domain/util/FixedPostgreSQL82Dialect`);
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
    generator.removeFile(`${javaDir}config/cassandra/CustomZonedDateTimeCodec.java`);
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
    generator.removeFile('gradle/mapstruct.gradle');
  }
  if (generator.isJhipsterVersionLessThan('5.2.2')) {
    generator.removeFile(`${javaDir}config/ElasticsearchConfiguration.java`);
    generator.removeFile('gradle/liquibase.gradle');
  }
  if (generator.isJhipsterVersionLessThan('5.8.0')) {
    generator.removeFile(`${javaDir}config/MetricsConfiguration.java`);
    if (generator.databaseTypeCassandra) {
      generator.removeFile(`${testResourceDir}cassandra-random-port.yml`);
    }
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
    generator.removeFile(`${javaDir}config/OAuth2Configuration.java`);
    generator.removeFile(`${javaDir}security/OAuth2AuthenticationSuccessHandler.java`);
  }
  if (generator.isJhipsterVersionLessThan('6.5.2')) {
    generator.removeFile(`${testDir}service/mapper/UserMapperIT.java`);
    generator.removeFile(`${javaDir}service/${generator.upperFirstCamelCase(generator.baseName)}KafkaConsumer.java`);
    generator.removeFile(`${javaDir}service/${generator.upperFirstCamelCase(generator.baseName)}KafkaProducer.java`);
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
  if (generator.isJhipsterVersionLessThan('6.8.1')) {
    generator.removeFile(`${javaDir}config/ReactivePageableHandlerMethodArgumentResolver.java`);
    generator.removeFile(`${javaDir}config/ReactiveSortHandlerMethodArgumentResolver.java`);
  }
  if (generator.isJhipsterVersionLessThan('7.0.0-beta.0')) {
    generator.removeFile(`${javaDir}config/apidoc/SwaggerConfiguration.java`);
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

    if (generator.databaseTypeCassandra) {
      generator.removeFile(`${javaDir}config/metrics/package-info.java`);
      generator.removeFile(`${javaDir}config/metrics/CassandraHealthIndicator.java`);
      generator.removeFile(`${javaDir}config/metrics/JHipsterHealthIndicatorConfiguration.java`);
      generator.removeFile(`${javaDir}config/cassandra/package-info.java`);
      generator.removeFile(`${javaDir}config/cassandra/CassandraConfiguration.java`);
      generator.removeFile(`${testDir}config/CassandraConfigurationIT.java`);
    }
    if (generator.searchEngineElasticsearch) {
      generator.removeFile(`${testDir}config/ElasticsearchTestConfiguration.java`);
    }
  }
  if (generator.isJhipsterVersionLessThan('7.0.0-beta.1')) {
    generator.removeFile(`${javaDir}config/CloudDatabaseConfiguration.java`);
  }
  if (generator.isJhipsterVersionLessThan('7.4.2')) {
    generator.removeFile(`${javaDir}config/apidocs/GatewaySwaggerResourcesProvider.java`);
    generator.removeFile(`${testDir}config/apidocs/GatewaySwaggerResourcesProviderTest.java`);

    if (generator.cucumberTests) {
      generator.removeFile(`${testResourceDir}cucumber.properties`);
      generator.removeFile(`${rootTestDir}features/gitkeep`);
      generator.removeFile(`${rootTestDir}features/user/user.feature`);
    }
  }
  if (generator.isJhipsterVersionLessThan('7.5.1')) {
    if (generator.reactive && generator.databaseTypeSql) {
      generator.removeFile(`${javaDir}service/ColumnConverter.java`);
      generator.removeFile(`${javaDir}service/EntityManager.java`);
      generator.removeFile(`${testDir}ArchTest.java`);
    }
  }
  if (generator.isJhipsterVersionLessThan('7.6.1')) {
    if (generator.authenticationTypeOauth2 && !generator.databaseTypeNo) {
      generator.removeFile(`${javaDir}web/rest/UserResource.java`);
    }
  }
  if (generator.isJhipsterVersionLessThan('7.7.1')) {
    if (generator.databaseTypeMongodb) {
      generator.removeFile(`${testDir}MongoDbTestContainerExtension.java`);
    }
    generator.removeFile(`${testDir}TestContainersSpringContextCustomizerFactory.java`);
    if (generator.databaseTypeCassandra) {
      generator.removeFile(`${testDir}AbstractCassandraTest.java`);
    }
    if (generator.messageBrokerKafka) {
      generator.removeFile(`${javaDir}config/KafkaProperties.java`);
    }
    if (generator.searchEngineElasticsearch && !generator.skipUserManagement) {
      generator.removeFile(`${testDir}repository/search/UserSearchRepositoryMockConfiguration.java`);
    }
    if (generator.buildToolMaven) {
      generator.removeFile('.mvn/wrapper/MavenWrapperDownloader.java');
    }
  }
  if (generator.isJhipsterVersionLessThan('7.8.1')) {
    if (generator.databaseTypeNeo4j) {
      generator.removeFile(`${testDir}AbstractNeo4jIT.java`);
    }
  }
}

module.exports = {
  cleanupOldServerFiles,
};
