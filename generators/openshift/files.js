
module.exports = {
    writeFiles
};

function writeFiles() {
    return {

        writeDeployments() {
            for (let i = 0; i < this.appConfigs.length; i++) {
                const appName = this.appConfigs[i].baseName.toLowerCase();
                this.app = this.appConfigs[i];
                this.template('_deployment.yml', `${this.directoryPath}/ocp/${appName}/${appName}-deployment.yml`);

                if (this.app.prodDatabaseType !== 'no') {
                    this.template(`db/_${this.app.prodDatabaseType}.yml`, `${this.directoryPath}/ocp/${appName}/${appName}-${this.app.prodDatabaseType}.yml`);
                }
                if (this.app.searchEngine === 'elasticsearch') {
                    this.template('db/_elasticsearch.yml', `${this.directoryPath}/ocp/${appName}/${appName}-elasticsearch.yml`);
                }
                if (this.app.messageBroker === 'kafka') {
                    this.template('db/_kafka.yml', `${this.directoryPath}/ocp/${appName}/${appName}-kafka.yml`);
                }
            }
        },

        writeRegistryFiles() {
            this.template('scc/_scc-config.yml', `${this.directoryPath}/ocp/registry/scc-config.yml`);
            if (this.serviceDiscoveryType === 'eureka') {
                this.template('registry/_jhipster-registry.yml', `${this.directoryPath}/ocp/registry/jhipster-registry.yml`);
                this.template('registry/_application-configmap.yml', `${this.directoryPath}/ocp/registry/application-configmap.yml`);
            } else if (this.serviceDiscoveryType === 'consul') {
                this.template('registry/_consul.yml', `${this.directoryPath}/ocp/registry/consul.yml`);
                this.template('registry/_application-configmap.yml', `${this.directoryPath}/ocp/registry/application-configmap.yml`);
            }
        },

        writeElkFiles() {
            if (this.monitoring !== 'elk') return;

            this.template('monitoring/_jhipster-monitoring.yml', `${this.directoryPath}/ocp/monitoring/jhipster-monitoring.yml`);
        },

        writePrometheusFiles() {
            if (this.monitoring !== 'prometheus') return;

            const appsToMonitor = [];
            for (let i = 0; i < this.appConfigs.length; i++) {
                appsToMonitor.push(`- ${this.appConfigs[i].baseName}:${this.appConfigs[i].serverPort}`);
            }

            this.appsToMonitorList = appsToMonitor.join('\n').replace(/'/g, '');

            this.template('monitoring/_jhipster-metrics.yml', `${this.directoryPath}/ocp/monitoring/jhipster-metrics.yml`);
        },

        writeConfigRunFile() {
            this.template('_apply.sh', `${this.directoryPath}/ocp/ocp-apply.sh`);
        }

    };
}
