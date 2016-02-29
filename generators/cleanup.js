'use strict';

const constants = require('./generator-constants');

module.exports = {
    cleanupOldFiles: cleanupOldFiles
};
/**
 * Removes files that where generated in previous JHipster versions and therefore needs to be removed
 */
function cleanupOldFiles(generator, javaDir, testDir) {
    if (generator.isJhipsterVersionLessThan('2.27.1')) {
        //removeFile and removeFolder methods should be called here for files and folders to cleanup
    }
}
