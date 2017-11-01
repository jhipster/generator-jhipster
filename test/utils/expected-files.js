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
        'gradle/mapstruct.gradle',
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
        `${SERVER_MAIN_RES_DIR}mails/activationEmail.html`,
        `${SERVER_MAIN_RES_DIR}mails/passwordResetEmail.html`,
        `${SERVER_MAIN_RES_DIR}i18n/messages.properties`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/JhipsterApp.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/ApplicationWebXml.java`,
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
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/ThymeleafConfiguration.java`,
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
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/ProfileInfoResourceIntTest.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/TestUtil.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/UserResourceIntTest.java`,
        `${SERVER_TEST_RES_DIR}config/application.yml`,
        `${SERVER_TEST_RES_DIR}logback.xml`,
        '.editorconfig'
    ],

    infinispan: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheFactoryConfiguration.java`
    ],

    gatling: [
        `${TEST_DIR}gatling/conf/gatling.conf`
    ],

    i18nJson: [
        `${CLIENT_MAIN_SRC_DIR}i18n/en/activate.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/audits.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/configuration.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/error.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/gateway.json`,
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
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/gateway.json`,
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
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-delete-dialog.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-delete-dialog.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-detail.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-detail.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-dialog.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-dialog.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.state.js`
    ],

    client: [
        'bower.json',
        'package.json',
        '.bowerrc',
        '.eslintrc.json',
        '.eslintignore',
        'gulpfile.js',
        'gulp/build.js',
        'gulp/config.js',
        'gulp/copy.js',
        'gulp/inject.js',
        'gulp/serve.js',
        'gulp/utils.js',
        `${CLIENT_MAIN_SRC_DIR}404.html`,
        `${CLIENT_MAIN_SRC_DIR}index.html`,
        `${CLIENT_MAIN_SRC_DIR}manifest.webapp`,
        `${CLIENT_MAIN_SRC_DIR}sw.js`,
        `${CLIENT_MAIN_SRC_DIR}content/css/main.css`,
        `${CLIENT_MAIN_SRC_DIR}favicon.ico`,
        `${CLIENT_MAIN_SRC_DIR}robots.txt`,
        `${CLIENT_MAIN_SRC_DIR}swagger-ui/images/throbber.gif`,
        `${CLIENT_MAIN_SRC_DIR}swagger-ui/index.html`,
        `${CLIENT_MAIN_SRC_DIR}app/app.module.js`,
        `${CLIENT_MAIN_SRC_DIR}app/app.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/app.constants.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/config/http.config.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/config/localstorage.config.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/config/alert.config.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/config/translation.config.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/config/translation-storage.provider.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/config/compile.config.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/config/uib-pager.config.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/config/uib-pagination.config.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/handlers/state.handler.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/handlers/translation.handler.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/interceptor/auth-expired.interceptor.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/interceptor/errorhandler.interceptor.js`,
        `${CLIENT_MAIN_SRC_DIR}app/blocks/interceptor/notification.interceptor.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audits.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.modal.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.modal.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.modal.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.modal.html`,
        `${CLIENT_MAIN_SRC_DIR}app/services/auth/auth.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/auth/principal.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/auth/has-authority.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/auth/has-any-authority.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/auth/account.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/auth/activate.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/auth/password.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/auth/password-reset-init.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/auth/password-reset-finish.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/auth/register.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/profiles/page-ribbon.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/profiles/profile.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/form/show-validation.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/language/language.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/language/language.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/language/language.filter.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/language/language.constants.js`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.html`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/active-menu.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/user/user.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/base64.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/parse-links.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/truncate-characters.filter.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/truncate-words.filter.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/date-util.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/error.constants.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/sort.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/sort-by.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/capitalize.filter.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/data-util.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/jhi-item-count.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/util/pagination-util.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/account.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/activate/activate.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/activate/activate.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/activate/activate.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/alert/alert-error.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/alert/alert.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/alert/alert.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/form/maxbytes.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/form/minbytes.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/form/pagination.constants.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/login/login.html`,
        `${CLIENT_MAIN_SRC_DIR}app/components/login/login.service.js`,
        `${CLIENT_MAIN_SRC_DIR}app/components/login/login.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password/password.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password/password.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password/password.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/password/password-strength-bar.directive.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/register/register.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/register/register.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/register/register.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/reset/request/reset.request.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/reset/request/reset.request.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/reset/request/reset.request.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/reset/finish/reset.finish.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/reset/finish/reset.finish.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/reset/finish/reset.finish.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/settings/settings.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/settings/settings.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/account/settings/settings.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/admin.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audits.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audits.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audits.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/docs/docs.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/docs/docs.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.html`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/error/error.html`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/error/accessdenied.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/entity.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/layouts/error/error.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/home/home.html`,
        `${CLIENT_MAIN_SRC_DIR}app/home/home.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/home/home.controller.js`,
        `${CLIENT_TEST_SRC_DIR}karma.conf.js`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/httpBackend.js`,
        `${CLIENT_TEST_SRC_DIR}spec/helpers/module.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/admin/health/health.controller.spec.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/components/login/login.controller.spec.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/password/password.controller.spec.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/password/password-strength-bar.directive.spec.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/settings/settings.controller.spec.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/activate/activate.controller.spec.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/register/register.controller.spec.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/reset/finish/reset.finish.controller.spec.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/reset/request/reset.request.controller.spec.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/services/auth/auth.services.spec.js`,
        `${CLIENT_MAIN_SRC_DIR}content/css/documentation.css`,
        `${CLIENT_MAIN_SRC_DIR}content/images/hipster.png`,
        `${CLIENT_MAIN_SRC_DIR}content/images/logo-jhipster.png`,
        `${CLIENT_MAIN_SRC_DIR}content/images/hipster2x.png`
    ],

    i18n: [
        `${SERVER_MAIN_RES_DIR}i18n/messages_en.properties`,
        `${SERVER_MAIN_RES_DIR}i18n/messages_fr.properties`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/language/language.constants.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/language/language.helper.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/language/find-language-from-key.pipe.ts`
    ],

    i18nRtl: [
        `${SERVER_MAIN_RES_DIR}i18n/messages_en.properties`,
        `${SERVER_MAIN_RES_DIR}i18n/messages_ar_ly.properties`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/ar-ly/global.json`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/language/language.constants.ts`,
        `${CLIENT_MAIN_SRC_DIR}content/css/rtl.css`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/language/language.helper.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/language/find-language-from-key.pipe.ts`
    ],

    socialLogin: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/social/SocialConfiguration.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/SocialUserConnection.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/CustomSocialConnectionRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/CustomSocialUsersConnectionRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/SocialUserConnectionRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/social/CustomSignInAdapter.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/SocialService.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/SocialController.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/repository/CustomSocialUsersConnectionRepositoryIntTest.java`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/service/SocialServiceIntTest.java`
    ],

    session: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/PersistentToken.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/PersistentTokenRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/PersistentTokenRememberMeServices.java`,
        `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/auth/auth-session.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/account/sessions/sessions.component.spec.ts`
    ],

    jwtServer: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/jwt/JWTConfigurer.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/jwt/JWTFilter.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/jwt/TokenProvider.java`
    ],

    jwtClient: [
        `${CLIENT_MAIN_SRC_DIR}app/blocks/interceptor/auth.interceptor.js`,
        `${CLIENT_MAIN_SRC_DIR}app/services/auth/auth.jwt.service.js`
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
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/MicroserviceSecurityConfiguration.java`,
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
        `${DOCKER_DIR}mysql.yml`
    ],

    mariadb: [
        `${DOCKER_DIR}mariadb.yml`
    ],

    mssql: [
        `${DOCKER_DIR}mssql.yml`
    ],

    postgresql: [
        `${DOCKER_DIR}postgresql.yml`
    ],

    mongodb: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/dbmigrations/package-info.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/dbmigrations/InitialSetupMigration.java`,
        `${DOCKER_DIR}mongodb.yml`,
        `${DOCKER_DIR}mongodb-cluster.yml`,
        `${DOCKER_DIR}mongodb/MongoDB.Dockerfile`,
        `${DOCKER_DIR}mongodb/scripts/init_replicaset.js`
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
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/elasticsearch/IndexReinitializer.java`
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
