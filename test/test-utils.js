'use strict';

var Generator = require('../generators/generator-base');

module.exports = {
    getFilesForOptions: getFilesForOptions
};

function getFilesForOptions(files, options, prefix) {
    let generator = options;
    return Generator.prototype.writeFilesToDisk(files, generator, true, prefix);
}
