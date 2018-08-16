const constants = require('../../generators/generator-constants');

const TEST_DIR = constants.TEST_DIR;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
const SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;
const DOCKER_DIR = constants.DOCKER_DIR;

const expectedFiles = {

    gradle: [
        'gradle.properties',
        'build.gradle',
        'settings.gradle',
        'gradlew',
        'gradlew.bat',
        'gradle/docker.gradle',
        'gradle/liquibase.gradle',
        'gradle/profile_dev.gradle',
        'gradle/profile_prod.gradle',
        'gradle/sonar.gradle',
        'gradle/wrapper/gradle-wrapper.jar',
        'gradle/wrapper/gradle-wrapper.properties'
    ],

    maven: [
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
        `${SERVER_MAIN_RES_DIR}banner.txt`,
        `${SERVER_MAIN_RES_DIR}.h2.server.properties`,
        `${SERVER_MAIN_RES_DIR}templates/error.html`,
        `${SERVER_MAIN_RES_DIR}logback-spring.xml`,
        `${SERVER_MAIN_RES_DIR}config/application.yml`,
        `${SERVER_MAIN_RES_DIR}config/application-dev.yml`,
        `${SERVER_MAIN_RES_DIR}config/application-prod.yml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/users.csv`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/authorities.csv`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/users_authorities.csv`,
        `${SERVER_MAIN_RES_DIR}templates/mail/activationEmail.html`,
        `${SERVER_MAIN_RES_DIR}templates/mail/passwordResetEmail.html`,
        `${SERVER_MAIN_RES_DIR}i18n/messages.properties`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/JhipsterApp.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/aop/logging/LoggingAspect.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/ApplicationProperties.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/AsyncConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/Constants.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CloudDatabaseConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/DatabaseConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/DateTimeFormatConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/JacksonConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LocaleConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LoggingAspectConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/MetricsConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/SecurityConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/WebConfigurer.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/audit/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/audit/AuditEventConverter.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/AbstractAuditingEntity.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Authority.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/PersistentAuditEvent.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/User.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/AuthorityRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/CustomAuditEventRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/PersistenceAuditEventRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/UserRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/AuthoritiesConstants.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/SecurityUtils.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/SpringSecurityAuditorAware.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/DomainUserDetailsService.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/UserNotActivatedException.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/AuditEventService.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/UserService.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/MailService.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/util/RandomUtil.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/UserDTO.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/UserMapper.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/BadRequestAlertException.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/CustomParameterizedException.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/InternalServerErrorException.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/EmailAlreadyUsedException.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/ErrorConstants.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/ExceptionTranslator.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/FieldErrorVM.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/InvalidPasswordException.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/LoginAlreadyUsedException.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/vm/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/vm/KeyAndPasswordVM.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/vm/LoggerVM.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/vm/ManagedUserVM.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/vm/LoggerVM.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/util/PaginationUtil.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/AccountResource.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/AuditResource.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/LogsResource.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/UserResource.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/security/SecurityUtilsUnitTest.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/service/UserServiceIntTest.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/AccountResourceIntTest.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/AuditResourceIntTest.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/LogsResourceIntTest.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/TestUtil.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/UserResourceIntTest.java`,
        `${SERVER_TEST_RES_DIR}config/application.yml`,
        `${SERVER_TEST_RES_DIR}logback.xml`,
        '.editorconfig'
    ],

    infinispan: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheFactoryConfiguration.java`
    ],

    memcached: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        `${DOCKER_DIR}memcached.yml`
    ],

    gatling: [
        `${TEST_DIR}gatling/conf/gatling.conf`
    ],

    i18nJson: [
        `${CLIENT_MAIN_SRC_DIR}i18n/en/activate.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/audits.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/configuration.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/error.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/health.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/login.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/logs.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/home.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/metrics.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/password.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/register.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/sessions.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/settings.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/reset.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/user-management.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/activate.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/audits.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/configuration.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/error.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/health.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/login.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/logs.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/home.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/metrics.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/password.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/register.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/sessions.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/settings.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/reset.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/user-management.json`
    ],

    userManagement: [
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-delete-dialog.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-delete-dialog.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-detail.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-detail.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-update.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-update.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/user/user.model.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/user/user.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/user-management/user-management-delete-dialog.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/user-management/user-management-detail.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/user-management/user-management-update.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/user-management/user-management.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/core/user/user.service.spec.ts`,
    ],

    client: [
        'angular.json',
        '.prettierignore',
        '.prettierrc',
        'package.json',
        'proxy.conf.json',
        'src/main/webapp/404.html',
        `${CLIENT_MAIN_SRC_DIR}app/account/account.module.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/account.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/activate/activate.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/activate/activate.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/activate/activate.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/activate/activate.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/index.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password-reset/finish/password-reset-finish.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password-reset/finish/password-reset-finish.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password-reset/finish/password-reset-finish.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password-reset/finish/password-reset-finish.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password-reset/init/password-reset-init.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password-reset/init/password-reset-init.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password-reset/init/password-reset-init.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password-reset/init/password-reset-init.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password/password-strength-bar.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password/password-strength-bar.css`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password/password.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password/password.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password/password.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password/password.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/register/register.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/register/register.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/register/register.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/register/register.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/settings/settings.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/settings/settings.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/settings/settings.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/admin.module.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/admin.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audit-data.model.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audit.model.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audits.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audits.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audits.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audits.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/docs/docs.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/docs/docs.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/docs/docs.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health-modal.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health-modal.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/index.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/logs/log.model.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics-modal.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics-modal.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/app-routing.module.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/app.constants.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/app.main.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/app.module.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/config/prod.config.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/config/uib-pagination.config.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/interceptor/auth-expired.interceptor.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/interceptor/errorhandler.interceptor.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/interceptor/notification.interceptor.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/entity.module.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/home/home.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/home/home.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/home/home.css`,
        `${CLIENT_MAIN_SRC_DIR}app/home/home.module.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/home/home.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/home/index.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/error/error.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/error/error.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/error/error.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/footer/footer.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/footer/footer.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/index.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/main/main.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/main/main.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/active-menu.directive.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.css`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/profiles/page-ribbon.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/profiles/page-ribbon.css`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/profiles/profile-info.model.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/profiles/profile.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/polyfills.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/alert/alert-error.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/alert/alert.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/auth/account.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/auth/csrf.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/auth/has-any-authority.directive.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/auth/principal.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/auth/state-storage.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/auth/user-route-access-service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/constants/error.constants.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/constants/input.constants.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/constants/pagination.constants.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/index.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/language/find-language-from-key.pipe.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/language/language.constants.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/language/language.helper.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/login/login-modal.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/login/login.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/login/login.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/login/login.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/util/request-util.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/util/datepicker-adapter.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/shared-common.module.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/shared-libs.module.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/shared.module.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/user/account.model.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/core.module.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/index.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/vendor.ts`,
        `${CLIENT_MAIN_SRC_DIR}content/css/documentation.css`,
        `${CLIENT_MAIN_SRC_DIR}content/css/global.css`,
        `${CLIENT_MAIN_SRC_DIR}content/css/vendor.css`,
        `${CLIENT_MAIN_SRC_DIR}content/images/hipster.png`,
        `${CLIENT_MAIN_SRC_DIR}content/images/hipster2x.png`,
        `${CLIENT_MAIN_SRC_DIR}content/images/hipster192.png`,
        `${CLIENT_MAIN_SRC_DIR}content/images/hipster256.png`,
        `${CLIENT_MAIN_SRC_DIR}content/images/hipster384.png`,
        `${CLIENT_MAIN_SRC_DIR}content/images/hipster512.png`,
        `${CLIENT_MAIN_SRC_DIR}content/images/logo-jhipster.png`,
        `${CLIENT_MAIN_SRC_DIR}favicon.ico`,
        `${CLIENT_MAIN_SRC_DIR}index.html`,
        `${CLIENT_MAIN_SRC_DIR}manifest.webapp`,
        `${CLIENT_MAIN_SRC_DIR}robots.txt`,
        `${CLIENT_MAIN_SRC_DIR}swagger-ui/dist/images/throbber.gif`,
        `${CLIENT_MAIN_SRC_DIR}swagger-ui/index.html`,
        `${CLIENT_TEST_SRC_DIR}jest.ts`,
        `${CLIENT_TEST_SRC_DIR}jest.conf.js`,
        `${CLIENT_TEST_SRC_DIR}jest-global-mocks.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/activate/activate.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/password-reset/finish/password-reset-finish.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/password-reset/init/password-reset-init.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/password/password-strength-bar.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/password/password.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/register/register.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/settings/settings.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/audits/audits.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/audits/audits.service.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/configuration/configuration.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/configuration/configuration.service.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/health/health.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/logs/logs.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/logs/logs.service.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/metrics/metrics.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/metrics/metrics.service.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/metrics/metrics-modal.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/shared/alert/alert-error.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/shared/login/login.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/mock-account.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/mock-active-modal.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/mock-alert.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/mock-event-manager.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/mock-language.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/mock-login.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/mock-principal.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/mock-route.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/mock-state-storage.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/spyobject.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/test.module.ts`,
        'tsconfig-aot.json',
        'tsconfig.json',
        'tslint.json',
        'webpack/logo-jhipster.png',
        'webpack/utils.js',
        'webpack/webpack.common.js',
        'webpack/webpack.dev.js',
        'webpack/webpack.prod.js'
    ],

    i18n: [
        `${SERVER_MAIN_RES_DIR}i18n/messages_en.properties`,
        `${SERVER_MAIN_RES_DIR}i18n/messages_fr.properties`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`,
        `${CLIENT_MAIN_SRC_DIR}app/core/language/language.constants.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/language/language.helper.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/language/find-language-from-key.pipe.ts`
    ],

    i18nRtl: [
        `${SERVER_MAIN_RES_DIR}i18n/messages_en.properties`,
        `${SERVER_MAIN_RES_DIR}i18n/messages_ar_ly.properties`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/ar-ly/global.json`,
        `${CLIENT_MAIN_SRC_DIR}app/core/language/language.constants.ts`,
        `${CLIENT_MAIN_SRC_DIR}content/css/rtl.css`,
        `${CLIENT_MAIN_SRC_DIR}app/core/language/language.helper.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/language/find-language-from-key.pipe.ts`
    ],

    session: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/PersistentToken.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/PersistentTokenRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/PersistentTokenRememberMeServices.java`,
        `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/auth/auth-session.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/sessions/sessions.component.spec.ts`
    ],

    jwtServer: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/jwt/JWTConfigurer.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/jwt/JWTFilter.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/jwt/TokenProvider.java`
    ],

    jwtClient: [
        `${CLIENT_MAIN_SRC_DIR}app/blocks/interceptor/auth.interceptor.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/core/auth/auth-jwt.service.ts`
    ],

    oauth2: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/SecurityConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/User.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/AccountResource.java`,
        `${DOCKER_DIR}keycloak.yml`
    ],

    messageBroker: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/MessagingConfiguration.java`,
        `${DOCKER_DIR}kafka.yml`
    ],

    swaggerCodegen: [
        `${SERVER_MAIN_RES_DIR}swagger/api.yml`,
    ],

    swaggerCodegenGradle: [
        'gradle/swagger.gradle',
    ],

    uaa: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/UaaConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/UaaWebSecurityConfiguration.java`
    ],

    gateway: [
        `${SERVER_MAIN_RES_DIR}config/bootstrap.yml`,
        `${SERVER_MAIN_RES_DIR}config/bootstrap-prod.yml`,
        `${SERVER_TEST_RES_DIR}config/bootstrap.yml`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/GatewayConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/gateway/ratelimiting/RateLimitingFilter.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/vm/RouteVM.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/GatewayResource.java`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/gateway/gateway.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/gateway/gateway.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/gateway/gateway.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/gateway/gateway-routes.service.ts`
    ],

    microservice: [
        `${SERVER_MAIN_RES_DIR}static/index.html`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/SecurityConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/FeignConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/client/UserFeignClientInterceptor.java`,
        'package.json'
    ],

    microserviceGradle: [
        'gradle/docker.gradle'
    ],

    dockerServices: [
        `${DOCKER_DIR}app.yml`,
        `${DOCKER_DIR}Dockerfile`,
        `${DOCKER_DIR}sonar.yml`
    ],

    mysql: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LiquibaseConfiguration.java`,
        `${DOCKER_DIR}mysql.yml`
    ],

    mariadb: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LiquibaseConfiguration.java`,
        `${DOCKER_DIR}mariadb.yml`
    ],

    mssql: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LiquibaseConfiguration.java`,
        `${DOCKER_DIR}mssql.yml`
    ],

    postgresql: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LiquibaseConfiguration.java`,
        `${DOCKER_DIR}postgresql.yml`
    ],

    hazelcast: [
        `${DOCKER_DIR}hazelcast-management-center.yml`
    ],

    mongodb: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/dbmigrations/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/dbmigrations/InitialSetupMigration.java`,
        `${DOCKER_DIR}mongodb.yml`,
        `${DOCKER_DIR}mongodb-cluster.yml`,
        `${DOCKER_DIR}mongodb/MongoDB.Dockerfile`,
        `${DOCKER_DIR}mongodb/scripts/init_replicaset.js`
    ],

    couchbase: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/N1qlCouchbaseRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/CustomN1qlCouchbaseRepository.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/DatabaseTestConfiguration.java`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0__create_indexes.n1ql`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/ROLE_ADMIN.json`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/ROLE_USER.json`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__admin.json`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__system.json`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__user.json`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__anonymoususer.json`,
        `${DOCKER_DIR}couchbase.yml`,
        `${DOCKER_DIR}couchbase-cluster.yml`,
        `${DOCKER_DIR}couchbase/Couchbase.Dockerfile`,
        `${DOCKER_DIR}couchbase/scripts/configure-node.sh`
    ],

    cassandra: [
        `${SERVER_MAIN_RES_DIR}config/cql/create-keyspace-prod.cql`,
        `${SERVER_MAIN_RES_DIR}config/cql/create-keyspace.cql`,
        `${SERVER_MAIN_RES_DIR}config/cql/drop-keyspace.cql`,
        `${SERVER_MAIN_RES_DIR}config/cql/changelog/00000000000000_create-tables.cql`,
        `${SERVER_MAIN_RES_DIR}config/cql/changelog/00000000000001_insert_default_users.cql`,
        `${DOCKER_DIR}cassandra/Cassandra-Migration.Dockerfile`,
        `${DOCKER_DIR}cassandra/scripts/autoMigrate.sh`,
        `${DOCKER_DIR}cassandra/scripts/execute-cql.sh`,
        `${DOCKER_DIR}cassandra-cluster.yml`,
        `${DOCKER_DIR}cassandra-migration.yml`,
        `${DOCKER_DIR}cassandra.yml`
    ],

    elasticsearch: [
        `${DOCKER_DIR}elasticsearch.yml`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/search/UserSearchRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/ElasticsearchConfiguration.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/repository/search/UserSearchRepositoryMockConfiguration.java`
    ],

    cucumber: [
        `${TEST_DIR}features/user/user.feature`,
        `${TEST_DIR}features/gitkeep`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/cucumber/stepdefs/UserStepDefs.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/cucumber/stepdefs/StepDefs.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/cucumber/CucumberTest.java`
    ],

    eureka: [
        `${DOCKER_DIR}central-server-config/localhost-config/application.yml`,
        `${DOCKER_DIR}central-server-config/docker-config/application.yml`,
        `${DOCKER_DIR}jhipster-registry.yml`
    ],

    consul: [
        `${DOCKER_DIR}central-server-config/application.yml`,
        `${DOCKER_DIR}consul.yml`,
        `${DOCKER_DIR}config/git2consul.json`
    ]
};

module.exports = expectedFiles;
