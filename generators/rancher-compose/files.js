'use strict';

module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        writeRancherCompose: function() {
            this.template('_rancher-compose.yml','rancher-compose.yml');
        },

        writeDockerCompose: function() {
            this.template('_docker-compose.yml', 'docker-compose.yml');
        }
    };
}
