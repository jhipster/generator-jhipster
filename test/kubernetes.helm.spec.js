const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    csvcfiles: ['./csvc-pack/Chart.yaml', './csvc-pack/requirements.yaml', './csvc-pack/values.yaml', './csvc-pack/templates/_helpers.tpl'],
    eurekaregistry: ['./csvc-pack/templates/jhipster-registry.yaml', './csvc-pack/templates/application-configmap.yaml'],
    consulregistry: [
        './csvc-pack/templates/consul.yaml',
        './csvc-pack/templates/consul-config-loader.yaml',
        './csvc-pack/templates/application-configmap.yaml'
    ],
    jhgate: [
        './jhgate-pack/templates/jhgate-deployment.yaml',
        './jhgate-pack/templates/jhgate-service.yaml',
        './jhgate-pack/Chart.yaml',
        './jhgate-pack/requirements.yaml',
        './jhgate-pack/values.yaml',
        './jhgate-pack/templates/_helpers.tpl'
    ],
    jhgateingress: ['./jhgate-pack/templates/jhgate-ingress.yaml'],
    customnamespace: ['./namespace.yaml'],
    jhconsole: [
        './csvc-pack/templates/jhipster-console.yaml',
        './csvc-pack/templates/jhipster-logstash.yaml',
        './csvc-pack/templates/jhipster-dashboard-console.yaml',
        './csvc-pack/templates/jhipster-zipkin.yaml'
    ],
    msmysql: [
        './msmysql-pack/Chart.yaml',
        './msmysql-pack/requirements.yaml',
        './msmysql-pack/values.yaml',
        './msmysql-pack/templates/_helpers.tpl',
        './msmysql-pack/templates/msmysql-deployment.yaml',
        './msmysql-pack/templates/msmysql-service.yaml'
    ],
    mspsql: [
        './mspsql-pack/Chart.yaml',
        './mspsql-pack/requirements.yaml',
        './mspsql-pack/values.yaml',
        './mspsql-pack/templates/_helpers.tpl',
        './mspsql-pack/templates/mspsql-deployment.yaml',
        './mspsql-pack/templates/mspsql-service.yaml'
    ],
    msmongodb: [
        './msmongodb-pack/Chart.yaml',
        './msmongodb-pack/requirements.yaml',
        './msmongodb-pack/values.yaml',
        './msmongodb-pack/templates/_helpers.tpl',
        './msmongodb-pack/templates/msmongodb-deployment.yaml',
        './msmongodb-pack/templates/msmongodb-service.yaml'
    ],
    msmariadb: [
        './msmariadb-pack/Chart.yaml',
        './msmariadb-pack/requirements.yaml',
        './msmariadb-pack/values.yaml',
        './msmariadb-pack/templates/_helpers.tpl',
        './msmariadb-pack/templates/msmariadb-deployment.yaml',
        './msmariadb-pack/templates/msmariadb-service.yaml'
    ],
    monolith: [
        './samplemysql-pack/Chart.yaml',
        './samplemysql-pack/requirements.yaml',
        './samplemysql-pack/values.yaml',
        './samplemysql-pack/templates/_helpers.tpl',
        './samplemysql-pack/templates/samplemysql-deployment.yaml',
        './samplemysql-pack/templates/samplemysql-service.yaml',
        './samplemysql-pack/templates/samplemysql-elasticsearch.yaml'
    ],
    kafka: ['./samplekafka-pack/templates/samplekafka-deployment.yaml', './samplekafka-pack/templates/samplekafka-service.yaml'],
    jhgategateway: [
        './jhgate-pack/templates/jhgate-gateway.yaml',
        './jhgate-pack/templates/jhgate-destination-rule.yaml',
        './jhgate-pack/templates/jhgate-virtual-service.yaml'
    ],
    applyScript: ['./helm-apply.sh', './helm-upgrade.sh'],
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
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it('creates expected registry files and content', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected gateway files and content', () => {
            assert.file(expectedFiles.jhgate);
            assert.fileContent('./jhgate-pack/requirements.yaml', /name: mysql/);
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
                    clusteredDbApps: [],
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
            assert.fileContent('./msmysql-pack/requirements.yaml', /name: mysql/);
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
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
            assert.fileContent('./msmysql-pack/requirements.yaml', /name: mysql/);
        });
        it('creates expected jhipster-console files', () => {
            assert.file(expectedFiles.csvcfiles);
            assert.file(expectedFiles.jhconsole);
            assert.fileContent('./csvc-pack/requirements.yaml', /name: elasticsearch/);
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
                    clusteredDbApps: [],
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
            assert.fileContent('./jhgate-pack/requirements.yaml', /name: mysql/);
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
                    clusteredDbApps: [],
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
            assert.fileContent('./msmysql-pack/requirements.yaml', /name: mysql/);
        });
        it('creates expected psql files', () => {
            assert.file(expectedFiles.mspsql);
            assert.fileContent('./mspsql-pack/requirements.yaml', /name: postgresql/);
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
                    clusteredDbApps: [],
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
            assert.fileContent('./msmysql-pack/requirements.yaml', /name: mysql/);
        });
        it('creates expected psql files', () => {
            assert.file(expectedFiles.mspsql);
            assert.fileContent('./mspsql-pack/requirements.yaml', /name: postgresql/);
        });
        it('creates expected mongodb files', () => {
            assert.file(expectedFiles.msmongodb);
            assert.fileContent('./msmongodb-pack/requirements.yaml', /name: mongodb-replicaset/);
        });
        it('creates expected mariadb files', () => {
            assert.file(expectedFiles.msmariadb);
            assert.fileContent('./msmariadb-pack/requirements.yaml', /name: mariadb/);
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
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it("doesn't creates registry files", () => {
            assert.noFile(expectedFiles.eurekaregistry);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.monolith);
            assert.fileContent('./samplemysql-pack/requirements.yaml', /name: mysql/);
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
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.csvcfiles);
            assert.file(expectedFiles.kafka);
            assert.fileContent('./csvc-pack/requirements.yaml', /name: kafka/);
            assert.fileContent('./samplekafka-pack/requirements.yaml', /name: mysql/);
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
                    kubernetesServiceType: 'LoadBalancer',
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
            assert.fileContent('./msmysql-pack/requirements.yaml', /name: mysql/);
        });
        it('creates expected prometheus files', () => {
            assert.file(expectedFiles.csvcfiles);
            assert.fileContent('./csvc-pack/requirements.yaml', /name: prometheus/);
            assert.fileContent('./csvc-pack/requirements.yaml', /name: grafana/);
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
                    istio: true,
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
