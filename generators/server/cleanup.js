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
    if (generator.databaseType === 'cassandra') {
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

    if (generator.databaseType === 'cassandra') {
      generator.removeFile(`${javaDir}config/metrics/package-info.java`);
      generator.removeFile(`${javaDir}config/metrics/CassandraHealthIndicator.java`);
      generator.removeFile(`${javaDir}config/metrics/JHipsterHealthIndicatorConfiguration.java`);
      generator.removeFile(`${javaDir}config/cassandra/package-info.java`);
      generator.removeFile(`${javaDir}config/cassandra/CassandraConfiguration.java`);
      generator.removeFile(`${testDir}config/CassandraConfigurationIT.java`);
    }
    if (generator.searchEngine === 'elasticsearch') {
      generator.removeFile(`${testDir}config/ElasticsearchTestConfiguration.java`);
    }
  }
  if (generator.isJhipsterVersionLessThan('7.0.0-beta.1')) {
    generator.removeFile(`${javaDir}config/CloudDatabaseConfiguration.java`);
  }
  if (generator.isJhipsterVersionLessThan('7.4.2')) {
    generator.removeFile(`${javaDir}config/apidocs/GatewaySwaggerResourcesProvider.java`);
    generator.removeFile(`${testDir}config/apidocs/GatewaySwaggerResourcesProviderTest.java`);
  }
  if (generator.isJhipsterVersionLessThan('7.6.1')) {
    generator.removeFile(`${testDir}MongoDbTestContainerExtension.java`);
    generator.removeFile(`${testDir}TestContainersSpringContextCustomizerFactory.java`);
    generator.removeFile(`${testDir}AbstractCassandraTest.java`);
  }
}

module.exports = {
  cleanupOldServerFiles,
};
