const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    eurekaregistry: ['./registry/jhipster-registry.yml', './registry/application-configmap.yml'],
    consulregistry: ['./registry/consul.yml', './registry/consul-config-loader.yml', './registry/application-configmap.yml'],
    jhgate: ['./jhgate/jhgate-deployment.yml', './jhgate/jhgate-mysql.yml', './jhgate/jhgate-service.yml'],
    jhgateingress: ['./jhgate/jhgate-ingress.yml'],
    customnamespace: ['./namespace.yml'],
    jhconsole: [
        './console/jhipster-console.yml',
        './console/jhipster-elasticsearch.yml',
        './console/jhipster-logstash.yml',
        './console/jhipster-dashboard-console.yml',
        './console/jhipster-zipkin.yml'
    ],
    msmysql: ['./msmysql/msmysql-deployment.yml', './msmysql/msmysql-mysql.yml', './msmysql/msmysql-service.yml'],
    mspsql: [
        './mspsql/mspsql-deployment.yml',
        './mspsql/mspsql-postgresql.yml',
        './mspsql/mspsql-service.yml',
        './mspsql/mspsql-elasticsearch.yml'
    ],
    msmongodb: ['./msmongodb/msmongodb-deployment.yml', './msmongodb/msmongodb-mongodb.yml', './msmongodb/msmongodb-service.yml'],
    msmariadb: ['./msmariadb/msmariadb-deployment.yml', './msmariadb/msmariadb-mariadb.yml', './msmariadb/msmariadb-service.yml'],
    msmssqldb: ['./msmssqldb/msmssqldb-deployment.yml', './msmssqldb/msmssqldb-mssql.yml', './msmssqldb/msmssqldb-service.yml'],
    monolith: [
        './samplemysql/samplemysql-deployment.yml',
        './samplemysql/samplemysql-mysql.yml',
        './samplemysql/samplemysql-service.yml',
        './samplemysql/samplemysql-elasticsearch.yml'
    ],
    kafka: [
        './samplekafka/samplekafka-deployment.yml',
        './samplekafka/samplekafka-mysql.yml',
        './samplekafka/samplekafka-service.yml',
        './messagebroker/kafka.yml'
    ],
    prometheusmonit: [
        './monitoring/jhipster-prometheus-crd.yml',
        './monitoring/jhipster-prometheus-cr.yml',
        './monitoring/jhipster-grafana.yml',
        './monitoring/jhipster-grafana-dashboard.yml'
    ],
    jhgategateway: ['./jhgate/jhgate-gateway.yml', './jhgate/jhgate-destination-rule.yml', './jhgate/jhgate-virtual-service.yml'],
    applyScript: ['./kubectl-apply.sh']
};

describe('JHipster Kubernetes Sub Generator', () => {
    describe('only gateway', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway'],
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
            assert.fileContent('./registry/jhipster-registry.yml', /# base64 encoded "meetup"/);
        });
        it('creates expected gateway files and content', () => {
            assert.file(expectedFiles.jhgate);
            assert.fileContent('./jhgate/jhgate-deployment.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('./jhgate/jhgate-deployment.yml', /jhipsternamespace.svc.cluster/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway and mysql microservice', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql'],
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
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('mysql microservice with custom namespace and jhipster-console (with zipkin)', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['02-mysql'],
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
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway and ingress', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway'],
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
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('MySQL and PostgreSQL microservices without gateway', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['02-mysql', '03-psql'],
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
        it("doesn't creates gateway files", () => {
            assert.noFile(expectedFiles.jhgate);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
        });
        it('creates expected psql files', () => {
            assert.file(expectedFiles.mspsql);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway, mysql, psql, mongodb, mariadb, mssql microservices', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb', '11-mssql'],
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
        it('creates expected mssql files', () => {
            assert.file(expectedFiles.msmssqldb);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('monolith application', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: ['08-monolith'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: []
                })
                .on('end', done);
        });
        it("doesn't creates registry files", () => {
            assert.noFile(expectedFiles.eurekaregistry);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.monolith);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('Kafka application', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: ['09-kafka'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: []
                })
                .on('end', done);
        });
        it("doesn't creates registry files", () => {
            assert.noFile(expectedFiles.eurekaregistry);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.kafka);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['02-mysql'],
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
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway with istio routing', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    ingressDomain: 'example.com',
                    clusteredDbApps: [],
                    istio: true
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected service gateway files', () => {
            assert.file(expectedFiles.jhgate);
        });
        it('creates expected routing gateway and istio files', () => {
            assert.file(expectedFiles.jhgategateway);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });
});
