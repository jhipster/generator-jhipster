'use strict';

var Generator = require('../generators/generator-base');

module.exports = {
    getFilesForOptions: getFilesForOptions
};

function getFilesForOptions(files, options) {
    let generator = options;
    return Generator.prototype.writeFilesToDisk(files, generator, true);
}
