/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

/* eslint-disable no-new */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { deploymentOptions } from '../../../jdl/jhipster/index.mjs';

const { DeploymentTypes, Options } = deploymentOptions;

describe('DeploymentOptions', () => {
  describe('DeploymentTypes', () => {
    describe('exists', () => {
      context('when passing a nil arg', () => {
        it('should return false', () => {
          expect(DeploymentTypes.exists()).to.be.false;
        });
      });
      context('when passing an invalid type', () => {
        it('should return false', () => {
          expect(DeploymentTypes.exists('NotAType')).to.be.false;
        });
      });
      context('when passing a valid type', () => {
        it('should return true', () => {
          expect(DeploymentTypes.exists(DeploymentTypes.DOCKERCOMPOSE)).to.be.true;
          expect(DeploymentTypes.exists(DeploymentTypes.KUBERNETES)).to.be.true;
        });
      });
    });
  });

  describe('Options', () => {
    describe('defaults', () => {
      context('when passing no args', () => {
        it('should return docker deployment config', () => {
          expect(Options.defaults()).to.eql({
            appsFolders: new Set(),
            clusteredDbApps: new Set(),
            directoryPath: '../',
            gatewayType: 'SpringCloudGateway',
            monitoring: 'no',
            serviceDiscoveryType: 'eureka',
          });
        });
      });
      context('when passing kubernetes as arg', () => {
        it('should return kubernetes deployment config', () => {
          expect(Options.defaults('kubernetes')).to.eql({
            appsFolders: new Set(),
            clusteredDbApps: new Set(),
            directoryPath: '../',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: '',
            kubernetesUseDynamicStorage: false,
            kubernetesStorageClassName: '',
            monitoring: 'no',
            serviceDiscoveryType: 'eureka',
            ingressDomain: '',
            istio: false,
            kubernetesNamespace: 'default',
            kubernetesServiceType: 'LoadBalancer',
          });
        });
      });
      context('when passing openshift as arg', () => {
        it('should return openshift deployment config', () => {
          expect(Options.defaults('openshift')).to.eql({
            appsFolders: new Set(),
            clusteredDbApps: new Set(),
            directoryPath: '../',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: '',
            monitoring: 'no',
            serviceDiscoveryType: 'eureka',
            openshiftNamespace: 'default',
            storageType: 'ephemeral',
            registryReplicas: 2,
          });
        });
      });
    });
  });
});
