const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    csvcfiles: ['./csvc/Chart.yaml', './csvc/requirements.yaml', './csvc/values.yaml', './csvc/templates/_helpers.tpl'],
    eurekaregistry: ['./csvc/templates/jhipster-registry.yaml', './csvc/templates/application-configmap.yaml'],
    consulregistry: [
        './csvc/templates/consul.yaml',
        './csvc/templates/consul-config-loader.yaml',
        './csvc/templates/application-configmap.yaml'
    ],
    jhgate: [
        './jhgate/templates/jhgate-deployment.yaml',
        './jhgate/templates/jhgate-service.yaml',
        './jhgate/Chart.yaml',
        './jhgate/requirements.yaml',
        './jhgate/values.yaml',
        './jhgate/templates/_helpers.tpl'
    ],
    jhgateingress: ['./jhgate/templates/jhgate-ingress.yaml'],
    customnamespace: ['./namespace.yaml'],
    jhconsole: [
        './csvc/templates/jhipster-console.yaml',
        './csvc/templates/jhipster-logstash.yaml',
        './csvc/templates/jhipster-dashboard-console.yaml',
        './csvc/templates/jhipster-zipkin.yaml'
    ],
    msmysql: [
        './msmysql/Chart.yaml',
        './msmysql/requirements.yaml',
        './msmysql/values.yaml',
        './msmysql/templates/_helpers.tpl',
        './msmysql/templates/msmysql-deployment.yaml',
        './msmysql/templates/msmysql-service.yaml'
    ],
    mspsql: [
        './mspsql/Chart.yaml',
        './mspsql/requirements.yaml',
        './mspsql/values.yaml',
        './mspsql/templates/_helpers.tpl',
        './mspsql/templates/mspsql-deployment.yaml',
        './mspsql/templates/mspsql-service.yaml'
    ],
    msmongodb: [
        './msmongodb/Chart.yaml',
        './msmongodb/requirements.yaml',
        './msmongodb/values.yaml',
        './msmongodb/templates/_helpers.tpl',
        './msmongodb/templates/msmongodb-deployment.yaml',
        './msmongodb/templates/msmongodb-service.yaml'
    ],
    msmariadb: [
        './msmariadb/Chart.yaml',
        './msmariadb/requirements.yaml',
        './msmariadb/values.yaml',
        './msmariadb/templates/_helpers.tpl',
        './msmariadb/templates/msmariadb-deployment.yaml',
        './msmariadb/templates/msmariadb-service.yaml'
    ],
    monolith: [
        './samplemysql/Chart.yaml',
        './samplemysql/requirements.yaml',
        './samplemysql/values.yaml',
        './samplemysql/templates/_helpers.tpl',
        './samplemysql/templates/samplemysql-deployment.yaml',
        './samplemysql/templates/samplemysql-service.yaml',
        './samplemysql/templates/samplemysql-elasticsearch.yaml'
    ],
    kafka: ['./samplekafka/templates/samplekafka-deployment.yaml', './samplekafka/templates/samplekafka-service.yaml'],
    jhgategateway: [
        './jhgate/templates/jhgate-gateway.yaml',
        './jhgate/templates/jhgate-destination-rule.yaml',
        './jhgate/templates/jhgate-virtual-service.yaml'
    ],
    applyScript: ['./helm-apply.sh', './helm-upgrade.sh']
};

describe('JHipster Kubernetes Helm Sub Generator', () => {
    describe('only gateway', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
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
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected gateway files and content', () => {
            assert.file(expectedFiles.jhgate);
            assert.fileContent('./jhgate/requirements.yaml', /name: mysql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway and mysql microservice', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
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
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected gateway files', () => {
            assert.file(expectedFiles.jhgate);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
            assert.fileContent('./msmysql/requirements.yaml', /name: mysql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('mysql microservice with custom namespace and jhipster-console (with zipkin)', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
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
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
            assert.fileContent('./msmysql/requirements.yaml', /name: mysql/);
        });
        it('creates expected jhipster-console files', () => {
            assert.file(expectedFiles.csvcfiles);
            assert.file(expectedFiles.jhconsole);
            assert.fileContent('./csvc/requirements.yaml', /name: elasticsearch/);
        });
        it('creates expected namespace file', () => {
            assert.file(expectedFiles.customnamespace);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway and ingress', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
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
                    istio: false,
                    kubernetesServiceType: 'Ingress',
                    ingressType: 'gke',
                    ingressDomain: 'example.com',
                    clusteredDbApps: []
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected gateway files', () => {
            assert.file(expectedFiles.jhgate);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected ingress files', () => {
            assert.file(expectedFiles.jhgate);
            assert.file(expectedFiles.csvcfiles);
            assert.file(expectedFiles.jhgateingress);
            assert.fileContent('./jhgate/requirements.yaml', /name: mysql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('MySQL and PostgreSQL microservices without gateway', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
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
            assert.file(expectedFiles.csvcfiles);
        });
        it("doesn't creates gateway files", () => {
            assert.noFile(expectedFiles.jhgate);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
            assert.fileContent('./msmysql/requirements.yaml', /name: mysql/);
        });
        it('creates expected psql files', () => {
            assert.file(expectedFiles.mspsql);
            assert.fileContent('./mspsql/requirements.yaml', /name: postgresql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway, mysql, psql, mongodb, mariadb microservices', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb'],
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
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected gateway files', () => {
            assert.file(expectedFiles.jhgate);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
            assert.fileContent('./msmysql/requirements.yaml', /name: mysql/);
        });
        it('creates expected psql files', () => {
            assert.file(expectedFiles.mspsql);
            assert.fileContent('./mspsql/requirements.yaml', /name: postgresql/);
        });
        it('creates expected mongodb files', () => {
            assert.file(expectedFiles.msmongodb);
            assert.fileContent('./msmongodb/requirements.yaml', /name: mongodb-replicaset/);
        });
        it('creates expected mariadb files', () => {
            assert.file(expectedFiles.msmariadb);
            assert.fileContent('./msmariadb/requirements.yaml', /name: mariadb/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('monolith application', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
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
            assert.fileContent('./samplemysql/requirements.yaml', /name: mysql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('Kafka application', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
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
        it('creates expected default files', () => {
            assert.file(expectedFiles.csvcfiles);
            assert.file(expectedFiles.kafka);
            assert.fileContent('./csvc/requirements.yaml', /name: kafka/);
            assert.fileContent('./samplekafka/requirements.yaml', /name: mysql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
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
            assert.fileContent('./msmysql/requirements.yaml', /name: mysql/);
        });
        it('creates expected prometheus files', () => {
            assert.file(expectedFiles.csvcfiles);
            assert.fileContent('./csvc/requirements.yaml', /name: prometheus/);
            assert.fileContent('./csvc/requirements.yaml', /name: grafana/);
        });
        it('creates expected namespace file', () => {
            assert.file(expectedFiles.customnamespace);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway with istio', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
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
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected service gateway files', () => {
            assert.file(expectedFiles.jhgate);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected routing gateway and istio files', () => {
            assert.file(expectedFiles.jhgategateway);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });
});
