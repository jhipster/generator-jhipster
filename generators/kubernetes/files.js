'use strict';

module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        writeDeployments: function() {
            for (var i = 0; i < this.appConfigs.length; i++) {
                var appName = this.appConfigs[i].baseName.toLowerCase();
                this.app = this.appConfigs[i];
                this.template('_deployment.yml', appName + '/' + appName + '-deployment.yml');
                this.template('_service.yml', appName + '/' + appName + '-service.yml');

                if (this.app.prodDatabaseType) {
                    this.template('db/_' + this.app.prodDatabaseType + '.yml', appName + '/' + appName + '-' + this.app.prodDatabaseType + '.yml');
                }
                if (this.app.searchEngine === 'elasticsearch') {
                    this.template('db/_elasticsearch.yml', appName + '/' + appName + '-' + 'elasticsearch.yml');
                }
            }
        },

        writeRegistryFiles: function() {
            if (this.gatewayNb === 0 && this.microserviceNb === 0) return;
            this.template('_jhipster-registry.yml', 'registry/jhipster-registry.yml');
        }
    };
}
