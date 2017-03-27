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
        },

        writeRegistrySidekickFiles: function() {
            if (this.serviceDiscoveryType === 'eureka' || this.serviceDiscoveryType === 'consul') {
                this.copy('registry-config-sidekick/Dockerfile', 'registry-config-sidekick/Dockerfile');
                this.template('registry-config-sidekick/_application.yml', 'registry-config-sidekick/application.yml');
            }
        }
    };
}
