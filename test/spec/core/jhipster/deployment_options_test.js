/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const { DeploymentTypes, Options } = require('../../../../lib/core/jhipster/deployment_options');

describe('DeploymentOptions', () => {
  describe('DeploymentTypes', () => {
    describe('::exists', () => {
      context('when passing a nil arg', () => {
        it('returns false', () => {
          expect(DeploymentTypes.exists()).to.be.false;
        });
      });
      context('when passing an invalid type', () => {
        it('returns false', () => {
          expect(DeploymentTypes.exists('NotAType')).to.be.false;
        });
      });
      context('when passing a valid type', () => {
        it('returns true', () => {
          expect(DeploymentTypes.exists(DeploymentTypes.DOCKERCOMPOSE)).to.be.true;
          expect(DeploymentTypes.exists(DeploymentTypes.KUBERNETES)).to.be.true;
        });
      });
    });
  });

  describe('Options', () => {
    describe('::defaults', () => {
      context('when passing no args', () => {
        it('should return docker deployment config', () => {
          expect(Options.defaults()).to.eql({
            deploymentType: 'docker-compose',
            appsFolders: new Set(),
            clusteredDbApps: new Set(),
            consoleOptions: new Set(),
            directoryPath: '../',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: '',
            gatewayType: 'zuul',
            monitoring: 'no',
            serviceDiscoveryType: 'eureka'
          });
        });
      });
      context('when passing kubernetes as arg', () => {
        it('should return kubernetes deployment config', () => {
          expect(Options.defaults('kubernetes')).to.eql({
            deploymentType: 'kubernetes',
            appsFolders: new Set(),
            clusteredDbApps: new Set(),
            consoleOptions: new Set(),
            directoryPath: '../',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: '',
            gatewayType: 'zuul',
            monitoring: 'no',
            serviceDiscoveryType: 'eureka',
            ingressDomain: '',
            istio: false,
            kubernetesNamespace: 'default',
            kubernetesServiceType: 'LoadBalancer'
          });
        });
      });
      context('when passing openshift as arg', () => {
        it('should return openshift deployment config', () => {
          expect(Options.defaults('openshift')).to.eql({
            deploymentType: 'openshift',
            appsFolders: new Set(),
            clusteredDbApps: new Set(),
            consoleOptions: new Set(),
            directoryPath: '../',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: '',
            gatewayType: 'zuul',
            monitoring: 'no',
            serviceDiscoveryType: 'eureka',
            openshiftNamespace: 'default',
            storageType: 'ephemeral'
          });
        });
      });
    });
  });
});
