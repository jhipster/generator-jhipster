/* global describe, beforeEach, it */


const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    eurekaregistry: [
        './k8s/registry/jhipster-registry.yml',
        './k8s/registry/application-configmap.yml'
    ],
    consulregistry: [
        './k8s/registry/consul.yml',
        './k8s/registry/consul-config-loader.yml',
        './k8s/registry/application-configmap.yml'
    ],
    jhgate: [
        './k8s/jhgate/jhgate-deployment.yml',
        './k8s/jhgate/jhgate-mysql.yml',
        './k8s/jhgate/jhgate-service.yml'
    ],
    jhgateingress: [
        './k8s/jhgate/jhgate-deployment.yml',
        './k8s/jhgate/jhgate-mysql.yml',
        './k8s/jhgate/jhgate-service.yml',
        './k8s/jhgate/jhgate-ingress.yml'
    ],
    customnamespace: [
        './k8s/namespace.yml'
    ],
    jhconsole: [
        './k8s/console/jhipster-console.yml',
        './k8s/console/jhipster-elasticsearch.yml',
        './k8s/console/jhipster-logstash.yml',
        './k8s/console/jhipster-dashboard-console.yml',
        './k8s/console/jhipster-zipkin.yml'
    ],
    msmysql: [
        './k8s/msmysql/msmysql-deployment.yml',
        './k8s/msmysql/msmysql-mysql.yml',
        './k8s/msmysql/msmysql-service.yml'
    ],
    mspsql: [
        './k8s/mspsql/mspsql-deployment.yml',
        './k8s/mspsql/mspsql-postgresql.yml',
        './k8s/mspsql/mspsql-service.yml',
        './k8s/mspsql/mspsql-elasticsearch.yml'
    ],
    msmongodb: [
        './k8s/msmongodb/msmongodb-deployment.yml',
        './k8s/msmongodb/msmongodb-mongodb.yml',
        './k8s/msmongodb/msmongodb-service.yml'
    ],
    msmariadb: [
        './k8s/msmariadb/msmariadb-deployment.yml',
        './k8s/msmariadb/msmariadb-mariadb.yml',
        './k8s/msmariadb/msmariadb-service.yml'
    ],
    monolith: [
        './k8s/samplemysql/samplemysql-deployment.yml',
        './k8s/samplemysql/samplemysql-mysql.yml',
        './k8s/samplemysql/samplemysql-service.yml',
        './k8s/samplemysql/samplemysql-elasticsearch.yml'
    ],
    kafka: [
        './k8s/samplekafka/samplekafka-deployment.yml',
        './k8s/samplekafka/samplekafka-mysql.yml',
        './k8s/samplekafka/samplekafka-service.yml',
        './k8s/messagebroker/kafka.yml'
    ],
    prometheusmonit: [
        './k8s/monitoring/jhipster-prometheus-crd.yml',
        './k8s/monitoring/jhipster-prometheus-cr.yml',
        './k8s/monitoring/jhipster-grafana.yml',
        './k8s/monitoring/jhipster-grafana-dashboard.yml'
    ]
};

describe('JHipster Kubernetes Sub Generator', () => {
    describe('only gateway', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway'
                    ],
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'jhipsternamespace',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: []
                })
                .on('end', done);
        });
        it('creates expected registry files and content', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.fileContent('./k8s/registry/jhipster-registry.yml', /# base64 encoded "meetup"/);
        });
        it('creates expected gateway files and content', () => {
            assert.file(expectedFiles.jhgate);
            assert.fileContent('./k8s/jhgate/jhgate-deployment.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('./k8s/jhgate/jhgate-deployment.yml', /jhipsternamespace.svc.cluster/);
        });
    });

    describe('gateway and mysql microservice', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway',
                        '02-mysql'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: []
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected gateway files', () => {
            assert.file(expectedFiles.jhgate);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
        });
    });

    describe('mysql microservice with custom namespace and jhipster-console (with zipkin)', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '02-mysql'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'mynamespace',
                    monitoring: 'elk',
                    jhipsterConsole: true,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: []
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
        });
        it('creates expected jhipster-console files', () => {
            assert.file(expectedFiles.jhconsole);
        });
        it('creates expected namespace file', () => {
            assert.file(expectedFiles.customnamespace);
        });
    });

    describe('gateway and ingress', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    kubernetesServiceType: 'Ingress',
                    ingressDomain: 'example.com',
                    clusteredDbApps: []
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected gateway files', () => {
            assert.file(expectedFiles.jhgate);
        });
        it('creates expected ingress files', () => {
            assert.file(expectedFiles.jhgateingress);
        });
    });

    describe('MySQL and PostgreSQL microservices without gateway', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '02-mysql',
                        '03-psql'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: []
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('doesn\'t creates gateway files', () => {
            assert.noFile(expectedFiles.jhgate);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
        });
        it('creates expected psql files', () => {
            assert.file(expectedFiles.mspsql);
        });
    });

    describe('gateway, mysql, psql, mongodb, mariadb microservices', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway',
                        '02-mysql',
                        '03-psql',
                        '04-mongo',
                        '07-mariadb'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: []
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected gateway files', () => {
            assert.file(expectedFiles.jhgate);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
        });
        it('creates expected psql files', () => {
            assert.file(expectedFiles.mspsql);
        });
        it('creates expected mongodb files', () => {
            assert.file(expectedFiles.msmongodb);
        });
        it('creates expected mariadb files', () => {
            assert.file(expectedFiles.msmariadb);
        });
    });

    describe('monolith application', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: [
                        '08-monolith'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: []
                })
                .on('end', done);
        });
        it('doesn\'t creates registry files', () => {
            assert.noFile(expectedFiles.eurekaregistry);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.monolith);
        });
    });

    describe('Kafka application', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: [
                        '09-kafka'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: []
                })
                .on('end', done);
        });
        it('doesn\'t creates registry files', () => {
            assert.noFile(expectedFiles.eurekaregistry);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.kafka);
        });
    });

    describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '02-mysql'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'mynamespace',
                    monitoring: 'prometheus',
                    kubernetesServiceType: 'LoadBalancer'

                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
        });
        it('creates expected prometheus files', () => {
            assert.file(expectedFiles.prometheusmonit);
        });
        it('creates expected namespace file', () => {
            assert.file(expectedFiles.customnamespace);
        });
    });
});
