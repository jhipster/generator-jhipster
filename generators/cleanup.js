'use strict';

const constants = require('./generator-constants'),
    ANGULAR_DIR = constants.ANGULAR_DIR,
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

module.exports = {
    cleanupOldFiles: cleanupOldFiles,
    cleanupOldServerFiles: cleanupOldServerFiles
};
/**
 * Removes files that where generated in previous JHipster versions and therefore need to be removed
 */
function cleanupOldFiles(generator, javaDir, testDir) {
    if (generator.isJhipsterVersionLessThan('3.2.0')) {
        //removeFile and removeFolder methods should be called here for files and folders to cleanup
        generator.removeFile(ANGULAR_DIR + 'components/form/uib-pager.config.js');
        generator.removeFile(ANGULAR_DIR + 'components/form/uib-pagination.config.js');
    }
}

/**
 * Removes server files that where generated in previous JHipster versions and therefore need to be removed
 */
function cleanupOldServerFiles(generator, javaDir, testDir) {
    if (generator.isJhipsterVersionLessThan('3.5.0')) {
        generator.removeFile(javaDir + 'domain/util/JSR310DateTimeSerializer.java');
        generator.removeFile(javaDir + 'domain/util/JSR310LocalDateDeserializer.java');
    }
    if (generator.isJhipsterVersionLessThan('3.6.0')) {
        generator.removeFile(javaDir + 'config/HerokuDatabaseConfiguration.java');
    }
    if (generator.isJhipsterVersionLessThan('3.8.1')) {
        generator.removeFile(javaDir + 'config/JacksonConfiguration.java');
    }
    if (generator.isJhipsterVersionLessThan('3.10.0')) {
        generator.removeFile(javaDir + 'config/CloudMongoDbConfiguration.java');
        generator.removeFile(javaDir + 'security/CustomAccessDeniedHandler.java');
        generator.removeFile(javaDir + 'web/filter/CsrfCookieGeneratorFilter.java');
    }
    if (generator.isJhipsterVersionLessThan('3.11.0')) {
        generator.removeFile(CLIENT_MAIN_SRC_DIR + 'app/layouts/navbar/active-link.directive.js');
    }
    if (generator.isJhipsterVersionLessThan('3.12.0')) {
        generator.removeFile(javaDir + 'config/hazelcast/HazelcastCacheRegionFactory.java');
        generator.removeFile(javaDir + 'config/hazelcast/package-info.java');
    }
}
