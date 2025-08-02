/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { describe, it } from 'esmocha';

import { expect } from 'chai';

import deploymentOptions from './deployment-options.ts';

const { DeploymentTypes, Options } = deploymentOptions;

describe('jdl - DeploymentOptions', () => {
  describe('DeploymentTypes', () => {
    describe('exists', () => {
      describe('when passing a nil arg', () => {
        it('should return false', () => {
          expect(DeploymentTypes.exists()).to.be.false;
        });
      });
      describe('when passing an invalid type', () => {
        it('should return false', () => {
          expect(DeploymentTypes.exists('NotAType')).to.be.false;
        });
      });
      describe('when passing a valid type', () => {
        it('should return true', () => {
          expect(DeploymentTypes.exists(DeploymentTypes.DOCKERCOMPOSE)).to.be.true;
          expect(DeploymentTypes.exists(DeploymentTypes.KUBERNETES)).to.be.true;
        });
      });
    });
  });

  describe('Options', () => {
    describe('defaults', () => {
      describe('when passing no args', () => {
        it('should return docker deployment config', () => {
          expect(() => Options.defaults()).to.throw(/^Deployment type is required$/);
        });
      });
      describe('when passing kubernetes as arg', () => {
        it('should return kubernetes deployment config', () => {
          expect(Options.defaults('kubernetes')).to.eql({
            appsFolders: [],
            clusteredDbApps: [],
            directoryPath: '../',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: '',
            kubernetesUseDynamicStorage: false,
            kubernetesStorageClassName: '',
            monitoring: 'no',
            serviceDiscoveryType: 'consul',
            ingressDomain: '',
            ingressType: 'nginx',
            istio: false,
            kubernetesNamespace: 'default',
            kubernetesServiceType: 'LoadBalancer',
          });
        });
      });
    });
  });
});
