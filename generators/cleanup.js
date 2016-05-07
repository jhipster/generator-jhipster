'use strict';

const constants = require('./generator-constants'),
    ANGULAR_DIR = constants.ANGULAR_DIR;

module.exports = {
    cleanupOldFiles: cleanupOldFiles
};
/**
 * Removes files that where generated in previous JHipster versions and therefore needs to be removed
 */
function cleanupOldFiles(generator, javaDir, testDir) {
    if (generator.isJhipsterVersionLessThan('3.1.1')) {
        //removeFile and removeFolder methods should be called here for files and folders to cleanup
        generator.removeFile(ANGULAR_DIR + 'components/form/uib-pager.config.js');
        generator.removeFile(ANGULAR_DIR + 'components/form/uib-pagination.config.js');
    }
}
