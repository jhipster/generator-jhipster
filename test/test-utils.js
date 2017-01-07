'use strict';

var Generator = require('../generators/generator-base');

module.exports = {
    getFilesForOptions: getFilesForOptions
};

function getFilesForOptions(files, options, prefix, excludeFiles) {
    let generator = options;
    if (excludeFiles === undefined) {
        return Generator.prototype.writeFilesToDisk(files, generator, true, prefix);
    }
    return Generator.prototype.writeFilesToDisk(files, generator, true, prefix)
        .filter(file => excludeFiles.indexOf(file) === -1);
}
