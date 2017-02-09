'use strict';

const mkdirp = require('mkdirp');

/* Constants use throughout */
const RANCHER_DIR = 'rancher/';

module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        setUpRancherDir() {
            mkdirp(RANCHER_DIR);
        },

        writeRancherCompose: function() {
            this.template('_rancher-compose.yml', RANCHER_DIR + 'rancher-compose.yml');
        },

        writeDockerCompose: function() {
            this.template('_docker-compose.yml', RANCHER_DIR + 'docker-compose.yml');
        }
    };
}
