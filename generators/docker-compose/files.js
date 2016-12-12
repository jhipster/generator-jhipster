'use strict';

module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        writeDockerCompose: function() {
            this.template('_docker-compose.yml', 'docker-compose.yml');
        },

        writeRegistryFiles: function() {
            if(this.gatewayNb === 0 && this.microserviceNb === 0) return;
            if(this.serviceDiscoveryType === 'eureka'){
                this.template('_jhipster-registry.yml', 'jhipster-registry.yml');
            }
            if(this.serviceDiscoveryType === 'consul'){
                this.template('_consul.yml', 'consul.yml');
                this.copy('consul-conf/_acl_config.json', 'consul-conf/acl_config.json');
            }
            if(this.serviceDiscoveryType){
                this.template('central-server-config/_application.yml', 'central-server-config/application.yml');
            }
        },

        writeKafkaFiles: function() {
            if(!this.useKafka) return;

            this.template('_kafka.yml', 'kafka.yml');
        },

        writeElkFiles: function() {
            if(this.monitoring !== 'elk') return;

            this.copy('_jhipster-console.yml', 'jhipster-console.yml');
            this.copy('log-conf/_logstash.conf', 'log-conf/logstash.conf');
            this.copy('log-data/_.gitignore', 'log-data/.gitignore');
        },

        writePrometheusFiles: function() {
            if(this.monitoring !== 'prometheus') return;

            // Generate a list of target apps to monitor for the prometheus config
            var appsToMonitor = [];
            for(var i = 0; i < this.appConfigs.length; i++) {
                appsToMonitor.push('             - ' + this.appConfigs[i].baseName + '-app:' + this.appConfigs[i].serverPort);
            }

            // Format the application target list as a YAML array
            this.appsToMonitorList = appsToMonitor.join('\n').replace(/\'/g, '');

            this.template('_prometheus.yml', 'prometheus.yml');
            this.template('prometheus-conf/_prometheus.yml', 'prometheus-conf/prometheus.yml');
            this.copy('prometheus-conf/_alert.rules', 'prometheus-conf/alert.rules');
            this.template('alertmanager-conf/_config.yml', 'alertmanager-conf/config.yml');
        }
    };
}
