/* global describe, beforeEach, it*/
const assert = require('yeoman-assert');
const Generator = require('../generators/generator-base');
const constants = require('../generators/generator-constants');

const DOCKER_DIR = constants.DOCKER_DIR;

module.exports = {
    getFilesForOptions,
    shouldBeV3DockerfileCompatible
};

function getFilesForOptions(files, options, prefix, excludeFiles) {
    const generator = options;
    if (excludeFiles === undefined) {
        return Generator.prototype.writeFilesToDisk(files, generator, true, prefix);
    }
    return Generator.prototype.writeFilesToDisk(files, generator, true, prefix)
        .filter(file => excludeFiles.indexOf(file) === -1);
}

function shouldBeV3DockerfileCompatible(databaseType) {
    it('creates compose file without container_name, external_links, links', () => {
        assert.noFileContent(`${DOCKER_DIR}app.yml`, /container_name:/);
        assert.noFileContent(`${DOCKER_DIR}app.yml`, /external_links:/);
        assert.noFileContent(`${DOCKER_DIR}app.yml`, /links:/);
        assert.noFileContent(`${DOCKER_DIR + databaseType}.yml`, /container_name:/);
        assert.noFileContent(`${DOCKER_DIR + databaseType}.yml`, /external_links:/);
        assert.noFileContent(`${DOCKER_DIR + databaseType}.yml`, /links:/);
    });
}
