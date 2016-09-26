'use strict';

const constants = require('./generator-constants'),
    ANGULAR_DIR = constants.ANGULAR_DIR;

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

}
