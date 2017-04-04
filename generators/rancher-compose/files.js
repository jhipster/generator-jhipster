module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        writeRancherCompose() {
            this.template('_rancher-compose.yml', 'rancher-compose.yml');
        },

        writeDockerCompose() {
            this.template('_docker-compose.yml', 'docker-compose.yml');
        },

        writeRegistrySidekickFiles() {
            if (this.serviceDiscoveryType === 'eureka' || this.serviceDiscoveryType === 'consul') {
                this.copy('registry-config-sidekick/Dockerfile', 'registry-config-sidekick/Dockerfile');
                this.template('registry-config-sidekick/_application.yml', 'registry-config-sidekick/application.yml');
            }
        }
    };
}
