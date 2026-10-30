/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { before, describe, expect, fn, it } from 'expect-node';

import { defaultHelpers as helpers, runResult } from '#testing';

const GENERATOR_KUBERNETES_HELM = 'kubernetes:helm';

const expectedFiles = {
  csvcfiles: [
    './helm/csvc-helm/Chart.yaml',
    './helm/csvc-helm/requirements.yaml',
    './helm/csvc-helm/values.yaml',
    './helm/csvc-helm/templates/_helpers.tpl',
  ],
  eurekaregistry: ['./helm/csvc-helm/templates/jhipster-registry.yml', './helm/csvc-helm/templates/application-configmap.yml'],
  consulregistry: [
    './helm/csvc-helm/templates/consul.yml',
    './helm/csvc-helm/templates/consul-config-loader.yml',
    './helm/csvc-helm/templates/application-configmap.yml',
  ],
  jhgate: [
    './helm/jhgate-helm/templates/jhgate-deployment.yml',
    './helm/jhgate-helm/templates/jhgate-service.yml',
    './helm/jhgate-helm/Chart.yaml',
    './helm/jhgate-helm/requirements.yaml',
    './helm/jhgate-helm/values.yaml',
    './helm/jhgate-helm/templates/_helpers.tpl',
  ],
  jhgateingress: ['./helm/jhgate-helm/templates/jhgate-ingress.yml'],
  customnamespace: ['./helm/namespace.yml'],
  msmysql: [
    './helm/msmysql-helm/Chart.yaml',
    './helm/msmysql-helm/requirements.yaml',
    './helm/msmysql-helm/values.yaml',
    './helm/msmysql-helm/templates/_helpers.tpl',
    './helm/msmysql-helm/templates/msmysql-deployment.yml',
    './helm/msmysql-helm/templates/msmysql-service.yml',
  ],
  mspsql: [
    './helm/mspsql-helm/Chart.yaml',
    './helm/mspsql-helm/requirements.yaml',
    './helm/mspsql-helm/values.yaml',
    './helm/mspsql-helm/templates/_helpers.tpl',
    './helm/mspsql-helm/templates/mspsql-deployment.yml',
    './helm/mspsql-helm/templates/mspsql-service.yml',
  ],
  msmongodb: [
    './helm/msmongodb-helm/Chart.yaml',
    './helm/msmongodb-helm/requirements.yaml',
    './helm/msmongodb-helm/values.yaml',
    './helm/msmongodb-helm/templates/_helpers.tpl',
    './helm/msmongodb-helm/templates/msmongodb-deployment.yml',
    './helm/msmongodb-helm/templates/msmongodb-service.yml',
  ],
  msmariadb: [
    './helm/msmariadb-helm/Chart.yaml',
    './helm/msmariadb-helm/requirements.yaml',
    './helm/msmariadb-helm/values.yaml',
    './helm/msmariadb-helm/templates/_helpers.tpl',
    './helm/msmariadb-helm/templates/msmariadb-deployment.yml',
    './helm/msmariadb-helm/templates/msmariadb-service.yml',
  ],
  monolith: [
    './helm/samplemysql-helm/Chart.yaml',
    './helm/samplemysql-helm/requirements.yaml',
    './helm/samplemysql-helm/values.yaml',
    './helm/samplemysql-helm/templates/_helpers.tpl',
    './helm/samplemysql-helm/templates/samplemysql-deployment.yml',
    './helm/samplemysql-helm/templates/samplemysql-service.yml',
    './helm/samplemysql-helm/templates/samplemysql-elasticsearch.yml',
  ],
  kafka: ['./helm/samplekafka-helm/templates/samplekafka-deployment.yml', './helm/samplekafka-helm/templates/samplekafka-service.yml'],
  jhgategateway: [
    './helm/jhgate-helm/templates/jhgate-gateway.yml',
    './helm/jhgate-helm/templates/jhgate-destination-rule.yml',
    './helm/jhgate-helm/templates/jhgate-virtual-service.yml',
  ],
  applyScript: ['./helm/helm-apply.sh', './helm/helm-upgrade.sh'],
};

describe('generator - Kubernetes Helm', () => {
  describe('only gateway', () => {
    before(async () => {
      const chosenApps = ['01-gateway'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: '../',
          chosenApps,
          adminPassword: 'meetup',
          dockerRepositoryName: 'jhipsterrepository',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'jhipsternamespace',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files and content', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files and content', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFileContent('./helm/jhgate-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
    it('generates Helm 3 only scripts and docs', () => {
      runResult.assertNoFileContent('./helm/helm-apply.sh', /helm delete --purge/);
      runResult.assertNoFileContent('./helm/helm-apply.sh', /helm install --name/);
      runResult.assertNoFileContent('./helm/helm-apply.sh', /helmVersion=/);
      runResult.assertFileContent('./helm/HELM-README.md', /Helm 3/i);
      runResult.assertNoFileContent('./helm/HELM-README.md', /tiller/i);
      runResult.assertNoFileContent('./helm/HELM-README.md', /incubator/);
    });
  });

  describe('gateway and mysql microservice', () => {
    before(async () => {
      const chosenApps = ['01-gateway', '02-mysql'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: '../',
          chosenApps,
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
    });
    it('creates expected mysql files', () => {
      runResult.assertFile(expectedFiles.msmysql);
      runResult.assertFileContent('./helm/msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('mysql microservice with custom namespace', () => {
    before(async () => {
      const chosenApps = ['02-mysql'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: '../',
          chosenApps,
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'mynamespace',
          jhipsterConsole: true,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected mysql files', () => {
      runResult.assertFile(expectedFiles.msmysql);
      runResult.assertFileContent('./helm/msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected namespace file', () => {
      runResult.assertFile(expectedFiles.customnamespace);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('gateway and ingress', () => {
    before(async () => {
      const chosenApps = ['01-gateway'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: '../',
          chosenApps,
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          istio: false,
          kubernetesServiceType: 'Ingress',
          ingressType: 'gke',
          ingressDomain: 'example.com',
          clusteredDbApps: [],
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected ingress files', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFile(expectedFiles.csvcfiles);
      runResult.assertFile(expectedFiles.jhgateingress);
      runResult.assertFileContent('./helm/jhgate-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('MySQL and PostgreSQL microservices without gateway', () => {
    before(async () => {
      const chosenApps = ['02-mysql', '03-psql'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: '../',
          chosenApps,
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it("doesn't creates gateway files", () => {
      runResult.assertNoFile(expectedFiles.jhgate);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected mysql files', () => {
      runResult.assertFile(expectedFiles.msmysql);
      runResult.assertFileContent('./helm/msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected psql files', () => {
      runResult.assertFile(expectedFiles.mspsql);
      runResult.assertFileContent('./helm/mspsql-helm/requirements.yaml', /name: postgresql/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('gateway, mysql, psql, mongodb, mariadb microservices', () => {
    before(async () => {
      const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: '../',
          chosenApps,
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
          istio: false,
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected mysql files', () => {
      runResult.assertFile(expectedFiles.msmysql);
      runResult.assertFileContent('./helm/msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected psql files', () => {
      runResult.assertFile(expectedFiles.mspsql);
      runResult.assertFileContent('./helm/mspsql-helm/requirements.yaml', /name: postgresql/);
    });
    it('creates expected mongodb files', () => {
      runResult.assertFile(expectedFiles.msmongodb);
      runResult.assertFileContent('./helm/msmongodb-helm/requirements.yaml', /name: mongodb-replicaset/);
    });
    it('creates expected mariadb files', () => {
      runResult.assertFile(expectedFiles.msmariadb);
      runResult.assertFileContent('./helm/msmariadb-helm/requirements.yaml', /name: mariadb/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('monolith application', () => {
    before(async () => {
      const chosenApps = ['08-monolith'];

      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'monolith',
          directoryPath: '../',
          chosenApps,
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it("doesn't creates registry files", () => {
      runResult.assertNoFile(expectedFiles.consulregistry);
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.monolith);
      runResult.assertFileContent('./helm/samplemysql-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('Kafka application', () => {
    before(async () => {
      const chosenApps = ['09-kafka'];

      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'monolith',
          directoryPath: '../',
          chosenApps,
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.csvcfiles);
      runResult.assertFile(expectedFiles.kafka);
      runResult.assertFileContent('./helm/csvc-helm/requirements.yaml', /name: kafka/);
      runResult.assertFileContent('./helm/samplekafka-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
    before(async () => {
      const chosenApps = ['02-mysql'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: '../',
          chosenApps,
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'mynamespace',
          monitoring: 'prometheus',
          kubernetesServiceType: 'LoadBalancer',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
    });
    it('creates expected mysql files', () => {
      runResult.assertFile(expectedFiles.msmysql);
      runResult.assertFileContent('./helm/msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected prometheus files', () => {
      runResult.assertFile(expectedFiles.csvcfiles);
      runResult.assertFileContent('./helm/csvc-helm/requirements.yaml', /name: prometheus/);
      runResult.assertFileContent('./helm/csvc-helm/requirements.yaml', /name: grafana/);
    });
    it('creates expected namespace file', () => {
      runResult.assertFile(expectedFiles.customnamespace);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('gateway with istio', () => {
    before(async () => {
      const chosenApps = ['01-gateway'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: '../',
          chosenApps,
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          ingressDomain: 'example.com',
          clusteredDbApps: [],
          istio: true,
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected service gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('pins each app to one Consul server with a destination rule', () => {
      runResult.assertFileContent('./helm/csvc-helm/templates/consul-destination-rule.yml', /useSourceIp: true/);
    });
    it('creates expected routing gateway and istio files', () => {
      runResult.assertFile(expectedFiles.jhgategateway);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });
  describe('helm check', () => {
    const chosenApps = ['01-gateway'];
    let spawnStub: ReturnType<typeof fn>;
    const helmCalls = () =>
      spawnStub.mock.calls
        .map(([method, command, options]) => ({ method, command, options }))
        .filter(({ command }) => command.startsWith('helm '));
    const helmWarnings = () =>
      (runResult.env.adapter.log as any).warn.mock.calls
        .map(({ arguments: [message] }: { arguments: [string] }) => message)
        .filter((message: string) => message.includes('helm'));
    const helmDebugMessages = () =>
      (runResult.env.adapter.log as any).debug.mock.calls
        .map(({ arguments: [message] }: { arguments: [string] }) => message)
        .filter((message: string) => message.startsWith('helm '));
    const runWithHelm = async (helm: () => unknown) => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      spawnStub = fn((method: string, command: string) => {
        if (method === 'spawnCommand' && command.startsWith('helm ')) {
          return helm();
        }
        const result = { exitCode: 0, stdout: '', stderr: '' };
        return method.endsWith('Sync') ? result : Promise.resolve(result);
      });
      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withSpawnMock({ stub: spawnStub })
        .withOptions({ skipChecks: false })
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: '../',
          chosenApps,
          adminPassword: 'meetup',
          dockerRepositoryName: 'jhipsterrepository',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'jhipsternamespace',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        });
    };

    describe('with helm 3 installed', () => {
      before(async () => {
        await runWithHelm(() => Promise.resolve({ exitCode: 0, stdout: 'v3.16.1+g5a5449d', stderr: '' }));
      });
      it('asks helm for its short version without a shell pipeline', () => {
        expect(helmCalls()).toEqual([
          { method: 'spawnCommand', command: 'helm version --short', options: { reject: false, stdio: 'pipe' } },
        ]);
      });
      it('logs the version found at debug level', () => {
        expect(helmDebugMessages()).toEqual(['helm version --short: v3.16.1+g5a5449d']);
      });
      it('does not warn', () => {
        expect(helmWarnings()).toEqual([]);
      });
    });

    describe('with helm 4 installed', () => {
      before(async () => {
        await runWithHelm(() => Promise.resolve({ exitCode: 0, stdout: 'v4.0.0+g99cd196', stderr: '' }));
      });
      it('does not warn', () => {
        expect(helmWarnings()).toEqual([]);
      });
    });

    describe('with a future helm 10 installed', () => {
      before(async () => {
        await runWithHelm(() => Promise.resolve({ exitCode: 0, stdout: 'v10.0.0+g0000000', stderr: '' }));
      });
      it('does not warn', () => {
        expect(helmWarnings()).toEqual([]);
      });
    });

    describe('with helm 2.11 installed', () => {
      before(async () => {
        await runWithHelm(() => Promise.resolve({ exitCode: 0, stdout: 'Client: v2.11.0+g2e55dbe', stderr: '' }));
      });
      it('warns that helm is too old', () => {
        expect(helmWarnings()).toEqual([
          'helm 2.11 is installed, but helm 2.12 or later is required.\nUpgrade helm. Read https://helm.sh/docs/intro/install/\n',
        ]);
      });
    });

    describe('with helm missing', () => {
      before(async () => {
        await runWithHelm(() =>
          Promise.resolve({
            exitCode: undefined,
            stdout: '',
            stderr: '',
            code: 'ENOENT',
            shortMessage: 'Command failed with ENOENT: helm version --short\nspawn helm ENOENT',
          }),
        );
      });
      it('warns that helm is missing and where to install it', () => {
        expect(helmWarnings()).toEqual([
          'helm is not installed on your computer or does not run.\nMake sure you have helm 2.12 or later installed. Read https://helm.sh/docs/intro/install/\n',
        ]);
      });
      it('logs why helm did not run at debug level', () => {
        expect(helmDebugMessages()).toEqual(['helm version --short: Command failed with ENOENT: helm version --short\nspawn helm ENOENT']);
      });
    });

    describe('when helm cannot be spawned', () => {
      before(async () => {
        await runWithHelm(() => {
          throw new Error("EACCES: permission denied, mkdir '/deployment'");
        });
      });
      it('warns instead of failing the generator', () => {
        expect(helmWarnings()).toEqual([
          'helm is not installed on your computer or does not run.\nMake sure you have helm 2.12 or later installed. Read https://helm.sh/docs/intro/install/\n',
        ]);
      });
    });
  });
});
