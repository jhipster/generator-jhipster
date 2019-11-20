const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    eurekaregistry: ['./registry/jhipster-registry.yml', './registry/application-configmap.yml'],
    consulregistry: ['./registry/consul.yml', './registry/consul-config-loader.yml', './registry/application-configmap.yml'],
    jhgate: ['./jhgate/jhgate-mysql.yml', './jhgate/jhgate-service.yml'],
    jhgateingress: ['./jhgate/jhgate-ingress.yml'],
    customnamespace: ['./namespace.yml'],
    jhconsole: [
        './console/jhipster-console.yml',
        './console/jhipster-elasticsearch.yml',
        './console/jhipster-logstash.yml',
        './console/jhipster-dashboard-console.yml',
        './console/jhipster-zipkin.yml'
    ],
    msmysql: ['./msmysql/msmysql-service.yml', './msmysql/msmysql-mysql.yml'],
    mspsql: [
        './mspsql/mspsql-service.yml',
        './mspsql/mspsql-postgresql.yml',
        './mspsql/mspsql-service.yml',
        './mspsql/mspsql-elasticsearch.yml'
    ],
    msmongodb: ['./msmongodb/msmongodb-service.yml', './msmongodb/msmongodb-mongodb.yml'],
    msmariadb: ['./msmariadb/msmariadb-service.yml', './msmariadb/msmariadb-mariadb.yml'],
    msmssqldb: ['./msmssqldb/msmssqldb-service.yml', './msmssqldb/msmssqldb-mssql.yml'],
    prometheusmonit: [
        './monitoring/jhipster-prometheus-crd.yml',
        './monitoring/jhipster-prometheus-cr.yml',
        './monitoring/jhipster-grafana.yml',
        './monitoring/jhipster-grafana-dashboard.yml'
    ],
    jhgategateway: ['./jhgate/jhgate-gateway.yml', './jhgate/jhgate-destination-rule.yml', './jhgate/jhgate-virtual-service.yml'],
    applyScript: ['./kubectl-knative-apply.sh']
};

const helmExpectedFiles = {
    csvcfiles: ['./csvc/Chart.yml', './csvc/requirements.yml', './csvc/values.yml', './csvc/templates/_helpers.tpl'],
    eurekaregistry: ['./csvc/templates/jhipster-registry.yml', './csvc/templates/application-configmap.yml'],
    consulregistry: [
        './csvc/templates/consul.yml',
        './csvc/templates/consul-config-loader.yml',
        './csvc/templates/application-configmap.yml'
    ],
    jhgate: [
        './jhgate/templates/jhgate-service.yml',
        './jhgate/Chart.yml',
        './jhgate/requirements.yml',
        './jhgate/values.yml',
        './jhgate/templates/_helpers.tpl'
    ],
    customnamespace: ['./namespace.yml'],
    jhconsole: [
        './csvc/templates/jhipster-console.yml',
        './csvc/templates/jhipster-logstash.yml',
        './csvc/templates/jhipster-dashboard-console.yml',
        './csvc/templates/jhipster-zipkin.yml'
    ],
    msmysql: [
        './msmysql/Chart.yml',
        './msmysql/requirements.yml',
        './msmysql/values.yml',
        './msmysql/templates/_helpers.tpl',
        './msmysql/templates/msmysql-service.yml'
    ],
    mspsql: [
        './mspsql/Chart.yml',
        './mspsql/requirements.yml',
        './mspsql/values.yml',
        './mspsql/templates/_helpers.tpl',
        './mspsql/templates/mspsql-service.yml'
    ],
    msmongodb: [
        './msmongodb/Chart.yml',
        './msmongodb/requirements.yml',
        './msmongodb/values.yml',
        './msmongodb/templates/_helpers.tpl',
        './msmongodb/templates/msmongodb-service.yml',
        './msmongodb/templates/msmongodb-service.yml'
    ],
    msmariadb: [
        './msmariadb/Chart.yml',
        './msmariadb/requirements.yml',
        './msmariadb/values.yml',
        './msmariadb/templates/_helpers.tpl',
        './msmariadb/templates/msmariadb-service.yml',
        './msmariadb/templates/msmariadb-service.yml'
    ],
    kafka: ['./samplekafka/templates/samplekafka-service.yml', './samplekafka/templates/samplekafka-service.yml'],
    jhgategateway: [
        './jhgate/templates/jhgate-gateway.yml',
        './jhgate/templates/jhgate-destination-rule.yml',
        './jhgate/templates/jhgate-virtual-service.yml'
    ],
    applyScript: ['./helm-knative-apply.sh', './helm-knative-upgrade.sh']
};

describe('JHipster Knative Sub Generator', () => {
    describe('Using K8s generator type', () => {
        describe('only gateway', () => {
            before(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        clusteredDbApps: [],
                        generatorType: 'k8s',
                        istio: true
                    })
                    .on('end', done);
            });
            it('creates expected registry files and content', () => {
                assert.file(expectedFiles.eurekaregistry);
                assert.fileContent('./registry/jhipster-registry.yml', /# base64 encoded "meetup"/);
            });
            it('creates expected gateway files and content', () => {
                assert.file(expectedFiles.jhgate);
                // assert.fileContent('./jhgate/jhgate-service.yml', /image: jhipsterrepository\/jhgate/);
            });
            it('create the apply script', () => {
                assert.file(expectedFiles.applyScript);
            });
        });

        describe('gateway and mysql microservice', () => {
            before(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        clusteredDbApps: [],
                        generatorType: 'k8s',
                        istio: true
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
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        clusteredDbApps: [],
                        generatorType: 'k8s',
                        istio: true
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
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        clusteredDbApps: [],
                        generatorType: 'k8s',
                        istio: true
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
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        clusteredDbApps: [],
                        generatorType: 'k8s',
                        istio: true
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
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        clusteredDbApps: [],
                        generatorType: 'k8s',
                        istio: true
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

        describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
            before(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        generatorType: 'k8s',
                        istio: true
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

        describe('gateway with istio routing files', () => {
            before(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        generatorType: 'k8s',
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

    describe('Using Helm generator type', () => {
        describe('only gateway', () => {
            beforeEach(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        clusteredDbApps: [],
                        generatorType: 'helm',
                        istio: true
                    })
                    .on('end', done);
            });
            it('creates expected registry files and content', () => {
                assert.file(helmExpectedFiles.eurekaregistry);
                assert.file(helmExpectedFiles.csvcfiles);
            });
            it('creates expected gateway files and content', () => {
                assert.file(helmExpectedFiles.jhgate);
                assert.fileContent('./jhgate/requirements.yml', /name: mysql/);
            });
            it('create the apply script', () => {
                assert.file(helmExpectedFiles.applyScript);
            });
        });

        describe('gateway and mysql microservice', () => {
            beforeEach(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        clusteredDbApps: [],
                        generatorType: 'helm',
                        istio: true
                    })
                    .on('end', done);
            });
            it('creates expected registry files', () => {
                assert.file(helmExpectedFiles.eurekaregistry);
                assert.file(helmExpectedFiles.csvcfiles);
            });
            it('creates expected gateway files', () => {
                assert.file(helmExpectedFiles.jhgate);
            });
            it('creates expected mysql files', () => {
                assert.file(helmExpectedFiles.msmysql);
                assert.fileContent('./msmysql/requirements.yml', /name: mysql/);
            });
            it('create the apply script', () => {
                assert.file(helmExpectedFiles.applyScript);
            });
        });

        describe('mysql microservice with custom namespace and jhipster-console (with zipkin)', () => {
            beforeEach(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        clusteredDbApps: [],
                        generatorType: 'helm',
                        istio: true
                    })
                    .on('end', done);
            });
            it('creates expected registry files', () => {
                assert.file(helmExpectedFiles.eurekaregistry);
                assert.file(helmExpectedFiles.csvcfiles);
            });
            it('creates expected mysql files', () => {
                assert.file(helmExpectedFiles.msmysql);
                assert.fileContent('./msmysql/requirements.yml', /name: mysql/);
            });
            it('creates expected jhipster-console files', () => {
                assert.file(helmExpectedFiles.csvcfiles);
                assert.file(helmExpectedFiles.jhconsole);
                assert.fileContent('./csvc/requirements.yml', /name: elasticsearch/);
            });
            it('creates expected namespace file', () => {
                assert.file(helmExpectedFiles.customnamespace);
            });
            it('create the apply script', () => {
                assert.file(helmExpectedFiles.applyScript);
            });
        });

        describe('gateway and ingress', () => {
            beforeEach(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        ingressType: 'gke',
                        ingressDomain: 'example.com',
                        clusteredDbApps: [],
                        generatorType: 'helm',
                        istio: true
                    })
                    .on('end', done);
            });
            it('creates expected registry files', () => {
                assert.file(helmExpectedFiles.eurekaregistry);
                assert.file(helmExpectedFiles.csvcfiles);
            });
            it('creates expected gateway files', () => {
                assert.file(helmExpectedFiles.jhgate);
                assert.file(helmExpectedFiles.csvcfiles);
            });
            it('creates expected ingress files', () => {
                assert.file(helmExpectedFiles.jhgate);
                assert.file(helmExpectedFiles.csvcfiles);
                assert.fileContent('./jhgate/requirements.yml', /name: mysql/);
            });
            it('create the apply script', () => {
                assert.file(helmExpectedFiles.applyScript);
            });
        });

        describe('MySQL and PostgreSQL microservices without gateway', () => {
            beforeEach(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        clusteredDbApps: [],
                        generatorType: 'helm',
                        istio: true
                    })
                    .on('end', done);
            });
            it('creates expected registry files', () => {
                assert.file(helmExpectedFiles.eurekaregistry);
                assert.file(helmExpectedFiles.csvcfiles);
            });
            it("doesn't creates gateway files", () => {
                assert.noFile(helmExpectedFiles.jhgate);
                assert.file(helmExpectedFiles.csvcfiles);
            });
            it('creates expected mysql files', () => {
                assert.file(helmExpectedFiles.msmysql);
                assert.fileContent('./msmysql/requirements.yml', /name: mysql/);
            });
            it('creates expected psql files', () => {
                assert.file(helmExpectedFiles.mspsql);
                assert.fileContent('./mspsql/requirements.yml', /name: postgresql/);
            });
            it('create the apply script', () => {
                assert.file(helmExpectedFiles.applyScript);
            });
        });

        describe('gateway, mysql, psql, mongodb, mariadb microservices', () => {
            beforeEach(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        generatorType: 'helm',
                        istio: true
                    })
                    .on('end', done);
            });
            it('creates expected registry files', () => {
                assert.file(helmExpectedFiles.eurekaregistry);
                assert.file(helmExpectedFiles.csvcfiles);
            });
            it('creates expected gateway files', () => {
                assert.file(helmExpectedFiles.jhgate);
                assert.file(helmExpectedFiles.csvcfiles);
            });
            it('creates expected mysql files', () => {
                assert.file(helmExpectedFiles.msmysql);
                assert.fileContent('./msmysql/requirements.yml', /name: mysql/);
            });
            it('creates expected psql files', () => {
                assert.file(helmExpectedFiles.mspsql);
                assert.fileContent('./mspsql/requirements.yml', /name: postgresql/);
            });
            it('creates expected mongodb files', () => {
                assert.file(helmExpectedFiles.msmongodb);
                assert.fileContent('./msmongodb/requirements.yml', /name: mongodb-replicaset/);
            });
            it('creates expected mariadb files', () => {
                assert.file(helmExpectedFiles.msmariadb);
                assert.fileContent('./msmariadb/requirements.yml', /name: mariadb/);
            });
            it('create the apply script', () => {
                assert.file(helmExpectedFiles.applyScript);
            });
        });

        describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
            beforeEach(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        generatorType: 'helm',
                        istio: true
                    })
                    .on('end', done);
            });
            it('creates expected registry files', () => {
                assert.file(helmExpectedFiles.eurekaregistry);
            });
            it('creates expected mysql files', () => {
                assert.file(helmExpectedFiles.msmysql);
                assert.fileContent('./msmysql/requirements.yml', /name: mysql/);
            });
            it('creates expected prometheus files', () => {
                assert.file(helmExpectedFiles.csvcfiles);
                assert.fileContent('./csvc/requirements.yml', /name: prometheus/);
                assert.fileContent('./csvc/requirements.yml', /name: grafana/);
            });
            it('creates expected namespace file', () => {
                assert.file(helmExpectedFiles.customnamespace);
            });
            it('create the apply script', () => {
                assert.file(helmExpectedFiles.applyScript);
            });
        });

        describe('gateway with istio routing files', () => {
            beforeEach(done => {
                helpers
                    .run(require.resolve('../generators/kubernetes-knative'))
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
                        generatorType: 'helm',
                        istio: true
                    })
                    .on('end', done);
            });
            it('creates expected registry files', () => {
                assert.file(helmExpectedFiles.eurekaregistry);
                assert.file(helmExpectedFiles.csvcfiles);
            });
            it('creates expected service gateway files', () => {
                assert.file(helmExpectedFiles.jhgate);
                assert.file(helmExpectedFiles.csvcfiles);
            });
            it('creates expected routing gateway and istio files', () => {
                assert.file(helmExpectedFiles.jhgategateway);
            });
            it('create the apply script', () => {
                assert.file(helmExpectedFiles.applyScript);
            });
        });
    });
});
