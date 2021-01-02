/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const { languageSnakeCase, languageToJavaLanguage } = require('./utils');

const { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR, SERVER_MAIN_RES_DIR, ANGULAR_DIR, REACT_DIR, VUE_DIR } = constants;

const { ANGULAR, REACT, VUE } = constants.SUPPORTED_CLIENT_FRAMEWORKS;

module.exports = {
    cleanupOldFiles,
    cleanupOldServerFiles,
    upgradeFiles,
};

/**
 * Removes files that where generated in previous JHipster versions and therefore
 * need to be removed.
 *
 * WARNING this only removes files created by the main generator. Each sub-generator
 * should clean-up its own files: see the `cleanup` method in entity/index.js for cleaning
 * up entities.
 *
 * @param {any} generator - reference to generator
 */
function cleanupOldFiles(generator) {
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
    if (generator.isJhipsterVersionLessThan('6.3.0') && generator.jhipsterConfig.clientFramework === ANGULAR) {
        generator.removeFile(`${ANGULAR_DIR}account/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}admin/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}core/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}home/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}layouts/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/index.ts`);
        generator.removeFile(`${ANGULAR_DIR}shared/shared-common.module.ts`);
    }

    if (generator.isJhipsterVersionLessThan('6.3.0') && generator.jhipsterConfig.clientFramework === REACT) {
        generator.removeFile('tslint.json');
    }

    if (generator.isJhipsterVersionLessThan('6.4.0') && generator.jhipsterConfig.clientFramework === ANGULAR) {
        generator.removeFile(`${ANGULAR_DIR}admin/admin.route.ts`);
        generator.removeFile(`${ANGULAR_DIR}admin/admin.module.ts`);
    }

    if (generator.isJhipsterVersionLessThan('6.6.1') && generator.jhipsterConfig.clientFramework === ANGULAR) {
        generator.removeFile(`${ANGULAR_DIR}core/language/language.helper.ts`);
    }

    if (generator.isJhipsterVersionLessThan('6.8.0') && generator.jhipsterConfig.clientFramework === 'angularX') {
        generator.removeFile(`${ANGULAR_DIR}tsconfig-aot.json`);
    }

    if (generator.isJhipsterVersionLessThan('7.0.0') && generator.jhipsterConfig) {
        if (generator.jhipsterConfig.clientFramework === ANGULAR) {
            generator.removeFile(`${ANGULAR_DIR}admin/audits/audit-data.model.ts`);
            generator.removeFile(`${ANGULAR_DIR}admin/audits/audit.model.ts`);
            generator.removeFile(`${ANGULAR_DIR}admin/audits/audits.component.html`);
            generator.removeFile(`${ANGULAR_DIR}admin/audits/audits.component.ts`);
            generator.removeFile(`${ANGULAR_DIR}admin/audits/audits.route.ts`);
            generator.removeFile(`${ANGULAR_DIR}admin/audits/audits.module.ts`);
            generator.removeFile(`${ANGULAR_DIR}admin/audits/audits.service.ts`);
            generator.removeFile(`${ANGULAR_DIR}blocks/interceptor/errorhandler.interceptor.ts`);
            generator.removeFile(`${ANGULAR_DIR}entities/entity.module.ts`);
            generator.removeFile(`${ANGULAR_DIR}shared/util/datepicker-adapter.ts`);
            generator.removeFile(`${ANGULAR_DIR}shared/login/login.component.ts`);
            generator.removeFile(`${ANGULAR_DIR}shared/login/login.component.html`);
            generator.removeFile(`${ANGULAR_DIR}core/auth/user-route-access-service.ts`);
            generator.removeFile(`${ANGULAR_DIR}tsconfig.base.json`);
            generator.removeFile(`${CLIENT_TEST_SRC_DIR}spec/app/admin/audits/audits.component.spec.ts`);
            generator.removeFile(`${CLIENT_TEST_SRC_DIR}spec/app/admin/audits/audits.service.spec.ts`);
            generator.removeFile(`${CLIENT_TEST_SRC_DIR}spec/app/shared/login/login.component.spec.ts`);
        } else if (generator.jhipsterConfig.clientFramework === REACT) {
            generator.removeFile(`${REACT_DIR}modules/administration/audits/audits.tsx.ejs`);
            generator.removeFile(`${CLIENT_TEST_SRC_DIR}spec/enzyme-setup.ts`);
        } else if (generator.jhipsterConfig.clientFramework === VUE) {
            generator.removeFile(`${VUE_DIR}admin/audits/audits.component.ts`);
            generator.removeFile(`${VUE_DIR}admin/audits/audits.service.ts`);
            generator.removeFile(`${VUE_DIR}admin/audits/audits.vue`);
            generator.removeFile(`${CLIENT_TEST_SRC_DIR}spec/app/admin/audits/audits.component.spec.ts`);
        }
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
    if (generator.isJhipsterVersionLessThan('7.0.0')) {
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
}

/**
 * Upgrade files.
 *
 * @param {any} generator - reference to generator
 */
function upgradeFiles(generator) {
    let atLeastOneSuccess = false;
    if (generator.isJhipsterVersionLessThan('6.1.0')) {
        const languages = generator.config.get('languages');
        if (languages) {
            const langNameDiffer = function (lang) {
                const langProp = languageSnakeCase(lang);
                const langJavaProp = languageToJavaLanguage(lang);
                return langProp !== langJavaProp ? [langProp, langJavaProp] : undefined;
            };
            languages
                .map(langNameDiffer)
                .filter(props => props)
                .forEach(props => {
                    const code = generator.gitMove(
                        `${SERVER_MAIN_RES_DIR}i18n/messages_${props[0]}.properties`,
                        `${SERVER_MAIN_RES_DIR}i18n/messages_${props[1]}.properties`
                    );
                    atLeastOneSuccess = atLeastOneSuccess || code;
                });
        }
    }
    return atLeastOneSuccess;
}
