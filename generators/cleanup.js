/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const constants = require('./generator-constants');

const ANGULAR_DIR = constants.ANGULAR_DIR;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;

const ANGULAR_TEMPLATE_DIR = `angular/${ANGULAR_DIR}`;

module.exports = {
    cleanupOldClientFiles,
    cleanupOldServerFiles,
    warnRenamedAndChangedClientFiles
};

/**
 * Prints warnings in client sub-generator if new version renames file and old content differs from new content.
 *
 * WARNING this only warns in client sub-generator. Each other sub-generator should warn it's own renames.
 *
 * @param {any} generator - reference to generator
 */
function warnRenamedAndChangedClientFiles(generator) {
    if (generator.isJhipsterVersionLessThan('6.3.0') && generator.clientFramework === 'angularX') {
        const newDatePickerAdapter = 'core/date/datepicker-adapter.ts';
        const newProdConfig = 'core/config/prod.config.ts';
        const newUibPaginationConfig = 'core/config/prod.config.ts';
        const newAuthInterceptor = 'core/interceptor/auth.interceptor.ts';
        const newAuthExpiredInterceptor = 'core/interceptor/auth-expired.interceptor.ts';
        const newErrorHandlerInterceptor = 'core/interceptor/error-handler.interceptor.ts';
        const newNotificationInterceptor = 'core/interceptor/notification.interceptor.ts';
        generator.warnIfFilesNotEqualOnRename(
            `${ANGULAR_DIR}shared/util/datepicker-adapter.ts`,
            `${ANGULAR_TEMPLATE_DIR}${newDatePickerAdapter}.ejs`,
            `${ANGULAR_DIR}${newDatePickerAdapter}`
        );
        generator.warnIfFilesNotEqualOnRename(
            `${ANGULAR_DIR}blocks/config/prod.config.ts`,
            `${ANGULAR_TEMPLATE_DIR}${newProdConfig}.ejs`,
            `${ANGULAR_DIR}${newProdConfig}`
        );
        generator.warnIfFilesNotEqualOnRename(
            `${ANGULAR_DIR}blocks/config/uib-pagination.config.ts`,
            `${ANGULAR_TEMPLATE_DIR}${newUibPaginationConfig}.ejs`,
            `${ANGULAR_DIR}${newUibPaginationConfig}`
        );
        generator.warnIfFilesNotEqualOnRename(
            `${ANGULAR_DIR}blocks/interceptor/auth.interceptor.ts`,
            `${ANGULAR_TEMPLATE_DIR}${newAuthInterceptor}.ejs`,
            `${ANGULAR_DIR}${newAuthInterceptor}`
        );
        generator.warnIfFilesNotEqualOnRename(
            `${ANGULAR_DIR}blocks/interceptor/auth-expired.interceptor.ts`,
            `${ANGULAR_TEMPLATE_DIR}${newAuthExpiredInterceptor}.ejs`,
            `${ANGULAR_DIR}${newAuthExpiredInterceptor}`
        );
        generator.warnIfFilesNotEqualOnRename(
            `${ANGULAR_DIR}blocks/interceptor/errorhandler.interceptor.ts`,
            `${ANGULAR_TEMPLATE_DIR}${newErrorHandlerInterceptor}.ejs`,
            `${ANGULAR_DIR}${newErrorHandlerInterceptor}`
        );
        generator.warnIfFilesNotEqualOnRename(
            `${ANGULAR_DIR}blocks/interceptor/notification.interceptor.ts`,
            `${ANGULAR_TEMPLATE_DIR}${newNotificationInterceptor}.ejs`,
            `${ANGULAR_DIR}${newNotificationInterceptor}`
        );
    }
}

/**
 * Removes client files that where generated in previous JHipster versions and therefore
 * need to be removed.
 *
 * WARNING this only removes files created by the client sub-generator. Each other sub-generator
 * should clean-up its own files: see the `cleanup` method in entity/index.js for cleaning
 * up entities.
 *
 * @param {any} generator - reference to generator
 */
function cleanupOldClientFiles(generator) {
    if (generator.isJhipsterVersionLessThan('3.2.0')) {
        // removeFile and removeFolder methods should be called here for files and folders to cleanup
        generator.removeFile(`${ANGULAR_DIR}components/form/uib-pager.config.js`);
        generator.removeFile(`${ANGULAR_DIR}components/form/uib-pagination.config.js`);
    }
    if (generator.isJhipsterVersionLessThan('5.0.0')) {
        generator.removeFile(`${ANGULAR_DIR}/app.route.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/auth/account.service.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/auth/auth-jwt.service.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/auth/auth-session.service.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/auth/csrf.service.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/auth/state-storage.service.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/auth/user-route-access-service.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/language/language.constants.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/language/language.helper.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/login/login-modal.service.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/login/login.service.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/model/base-entity.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/model/request-util.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/user/account.model.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/user/user.model.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/user/user.service.ts`);
        generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-management-dialog.component.ts`);
        generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-modal.service.ts`);
        generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-modal.service.ts`);

        generator.removeFile(`${CLIENT_TEST_SRC_DIR}spec/app/shared/user/user.service.spec.ts`);
        generator.removeFile(`${CLIENT_TEST_SRC_DIR}spec/app/admin/user-management/user-management-dialog.component.spec.ts`);
        generator.removeFile(`${CLIENT_TEST_SRC_DIR}spec/entry.ts`);
        generator.removeFile(`${CLIENT_TEST_SRC_DIR}karma.conf.js`);
    }
    if (generator.isJhipsterVersionLessThan('5.8.0')) {
        generator.removeFile(`${ANGULAR_DIR}admin/metrics/metrics-modal.component.html`);
        generator.removeFile(`${ANGULAR_DIR}admin/metrics/metrics-modal.component.ts`);
        generator.removeFile(`${CLIENT_TEST_SRC_DIR}spec/app/admin/metrics/metrics-modal.component.spec.ts`);
    }
    if (generator.isJhipsterVersionLessThan('6.3.0') && generator.configOptions && generator.configOptions.clientFramework === 'angularX') {
        generator.removeFile(`${ANGULAR_DIR}account/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}admin/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}core/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}home/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}layouts/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/shared-common.module.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/util/datepicker-adapter.ts`);
        generator.removeFile(`${ANGULAR_DIR}blocks/config/prod.config.ts`);
        generator.removeFile(`${ANGULAR_DIR}blocks/config/uib-pagination.config.ts`);
        generator.removeFile(`${ANGULAR_DIR}blocks/interceptor/auth.interceptor.ts`);
        generator.removeFile(`${ANGULAR_DIR}blocks/interceptor/auth-expired.interceptor.ts`);
        generator.removeFile(`${ANGULAR_DIR}blocks/interceptor/errorhandler.interceptor.ts`);
        generator.removeFile(`${ANGULAR_DIR}blocks/interceptor/notification.interceptor.ts`);
    }

    if (generator.isJhipsterVersionLessThan('6.3.0') && generator.configOptions && generator.configOptions.clientFramework === 'react') {
        generator.removeFile('tslint.json');
    }
}

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
    if (generator.isJhipsterVersionLessThan('4.3.0')) {
        generator.removeFile(`${javaDir}gateway/ratelimiting/RateLimitingRepository.java`);
        generator.removeFile(`${javaDir}config/cassandra/CustomZonedDateTimeCodec.java`);
    }
    if (generator.isJhipsterVersionLessThan('4.7.1')) {
        generator.removeFile(`${javaDir}web/rest/errors/ErrorVM.java`);
        generator.removeFile(`${javaDir}web/rest/errors/ParameterizedErrorVM.java`);
    }
    if (generator.isJhipsterVersionLessThan('4.11.1')) {
        generator.removeFile(`${CLIENT_MAIN_SRC_DIR}app/app.main-aot.ts`);
    }
    if (generator.isJhipsterVersionLessThan('4.13.1')) {
        generator.config.delete('hibernateCache');
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

        if (generator.authenticationType === 'oauth2' && generator.applicationType === 'microservice') {
            generator.removeFolder(`${constants.DOCKER_DIR}realm-config`);
            generator.removeFile(`${constants.DOCKER_DIR}keycloak.yml`);
        }
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

        generator.removeFolder(`${CLIENT_MAIN_SRC_DIR}app/shared/layout/header/menus`);
        generator.removeFolder(`${CLIENT_TEST_SRC_DIR}spec/app/shared/layout/header/menus`);
    }
    if (generator.isJhipsterVersionLessThan('6.1.0')) {
        generator.config.delete('blueprint');
        generator.config.delete('blueprintVersion');
    }
}
