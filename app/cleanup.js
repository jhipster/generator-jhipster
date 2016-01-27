'use strict';

module.exports = {
    cleanupOldFiles: cleanupOldFiles
};

/**
 * Removes files that where generated in previous JHipster versions and therefore needs to be removed
 */
function cleanupOldFiles(generator) {
    if (generator.isJhipsterVersionLessThan('2.27.1')) {
        generator.removefile(generator.JAVA_DIR + 'config/MailConfiguration.java');
        generator.removefile(generator.JAVA_DIR + 'config/metrics/JavaMailHealthIndicator.java');
        if (generator.databaseType == 'sql' || generator.databaseType == 'mongodb') {
            generator.removefolder(generator.JAVA_DIR + 'config/metrics');
        }

        generator.removefile(generator.JAVA_DIR + 'security/_CustomUserDetails.java');
        generator.removefile(generator.JAVA_DIR + 'domain/util/CustomLocalDateSerializer.java');
        generator.removefile(generator.JAVA_DIR + 'domain/util/CustomDateTimeSerializer.java');
        generator.removefile(generator.JAVA_DIR + 'domain/util/CustomDateTimeDeserializer.java');
        generator.removefile(generator.JAVA_DIR + 'domain/util/CustomLocalDateDeserializer.java');
        generator.removefile(generator.JAVA_DIR + 'domain/util/DateToZonedDateTimeConverter.java');
        generator.removefile(generator.JAVA_DIR + 'domain/util/ZonedDateTimeToDateConverter.java');
        generator.removefile(generator.JAVA_DIR + 'domain/util/DateToLocalDateConverter.java');
        generator.removefile(generator.JAVA_DIR + 'domain/util/LocalDateToDateConverter.java');
        generator.removefile(generator.JAVA_DIR + 'domain/util/ISO8601LocalDateDeserializer.java');
        generator.removefolder(generator.JAVA_DIR + 'web/propertyeditors');

        generator.removefile(generator.RESOURCE_DIR + 'logback.xml');

        generator.removefile(generator.WEBAPP_DIR + 'scripts/app/account/logout/logout.js');
        generator.removefile(generator.WEBAPP_DIR + 'scripts/app/account/logout/logout.controller.js');
        generator.removefolder(generator.WEBAPP_DIR + 'scripts/app/account/logout');

        generator.removefile(generator.TEST_DIR + 'config/MongoConfiguration.java');
        generator.removefile(generator.TEST_JS_DIR + 'spec/app/account/health/healthControllerSpec.js');
        generator.removefile(generator.TEST_JS_DIR + 'spec/app/account/login/loginControllerSpec.js');
        generator.removefile(generator.TEST_JS_DIR + 'spec/app/account/password/passwordControllerSpec.js');
        generator.removefile(generator.TEST_JS_DIR + 'spec/app/account/password/passwordDirectiveSpec.js');
        generator.removefile(generator.TEST_JS_DIR + 'spec/app/account/sessions/sessionsControllerSpec.js');
        generator.removefile(generator.TEST_JS_DIR + 'spec/app/account/settings/settingsControllerSpec.js');
        generator.removefile(generator.TEST_JS_DIR + 'spec/components/auth/authServicesSpec.js');

        generator.removefile('docker-compose.yml');
        generator.removefile('docker-compose-prod.yml');
        generator.removefile('Cassandra-Dev.Dockerfile');
        generator.removefile('Cassandra-Prod.Dockerfile');
        generator.removefolder('docker/');

        generator.removefile('gatling.gradle');
        generator.removefile('liquibase.gradle');
        generator.removefile('mapstruct.gradle');
        generator.removefile('profile_dev.gradle');
        generator.removefile('profile_fast.gradle');
        generator.removefile('profile_prod.gradle');
        generator.removefile('sonar.gradle');
        generator.removefile('yeoman.gradle');

        generator.removefile(generator.WEBAPP_DIR + 'scripts/app/main/main.controller.js');
        generator.removefile(generator.WEBAPP_DIR + 'scripts/app/main/main.js');
        generator.removefile(generator.WEBAPP_DIR + 'scripts/app/main/main.html');
        generator.removefolder(generator.WEBAPP_DIR + 'scripts/app/main/');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/en/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/fr/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/ca/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/da/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/de/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/es/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/gl/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/hu/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/it/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/ja/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/ko/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/nl/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/pl/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/pt-br/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/pt-pt/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/ro/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/ru/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/sv/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/ta/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/tr/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/zh-cn/main.json');
        generator.removefile(generator.WEBAPP_DIR + 'i18n/zh-tw/main.json');
    }
}
