'use strict';

module.exports = {
    cleanupOldFiles: cleanupOldFiles
};

/**
 * Removes files that where generated in previous JHipster versions and therefore needs to be removed
 */
function cleanupOldFiles(generator, javaDir, testDir, resourceDir, webappDir, testJsDir) {
    if (generator.isJhipsterVersionLessThan('2.27.1')) {
        generator.removefile(javaDir + 'config/MailConfiguration.java');
        generator.removefile(javaDir + 'config/metrics/JavaMailHealthIndicator.java');
        if (generator.databaseType == 'sql' || generator.databaseType == 'mongodb') {
            generator.removefolder(javaDir + 'config/metrics');
        }

        generator.removefile(javaDir + 'security/_CustomUserDetails.java');
        generator.removefile(javaDir + 'domain/util/CustomLocalDateSerializer.java');
        generator.removefile(javaDir + 'domain/util/CustomDateTimeSerializer.java');
        generator.removefile(javaDir + 'domain/util/CustomDateTimeDeserializer.java');
        generator.removefile(javaDir + 'domain/util/CustomLocalDateDeserializer.java');
        generator.removefile(javaDir + 'domain/util/DateToZonedDateTimeConverter.java');
        generator.removefile(javaDir + 'domain/util/ZonedDateTimeToDateConverter.java');
        generator.removefile(javaDir + 'domain/util/DateToLocalDateConverter.java');
        generator.removefile(javaDir + 'domain/util/LocalDateToDateConverter.java');
        generator.removefile(javaDir + 'domain/util/ISO8601LocalDateDeserializer.java');
        generator.removefolder(javaDir + 'web/propertyeditors');

        generator.removefile(resourceDir + 'logback.xml');

        generator.removefile(webappDir + 'scripts/app/account/logout/logout.js');
        generator.removefile(webappDir + 'scripts/app/account/logout/logout.controller.js');
        generator.removefolder(webappDir + 'scripts/app/account/logout');

        generator.removefile(testDir + 'config/MongoConfiguration.java');
        generator.removefile(testJsDir + 'spec/app/account/health/healthControllerSpec.js');
        generator.removefile(testJsDir + 'spec/app/account/login/loginControllerSpec.js');
        generator.removefile(testJsDir + 'spec/app/account/password/passwordControllerSpec.js');
        generator.removefile(testJsDir + 'spec/app/account/password/passwordDirectiveSpec.js');
        generator.removefile(testJsDir + 'spec/app/account/sessions/sessionsControllerSpec.js');
        generator.removefile(testJsDir + 'spec/app/account/settings/settingsControllerSpec.js');
        generator.removefile(testJsDir + 'spec/components/auth/authServicesSpec.js');

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

        generator.removefile(webappDir + 'scripts/app/main/main.controller.js');
        generator.removefile(webappDir + 'scripts/app/main/main.js');
        generator.removefile(webappDir + 'scripts/app/main/main.html');
        generator.removefolder(webappDir + 'scripts/app/main/');
        generator.removefile(webappDir + 'i18n/en/main.json');
        generator.removefile(webappDir + 'i18n/fr/main.json');
        generator.removefile(webappDir + 'i18n/ca/main.json');
        generator.removefile(webappDir + 'i18n/da/main.json');
        generator.removefile(webappDir + 'i18n/de/main.json');
        generator.removefile(webappDir + 'i18n/es/main.json');
        generator.removefile(webappDir + 'i18n/gl/main.json');
        generator.removefile(webappDir + 'i18n/hu/main.json');
        generator.removefile(webappDir + 'i18n/it/main.json');
        generator.removefile(webappDir + 'i18n/ja/main.json');
        generator.removefile(webappDir + 'i18n/ko/main.json');
        generator.removefile(webappDir + 'i18n/nl/main.json');
        generator.removefile(webappDir + 'i18n/pl/main.json');
        generator.removefile(webappDir + 'i18n/pt-br/main.json');
        generator.removefile(webappDir + 'i18n/pt-pt/main.json');
        generator.removefile(webappDir + 'i18n/ro/main.json');
        generator.removefile(webappDir + 'i18n/ru/main.json');
        generator.removefile(webappDir + 'i18n/sv/main.json');
        generator.removefile(webappDir + 'i18n/ta/main.json');
        generator.removefile(webappDir + 'i18n/tr/main.json');
        generator.removefile(webappDir + 'i18n/zh-cn/main.json');
        generator.removefile(webappDir + 'i18n/zh-tw/main.json');
    }
}
