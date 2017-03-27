
module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        writeDeployments() {
            for (let i = 0; i < this.appConfigs.length; i++) {
                const appName = this.appConfigs[i].baseName.toLowerCase();
                this.app = this.appConfigs[i];
                this.template('_deployment.yml', `${appName}/${appName}-deployment.yml`);
                this.template('_service.yml', `${appName}/${appName}-service.yml`);

                if (this.app.prodDatabaseType) {
                    this.template(`db/_${this.app.prodDatabaseType}.yml`, `${appName}/${appName}-${this.app.prodDatabaseType}.yml`);
                }
                if (this.app.searchEngine === 'elasticsearch') {
                    this.template('db/_elasticsearch.yml', `${appName}/${appName}-elasticsearch.yml`);
                }
                if (this.app.messageBroker === 'kafka') {
                    this.template('db/_kafka.yml', `${appName}/${appName}-kafka.yml`);
                }
            }
        },

        writeRegistryFiles() {
            if (this.serviceDiscoveryType === 'eureka') {
                this.template('registry/_jhipster-registry.yml', 'registry/jhipster-registry.yml');
                this.template('registry/_application-configmap.yml', 'registry/application-configmap.yml');
            } else if (this.serviceDiscoveryType === 'consul') {
                this.template('registry/_consul.yml', 'registry/consul.yml');
                this.template('registry/_consul-config-loader.yml', 'registry/consul-config-loader.yml');
                this.template('registry/_application-configmap.yml', 'registry/application-configmap.yml');
            }
        }
    };
}
