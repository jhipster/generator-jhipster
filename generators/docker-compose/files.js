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
            if(!this.useElk) return;

            this.copy('_jhipster-console.yml', 'jhipster-console.yml');
            this.copy('log-conf/_logstash.conf', 'log-conf/logstash.conf');
            this.copy('log-data/_.gitignore', 'log-data/.gitignore');
        }
    };
}
