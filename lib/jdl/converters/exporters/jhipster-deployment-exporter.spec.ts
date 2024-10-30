/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import fs from 'fs';
import path from 'path';
import { beforeEach, describe, it, expect as jestExpect } from 'esmocha';
import { expect } from 'chai';
import exportDeployments from '../exporters/jhipster-deployment-exporter.js';
import JDLDeployment from '../../core/models/jdl-deployment.js';
import { deploymentOptions } from '../../core/built-in-options/index.js';
import { basicHelpers as helpers } from '../../../../lib/testing/index.js';

const {
  DeploymentTypes: { DOCKERCOMPOSE, KUBERNETES },
} = deploymentOptions;

describe('jdl - JHipsterDeploymentExporter', () => {
  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });

  describe('exportDeployments', () => {
    describe('when passing invalid parameters', () => {
      describe('such as undefined', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error empty parameter not authorized
            exportDeployments();
          }).to.throw(/^Deployments have to be passed to be exported\.$/);
        });
      });
    });
    describe('when passing valid arguments', () => {
      describe('when exporting deployments to JSON', () => {
        let returned;

        beforeEach(() => {
          returned = exportDeployments({
            'docker-compose': new JDLDeployment({
              deploymentType: DOCKERCOMPOSE,
              appsFolders: ['tata', 'titi'],
              dockerRepositoryName: 'test',
            }),
            kubernetes: new JDLDeployment({
              deploymentType: KUBERNETES,
              appsFolders: ['tata', 'titi'],
              dockerRepositoryName: 'test',
            }),
          });
        });

        it('should return the exported deployments', () => {
          expect(returned).to.have.lengthOf(2);
        });
        describe('for the first deployment', () => {
          let content;

          beforeEach(() => {
            const data = fs.readFileSync(path.join('docker-compose', '.yo-rc.json'), { encoding: 'utf8' });
            content = JSON.parse(data);
          });

          it('should exports it', () => {
            fs.readFileSync(path.join('docker-compose', '.yo-rc.json'), { encoding: 'utf8' });
          });

          it('should format it', () => {
            expect(content['generator-jhipster']).not.to.be.undefined;
            const config = content['generator-jhipster'];
            jestExpect(config).toMatchInlineSnapshot(`
{
  "appsFolders": [
    "tata",
    "titi",
  ],
  "clusteredDbApps": [],
  "deploymentType": "docker-compose",
  "directoryPath": "../",
  "dockerRepositoryName": "test",
  "gatewayType": "SpringCloudGateway",
  "monitoring": "no",
  "serviceDiscoveryType": "consul",
}
`);
          });
        });
        describe('for the second deployment', () => {
          let content;

          beforeEach(() => {
            const data = fs.readFileSync(path.join('kubernetes', '.yo-rc.json'), { encoding: 'utf8' });
            content = JSON.parse(data);
          });

          it('should exports it', () => {
            fs.readFileSync(path.join('kubernetes', '.yo-rc.json'), { encoding: 'utf8' });
          });

          it('should format it', () => {
            expect(content['generator-jhipster']).not.to.be.undefined;
            const config = content['generator-jhipster'];
            jestExpect(config).toMatchInlineSnapshot(`
{
  "appsFolders": [
    "tata",
    "titi",
  ],
  "clusteredDbApps": [],
  "deploymentType": "kubernetes",
  "directoryPath": "../",
  "dockerPushCommand": "docker push",
  "dockerRepositoryName": "test",
  "ingressDomain": "",
  "istio": false,
  "kubernetesNamespace": "default",
  "kubernetesServiceType": "LoadBalancer",
  "kubernetesStorageClassName": "",
  "kubernetesUseDynamicStorage": false,
  "monitoring": "no",
  "serviceDiscoveryType": "consul",
}
`);
          });
        });
      });
    });
  });
});
