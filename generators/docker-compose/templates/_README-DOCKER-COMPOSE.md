# JHipster generated Docker-Compose configuration

## Usage

Launch all your infrastructure by running: `docker-compose up -d`.

## Configured docker services
<%_ if (serviceDiscoveryType) { _%>

### Service registry and configuration server:
<%_ } _%>
<%_ if (serviceDiscoveryType === 'eureka') { _%>
- [JHipster Registry](http://localhost:8761)
<%_ } _%>
<%_ if (serviceDiscoveryType === 'consul') { _%>
- [Consul](http://localhost:8500)
<%_ } _%>

### Applications and dependencies:
<%_ for(let i = 0; i < appConfigs.length; i++) { _%>
- <%= appConfigs[i].baseName %> (<%= appConfigs[i].applicationType %> application)
- <%= appConfigs[i].baseName %>'s <%= appConfigs[i].prodDatabaseType %> database
<%_ if (appConfigs[i].searchEngine) { _%>
- <%= appConfigs[i].baseName %>'s <%= appConfigs[i].searchEngine %> search engine
<%_ } _%>
<%_ } _%>

### Additional Services:

<%_ if (monitoring === 'useKafka') { _%>
- Kafka
- Zookeeper
<%_ } _%>
<%_ if (monitoring === 'elk') { _%>
- [JHipster Console](http://localhost:5601)
Once started, it will be necessary to create the index pattern using the UI and start the `jhipster-import-dashboards` container again with: `docker-compose up jhipster-import-dashboards`
- [Zipkin](http://localhost:9400)
<%_ } _%>
<%_ if (monitoring === 'prometheus') { _%>
- [Prometheus server](http://localhost:9090)
- [Prometheus Alertmanager](http://localhost:9093)
- [Grafana](http://localhost:3000)
<%_ } _%>
