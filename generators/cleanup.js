const constants = require('./generator-constants');

const ANGULAR_DIR = constants.ANGULAR_DIR;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

module.exports = {
    cleanupOldFiles,
    cleanupOldServerFiles
};
/**
 * Removes files that where generated in previous JHipster versions and therefore need to be removed
 */
function cleanupOldFiles(generator, javaDir, testDir) {
    if (generator.isJhipsterVersionLessThan('3.2.0')) {
        // removeFile and removeFolder methods should be called here for files and folders to cleanup
        generator.removeFile(`${ANGULAR_DIR}components/form/uib-pager.config.js`);
        generator.removeFile(`${ANGULAR_DIR}components/form/uib-pagination.config.js`);
    }
}

/**
 * Removes server files that where generated in previous JHipster versions and therefore need to be removed
 */
function cleanupOldServerFiles(generator, javaDir, testDir) {
    if (generator.isJhipsterVersionLessThan('3.5.0')) {
        generator.removeFile(`${javaDir}domain/util/JSR310DateTimeSerializer.java`);
        generator.removeFile(`${javaDir}domain/util/JSR310LocalDateDeserializer.java`);
    }
    if (generator.isJhipsterVersionLessThan('3.6.0')) {
        generator.removeFile(`${javaDir}config/HerokuDatabaseConfiguration.java`);
    }
    if (generator.isJhipsterVersionLessThan('3.8.1')) {
        generator.removeFile(`${javaDir}config/JacksonConfiguration.java`);
    }
    if (generator.isJhipsterVersionLessThan('3.10.0')) {
        generator.removeFile(`${javaDir}config/CloudMongoDbConfiguration.java`);
        generator.removeFile(`${javaDir}security/CustomAccessDeniedHandler.java`);
        generator.removeFile(`${javaDir}web/filter/CsrfCookieGeneratorFilter.java`);
    }
    if (generator.isJhipsterVersionLessThan('3.11.0')) {
        generator.removeFile(`${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/active-link.directive.js`);
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
}
