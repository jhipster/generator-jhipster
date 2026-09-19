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
import { before, describe, expect, it } from 'esmocha';

import { defaultHelpers as helpers, runResult } from '#testing';

const chosenApps = ['01-gateway', '02-mysql'];

const answers = {
  deploymentApplicationType: 'microservice',
  directoryPath: '../',
  chosenApps,
  adminPassword: 'meetup',
  dockerRepositoryName: 'jhipsterrepository',
  dockerPushCommand: 'docker push',
  kubernetesNamespace: 'jhipsternamespace',
  istio: false,
  kubernetesServiceType: 'Ingress',
  ingressType: 'nginx',
  ingressDomain: 'example.com',
  kubernetesUseDynamicStorage: true,
  kubernetesStorageClassName: '',
  generatorType: 'k8s',
};

const runDeployment = async (generator: string) => {
  await helpers
    .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
    .withWorkspacesSamples(...chosenApps)
    .withGenerateWorkspaceApplications();

  await helpers.runJHipsterDeployment(generator).withOptions({ askAnswered: true }).withAnswers(answers);
};

describe('generator - kubernetes:common - prompts', () => {
  describe('kubernetes', () => {
    before(() => runDeployment('kubernetes'));

    it('should ask questions in order', () => {
      expect(runResult.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
[
  "deploymentApplicationType",
  "directoryPath",
  "chosenApps",
  "monitoring",
  "kubernetesNamespace",
  "dockerRepositoryName",
  "dockerPushCommand",
  "istio",
  "kubernetesServiceType",
  "ingressType",
  "ingressDomain",
  "kubernetesUseDynamicStorage",
  "kubernetesStorageClassName",
]
`);
    });
  });

  describe('kubernetes:helm', () => {
    before(() => runDeployment('kubernetes:helm'));

    it('should ask questions in order', () => {
      expect(runResult.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
[
  "deploymentApplicationType",
  "directoryPath",
  "chosenApps",
  "monitoring",
  "kubernetesNamespace",
  "dockerRepositoryName",
  "dockerPushCommand",
  "istio",
  "kubernetesServiceType",
  "ingressType",
  "ingressDomain",
]
`);
    });
  });

  describe('kubernetes:knative', () => {
    before(() => runDeployment('kubernetes:knative'));

    it('should ask questions in order', () => {
      expect(runResult.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
[
  "directoryPath",
  "chosenApps",
  "generatorType",
  "monitoring",
  "kubernetesNamespace",
  "dockerRepositoryName",
  "dockerPushCommand",
  "ingressDomain",
]
`);
    });
  });
});
