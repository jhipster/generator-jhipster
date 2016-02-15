/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var os = require('os');

const expectedFiles = {

    gradle : [
        'gradle.properties',
        'build.gradle',
        'settings.gradle',
        'gradlew',
        'gradlew.bat',
        'gradle/gatling.gradle',
        'gradle/liquibase.gradle',
        'gradle/mapstruct.gradle',
        'gradle/profile_dev.gradle',
        'gradle/profile_prod.gradle',
        'gradle/sonar.gradle',
        'gradle/wrapper/gradle-wrapper.jar',
        'gradle/wrapper/gradle-wrapper.properties'
    ],

    maven : [
        'pom.xml',
        'mvnw',
        'mvnw.cmd',
        '.mvn/wrapper/maven-wrapper.jar',
        '.mvn/wrapper/maven-wrapper.properties'
    ],

    server: [
        'README.md',
        '.gitignore',
        '.gitattributes',
        'src/main/resources/banner.txt',
        'src/main/resources/ehcache.xml',
        'src/main/resources/.h2.server.properties',
        'src/main/resources/templates/error.html',
        'src/main/resources/logback-spring.xml',
        'src/main/resources/config/application.yml',
        'src/main/resources/config/application-dev.yml',
        'src/main/resources/config/application-prod.yml',
        'src/main/resources/config/liquibase/changelog/00000000000000_initial_schema.xml',
        'src/main/resources/config/liquibase/master.xml',
        'src/main/resources/config/liquibase/users.csv',
        'src/main/resources/config/liquibase/authorities.csv',
        'src/main/resources/config/liquibase/users_authorities.csv',
        'src/main/resources/mails/activationEmail.html',
        'src/main/resources/mails/passwordResetEmail.html',
        'src/main/resources/i18n/messages.properties',
        'src/main/java/com/mycompany/myapp/JhipsterApp.java',
        'src/main/java/com/mycompany/myapp/ApplicationWebXml.java',
        'src/main/java/com/mycompany/myapp/aop/logging/LoggingAspect.java',
        'src/main/java/com/mycompany/myapp/config/apidoc/package-info.java',
        'src/main/java/com/mycompany/myapp/config/apidoc/SwaggerConfiguration.java',
        'src/main/java/com/mycompany/myapp/async/package-info.java',
        'src/main/java/com/mycompany/myapp/async/ExceptionHandlingAsyncTaskExecutor.java',
        'src/main/java/com/mycompany/myapp/config/package-info.java',
        'src/main/java/com/mycompany/myapp/config/AsyncConfiguration.java',
        'src/main/java/com/mycompany/myapp/config/CacheConfiguration.java',
        'src/main/java/com/mycompany/myapp/config/Constants.java',
        'src/main/java/com/mycompany/myapp/config/CloudDatabaseConfiguration.java',
        'src/main/java/com/mycompany/myapp/config/DatabaseConfiguration.java',
        'src/main/java/com/mycompany/myapp/config/JacksonConfiguration.java',
        'src/main/java/com/mycompany/myapp/config/LocaleConfiguration.java',
        'src/main/java/com/mycompany/myapp/config/LoggingAspectConfiguration.java',
        'src/main/java/com/mycompany/myapp/config/MetricsConfiguration.java',
        'src/main/java/com/mycompany/myapp/config/SecurityConfiguration.java',
        'src/main/java/com/mycompany/myapp/config/ThymeleafConfiguration.java',
        'src/main/java/com/mycompany/myapp/config/WebConfigurer.java',
        'src/main/java/com/mycompany/myapp/config/audit/package-info.java',
        'src/main/java/com/mycompany/myapp/config/audit/AuditEventConverter.java',
        'src/main/java/com/mycompany/myapp/config/locale/package-info.java',
        'src/main/java/com/mycompany/myapp/config/locale/AngularCookieLocaleResolver.java',
        'src/main/java/com/mycompany/myapp/domain/package-info.java',
        'src/main/java/com/mycompany/myapp/domain/AbstractAuditingEntity.java',
        'src/main/java/com/mycompany/myapp/domain/Authority.java',
        'src/main/java/com/mycompany/myapp/domain/PersistentAuditEvent.java',
        'src/main/java/com/mycompany/myapp/domain/PersistentToken.java',
        'src/main/java/com/mycompany/myapp/domain/User.java',
        'src/main/java/com/mycompany/myapp/domain/util/JSR310DateConverters.java',
        'src/main/java/com/mycompany/myapp/domain/util/JSR310DateTimeSerializer.java',
        'src/main/java/com/mycompany/myapp/domain/util/JSR310LocalDateDeserializer.java',
        'src/main/java/com/mycompany/myapp/domain/util/JSR310PersistenceConverters.java',
        'src/main/java/com/mycompany/myapp/repository/package-info.java',
        'src/main/java/com/mycompany/myapp/repository/AuthorityRepository.java',
        'src/main/java/com/mycompany/myapp/repository/CustomAuditEventRepository.java',
        'src/main/java/com/mycompany/myapp/repository/PersistenceAuditEventRepository.java',
        'src/main/java/com/mycompany/myapp/repository/UserRepository.java',
        'src/main/java/com/mycompany/myapp/repository/PersistentTokenRepository.java',
        'src/main/java/com/mycompany/myapp/security/package-info.java',
        'src/main/java/com/mycompany/myapp/security/AjaxAuthenticationFailureHandler.java',
        'src/main/java/com/mycompany/myapp/security/AjaxAuthenticationSuccessHandler.java',
        'src/main/java/com/mycompany/myapp/security/AjaxLogoutSuccessHandler.java',
        'src/main/java/com/mycompany/myapp/security/AuthoritiesConstants.java',
        'src/main/java/com/mycompany/myapp/security/CustomPersistentRememberMeServices.java',
        'src/main/java/com/mycompany/myapp/security/Http401UnauthorizedEntryPoint.java',
        'src/main/java/com/mycompany/myapp/security/SecurityUtils.java',
        'src/main/java/com/mycompany/myapp/security/SpringSecurityAuditorAware.java',
        'src/main/java/com/mycompany/myapp/security/UserDetailsService.java',
        'src/main/java/com/mycompany/myapp/security/UserNotActivatedException.java',
        'src/main/java/com/mycompany/myapp/service/package-info.java',
        'src/main/java/com/mycompany/myapp/service/AuditEventService.java',
        'src/main/java/com/mycompany/myapp/service/UserService.java',
        'src/main/java/com/mycompany/myapp/service/MailService.java',
        'src/main/java/com/mycompany/myapp/service/util/RandomUtil.java',
        'src/main/java/com/mycompany/myapp/web/filter/package-info.java',
        'src/main/java/com/mycompany/myapp/web/filter/CachingHttpHeadersFilter.java',
        'src/main/java/com/mycompany/myapp/web/filter/StaticResourcesProductionFilter.java',
        'src/main/java/com/mycompany/myapp/web/filter/CsrfCookieGeneratorFilter.java',
        'src/main/java/com/mycompany/myapp/web/rest/dto/package-info.java',
        'src/main/java/com/mycompany/myapp/web/rest/dto/LoggerDTO.java',
        'src/main/java/com/mycompany/myapp/web/rest/dto/UserDTO.java',
        'src/main/java/com/mycompany/myapp/web/rest/util/PaginationUtil.java',
        'src/main/java/com/mycompany/myapp/web/rest/package-info.java',
        'src/main/java/com/mycompany/myapp/web/rest/AccountResource.java',
        'src/main/java/com/mycompany/myapp/web/rest/AuditResource.java',
        'src/main/java/com/mycompany/myapp/web/rest/LogsResource.java',
        'src/main/java/com/mycompany/myapp/web/rest/UserResource.java',
        'src/test/java/com/mycompany/myapp/security/SecurityUtilsUnitTest.java',
        'src/test/java/com/mycompany/myapp/service/UserServiceIntTest.java',
        'src/test/java/com/mycompany/myapp/web/rest/AccountResourceIntTest.java',
        'src/test/java/com/mycompany/myapp/web/rest/AuditResourceIntTest.java',
        'src/test/java/com/mycompany/myapp/web/rest/TestUtil.java',
        'src/test/java/com/mycompany/myapp/web/rest/UserResourceIntTest.java',
        'src/test/resources/config/application.yml',
        'src/test/resources/logback-test.xml',
        'src/test/resources/ehcache.xml',
        'src/test/gatling/conf/gatling.conf',
        '.editorconfig',
        '.jshintrc'
    ],

    client: [
        'bower.json',
        'package.json',
        '.bowerrc',
        'src/main/webapp/content/css/main.css',
        'src/main/webapp/favicon.ico',
        'src/main/webapp/robots.txt',
        'src/main/webapp/.htaccess',
        'src/main/webapp/i18n/en/activate.json',
        'src/main/webapp/i18n/en/audits.json',
        'src/main/webapp/i18n/en/configuration.json',
        'src/main/webapp/i18n/en/error.json',
        'src/main/webapp/i18n/en/gateway.json',
        'src/main/webapp/i18n/en/global.json',
        'src/main/webapp/i18n/en/health.json',
        'src/main/webapp/i18n/en/login.json',
        'src/main/webapp/i18n/en/logs.json',
        'src/main/webapp/i18n/en/home.json',
        'src/main/webapp/i18n/en/metrics.json',
        'src/main/webapp/i18n/en/password.json',
        'src/main/webapp/i18n/en/register.json',
        'src/main/webapp/i18n/en/sessions.json',
        'src/main/webapp/i18n/en/settings.json',
        'src/main/webapp/i18n/en/reset.json',
        'src/main/webapp/i18n/en/user-management.json',
        'src/main/webapp/i18n/fr/activate.json',
        'src/main/webapp/i18n/fr/audits.json',
        'src/main/webapp/i18n/fr/configuration.json',
        'src/main/webapp/i18n/fr/error.json',
        'src/main/webapp/i18n/fr/global.json',
        'src/main/webapp/i18n/fr/gateway.json',
        'src/main/webapp/i18n/fr/health.json',
        'src/main/webapp/i18n/fr/login.json',
        'src/main/webapp/i18n/fr/logs.json',
        'src/main/webapp/i18n/fr/home.json',
        'src/main/webapp/i18n/fr/metrics.json',
        'src/main/webapp/i18n/fr/password.json',
        'src/main/webapp/i18n/fr/register.json',
        'src/main/webapp/i18n/fr/sessions.json',
        'src/main/webapp/i18n/fr/settings.json',
        'src/main/webapp/i18n/fr/reset.json',
        'src/main/webapp/i18n/fr/user-management.json',
        'src/main/webapp/app/app.module.js',
        'src/main/webapp/app/app.config.js',
        'src/main/webapp/app/app.constants.js',
        'src/main/webapp/app/admin/audits/audits.service.js',
        'src/main/webapp/app/admin/configuration/configuration.service.js',
        'src/main/webapp/app/admin/logs/logs.service.js',
        'src/main/webapp/app/admin/metrics/metrics.service.js',
        'src/main/webapp/app/admin/health/health.service.js',
        'src/main/webapp/app/services/auth/auth.service.js',
        'src/main/webapp/app/services/auth/principal.service.js',
        'src/main/webapp/app/services/auth/authority.directive.js',
        'src/main/webapp/app/services/auth/auth.session.service.js',
        'src/main/webapp/app/services/auth/account.service.js',
        'src/main/webapp/app/services/auth/activate.service.js',
        'src/main/webapp/app/services/auth/password.service.js',
        'src/main/webapp/app/services/auth/register.service.js',
        'src/main/webapp/app/services/auth/sessions.service.js',
        'src/main/webapp/app/components/form/form.directive.js',
        'src/main/webapp/app/components/form/uib-pager.config.js',
        'src/main/webapp/app/components/form/uib-pagination.config.js',
        'src/main/webapp/app/components/language/language.controller.js',
        'src/main/webapp/app/components/language/language.service.js',
        'src/main/webapp/app/layouts/navbar/navbar.directive.js',
        'src/main/webapp/app/layouts/navbar/navbar.html',
        'src/main/webapp/app/layouts/navbar/navbar.controller.js',
        'src/main/webapp/app/services/user/user.service.js',
        'src/main/webapp/app/components/util/base64.service.js',
        'src/main/webapp/app/components/util/parse-links.service.js',
        'src/main/webapp/app/components/util/truncate.filter.js',
        'src/main/webapp/app/components/util/date-util.service.js',
        'src/main/webapp/app/components/util/sort.directive.js',
        'src/main/webapp/app/account/account.state.js',
        'src/main/webapp/app/account/activate/activate.html',
        'src/main/webapp/app/account/activate/activate.state.js',
        'src/main/webapp/app/account/activate/activate.controller.js',
        'src/main/webapp/app/components/login/login.html',
        'src/main/webapp/app/components/login/login.service.js',
        'src/main/webapp/app/components/login/login.controller.js',
        'src/main/webapp/app/account/password/password.html',
        'src/main/webapp/app/account/password/password.state.js',
        'src/main/webapp/app/account/password/password.controller.js',
        'src/main/webapp/app/account/password/password.directive.js',
        'src/main/webapp/app/account/register/register.html',
        'src/main/webapp/app/account/register/register.state.js',
        'src/main/webapp/app/account/register/register.controller.js',
        'src/main/webapp/app/account/reset/request/reset.request.html',
        'src/main/webapp/app/account/reset/request/reset.request.state.js',
        'src/main/webapp/app/account/reset/request/reset.request.controller.js',
        'src/main/webapp/app/account/reset/finish/reset.finish.html',
        'src/main/webapp/app/account/reset/finish/reset.finish.state.js',
        'src/main/webapp/app/account/reset/finish/reset.finish.controller.js',
        'src/main/webapp/app/account/sessions/sessions.html',
        'src/main/webapp/app/account/sessions/sessions.state.js',
        'src/main/webapp/app/account/sessions/sessions.controller.js',
        'src/main/webapp/app/account/settings/settings.html',
        'src/main/webapp/app/account/settings/settings.state.js',
        'src/main/webapp/app/account/settings/settings.controller.js',
        'src/main/webapp/app/admin/admin.state.js',
        'src/main/webapp/app/admin/audits/audits.html',
        'src/main/webapp/app/admin/audits/audits.state.js',
        'src/main/webapp/app/admin/audits/audits.controller.js',
        'src/main/webapp/app/admin/configuration/configuration.html',
        'src/main/webapp/app/admin/configuration/configuration.state.js',
        'src/main/webapp/app/admin/configuration/configuration.controller.js',
        'src/main/webapp/app/admin/docs/docs.html',
        'src/main/webapp/app/admin/docs/docs.state.js',
        'src/main/webapp/app/admin/health/health.html',
        'src/main/webapp/app/admin/health/health.state.js',
        'src/main/webapp/app/admin/health/health.controller.js',
        'src/main/webapp/app/admin/logs/logs.html',
        'src/main/webapp/app/admin/logs/logs.state.js',
        'src/main/webapp/app/admin/logs/logs.controller.js',
        'src/main/webapp/app/admin/metrics/metrics.html',
        'src/main/webapp/app/admin/metrics/metrics.state.js',
        'src/main/webapp/app/admin/metrics/metrics.controller.js',
        'src/main/webapp/app/layouts/error/error.html',
        'src/main/webapp/app/layouts/error/accessdenied.html',
        'src/main/webapp/app/entities/entity.state.js',
        'src/main/webapp/app/layouts/error/error.state.js',
        'src/main/webapp/app/home/home.html',
        'src/main/webapp/app/home/home.state.js',
        'src/main/webapp/app/home/home.controller.js',
        'src/test/javascript/karma.conf.js',
        'src/test/javascript/spec/helpers/httpBackend.js',
        'src/test/javascript/spec/helpers/module.js',
        'src/test/javascript/spec/app/admin/health/health.controller.spec.js',
        'src/test/javascript/spec/app/components/login/login.controller.spec.js',
        'src/test/javascript/spec/app/account/password/password.controller.spec.js',
        'src/test/javascript/spec/app/account/password/password.directive.spec.js',
        'src/test/javascript/spec/app/account/sessions/sessions.controller.spec.js',
        'src/test/javascript/spec/app/account/settings/settings.controller.spec.js',
        'src/test/javascript/spec/app/account/activate/activate.controller.spec.js',
        'src/test/javascript/spec/app/account/register/register.controller.spec.js',
        'src/test/javascript/spec/app/account/reset/finish/reset.finish.controller.spec.js',
        'src/test/javascript/spec/app/account/reset/request/reset.request.controller.spec.js',
        'src/test/javascript/spec/app/services/auth/auth.services.spec.js',
        'src/main/webapp/content/css/documentation.css',
        'src/main/webapp/content/images/development_ribbon.png',
        'src/main/webapp/content/images/hipster.png',
        'src/main/webapp/content/images/hipster2x.png'
    ],

    i18n: [
        'src/main/resources/i18n/messages_en.properties',
        'src/main/resources/i18n/messages_fr.properties',
        'src/main/webapp/i18n/en/global.json',
        'src/main/webapp/i18n/fr/global.json',
        'src/main/webapp/app/components/language/language.controller.js',
        'src/main/webapp/app/components/language/language.service.js'
    ],

    socialLogin: [
        'src/main/java/com/mycompany/myapp/config/social/SocialConfiguration.java',
        'src/main/java/com/mycompany/myapp/domain/SocialUserConnection.java',
        'src/main/java/com/mycompany/myapp/repository/CustomSocialConnectionRepository.java',
        'src/main/java/com/mycompany/myapp/repository/CustomSocialUsersConnectionRepository.java',
        'src/main/java/com/mycompany/myapp/repository/SocialUserConnectionRepository.java',
        'src/main/java/com/mycompany/myapp/security/social/CustomSignInAdapter.java',
        'src/main/java/com/mycompany/myapp/service/SocialService.java',
        'src/main/java/com/mycompany/myapp/web/rest/SocialController.java',
        'src/test/java/com/mycompany/myapp/repository/CustomSocialUsersConnectionRepositoryIntTest.java',
        'src/test/java/com/mycompany/myapp/service/SocialServiceIntTest.java'
    ],

    jwt: [
        'src/main/java/com/mycompany/myapp/security/jwt/JWTConfigurer.java',
        'src/main/java/com/mycompany/myapp/security/jwt/JWTFilter.java',
        'src/main/java/com/mycompany/myapp/security/jwt/TokenProvider.java',
    ],

    gateway: [
        'src/main/java/com/mycompany/myapp/config/GatewayConfiguration.java',
        'src/main/java/com/mycompany/myapp/gateway/ratelimiting/RateLimitingFilter.java',
        'src/main/java/com/mycompany/myapp/gateway/ratelimiting/RateLimitingRepository.java',
        'src/main/java/com/mycompany/myapp/web/rest/dto/RouteDTO.java',
        'src/main/java/com/mycompany/myapp/web/rest/GatewayResource.java',
        'src/main/webapp/app/admin/gateway/gateway.controller.js',
        'src/main/webapp/app/admin/gateway/gateway.state.js',
        'src/main/webapp/app/admin/gateway/gateway.html',
        'src/main/webapp/app/admin/gateway/gateway.routes.service.js'
    ]
};

describe('JHipster generator', function () {
    this.timeout(5000); //to avoid occassional timeouts

    describe('default configuration', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true})
                .withPrompts({
                    "baseName": "jhipster",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "session",
                    "hibernateCache": "ehcache",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "useSass": false,
                    "enableTranslation": true,
                    "buildTool": "maven",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected default files', function () {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.maven);
            assert.file(expectedFiles.client);
            assert.file(['gulpfile.js']);
        });
    });

    describe('default gradle configuration', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true})
                .withPrompts({
                    "baseName": "jhipster",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "session",
                    "hibernateCache": "ehcache",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "useSass": false,
                    "enableTranslation": true,
                    "buildTool": "gradle",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected default files for gradle', function () {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.gradle);
            assert.file(expectedFiles.client);
            assert.file(['gulpfile.js']);
            assert.file(['gradle/yeoman.gradle']);
        });
    });

    describe('package names', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true})
                .withPrompts({
                    "baseName": "jhipster",
                    "packageName": "com.otherpackage",
                    "packageFolder": "com/otherpackage",
                    "authenticationType": "session",
                    "hibernateCache": "ehcache",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "useSass": false,
                    "enableTranslation": true,
                    "buildTool": "maven",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected files with correct package names', function () {
            assert.file([
                'src/main/java/com/otherpackage/JhipsterApp.java'
            ]);
            assert.fileContent('src/main/java/com/otherpackage/JhipsterApp.java', /package com\.otherpackage;/);
        });
    });

    describe('application names', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true})
                .withPrompts({
                    "baseName": "myapplication",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "session",
                    "hibernateCache": "ehcache",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "useSass": false,
                    "enableTranslation": true,
                    "buildTool": "maven",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected files with correct application name', function () {
            assert.file([
                'src/main/webapp/app/home/home.state.js',
            ]);
            assert.fileContent('src/main/webapp/app/home/home.state.js', /myapplicationApp/);
        })
    });

    describe('oauth2', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true})
                .withPrompts({
                    "baseName": "jhipster",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "oauth2",
                    "hibernateCache": "ehcache",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "useSass": false,
                    "enableTranslation": true,
                    "buildTool": "maven",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected files with authenticationType "oauth2"', function () {
            assert.file([
                'src/main/java/com/mycompany/myapp/config/OAuth2ServerConfiguration.java'
            ]);
        });
    });

    describe('hazelcast', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true})
                .withPrompts({
                    "baseName": "jhipster",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "session",
                    "hibernateCache": "hazelcast",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "useSass": false,
                    "enableTranslation": true,
                    "buildTool": "maven",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected files with hibernateCache "hazelcast"', function () {
            assert.file([
                'src/main/java/com/mycompany/myapp/config/hazelcast/HazelcastCacheRegionFactory.java',
                'src/main/java/com/mycompany/myapp/config/hazelcast/package-info.java'
            ]);
        });
    });

    describe('i18n', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true})
                .withPrompts({
                    "baseName": "jhipster",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "session",
                    "hibernateCache": "hazelcast",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "useSass": false,
                    "enableTranslation": false,
                    "buildTool": "maven",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('does not create i18n files if i18n is disabled', function () {
            assert.noFile(expectedFiles.i18n);
            assert.file(['src/main/resources/i18n/messages.properties']);
        });
    });

    describe('social login', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true})
                .withPrompts({
                    "baseName": "jhipster",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "session-social",
                    "hibernateCache": "ehcache",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "useSass": false,
                    "enableTranslation": true,
                    "buildTool": "maven",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected files with social login enabled', function () {
            assert.file(expectedFiles.socialLogin);
        });
    });

    describe('JWT authentication', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true})
                .withPrompts({
                    "baseName": "jhipster",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "jwt",
                    "hibernateCache": "ehcache",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "useSass": false,
                    "enableTranslation": true,
                    "buildTool": "maven",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected files with JWT authentication', function () {
            assert.file(expectedFiles.jwt);
        });
    });

    describe('skip client', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true, skipClient: true})
                .withPrompts({
                    "baseName": "jhipster",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "session",
                    "hibernateCache": "ehcache",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "buildTool": "maven",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected files for default configuration with skip client option enabled', function () {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.maven);
            assert.noFile(expectedFiles.client);
            assert.noFile(['gulpfile.js']);
        });
    });

    describe('skip client with gradle', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true, skipClient: true})
                .withPrompts({
                    "baseName": "jhipster",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "session",
                    "hibernateCache": "ehcache",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "buildTool": "gradle",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected files for default configuration with skip client option enabled', function () {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.gradle);
            assert.noFile(expectedFiles.client);
            assert.noFile(['gulpfile.js']);
            assert.noFile(['gradle/yeoman.gradle']);
        });
    });

    describe('gateway', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({skipInstall: true})
                .withPrompts({
                    "applicationType": "gateway",
                    "baseName": "jhipster",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "jwt",
                    "hibernateCache": "ehcache",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "useSass": false,
                    "enableTranslation": true,
                    "buildTool": "maven",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected files with the gateway application type', function () {
            assert.file(expectedFiles.jwt);
            assert.file(expectedFiles.gateway);
        });
    });
});
describe('JHipster server generator', function () {
    this.timeout(4000); //to avoid occassional timeouts
    describe('generate server', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/server'))
                .withOptions({skipInstall: true, gatling: true})
                .withPrompts({
                    "baseName": "jhipster",
                    "packageName": "com.mycompany.myapp",
                    "packageFolder": "com/mycompany/myapp",
                    "authenticationType": "session",
                    "hibernateCache": "ehcache",
                    "clusteredHttpSession": "no",
                    "websocket": "no",
                    "databaseType": "sql",
                    "devDatabaseType": "h2Memory",
                    "prodDatabaseType": "mysql",
                    "buildTool": "maven",
                    "rememberMeKey": "5c37379956bd1242f5636c8cb322c2966ad81277",
                    "searchEngine": "no"
                })
                .on('end', done);
        });

        it('creates expected files for default configuration with gatling enabled for server generator', function () {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.maven);
            assert.noFile(expectedFiles.client);
            assert.noFile(['gulpfile.js']);
        });
    });
});

describe('JHipster client generator', function () {
    this.timeout(4000); //to avoid occassional timeouts
    describe('generate client', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/client'))
                .withOptions({skipInstall: true, auth: 'session'})
                .withPrompts({
                    "baseName": "jhipster",
                    "enableTranslation": true,
                    "useSass": true
                })
                .on('end', done);
        });

        it('creates expected files for default configuration for client generator', function () {
            assert.noFile(expectedFiles.server);
            assert.noFile(expectedFiles.maven);
            assert.file(expectedFiles.client);
            assert.file(['gulpfile.js']);
        });
    });
});
