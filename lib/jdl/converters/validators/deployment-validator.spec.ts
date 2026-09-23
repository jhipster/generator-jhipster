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

import { APPLICATION_TYPE_MICROSERVICE } from '../../../core/application-types.ts';

import DeploymentValidator from './deployment-validator.ts';

describe('jdl - DeploymentValidator', () => {
  let validator: DeploymentValidator;

  before(() => {
    validator = new DeploymentValidator();
  });

  describe('validate', () => {
    describe('when no deployment is passed', () => {
      it('should fail', () => {
        // @ts-expect-error invalid api test
        expect(() => validator.validate()).toThrow(/^No deployment\.$/);
      });
    });
    describe('when a deployment is passed', () => {
      describe('when having a docker-compose-related deployment', () => {
        describe('without appFolders', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: 'docker-compose',
                directoryPath: '../',
                gatewayType: 'SpringCloudGateway',
                monitoring: 'no',
                // @ts-expect-error FIXME
                serviceDiscoveryType: 'eureka',
              }),
            ).toThrow(/^The deployment attribute appsFolders was not found.$/);
          });
        });
        describe('without directoryPath', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: 'docker-compose',
                appsFolders: ['beers', 'burgers'],
                gatewayType: 'SpringCloudGateway',
                monitoring: 'no',
                // @ts-expect-error FIXME
                serviceDiscoveryType: 'eureka',
              }),
            ).toThrow(/^The deployment attribute directoryPath was not found.$/);
          });
        });
        describe('without monitoring', () => {
          it('should not fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: 'docker-compose',
                appsFolders: ['beers', 'burgers'],
                directoryPath: '../',
                gatewayType: 'SpringCloudGateway',
                // @ts-expect-error FIXME
                serviceDiscoveryType: 'eureka',
              }),
            ).not.toThrow();
          });
        });
        describe('with microservices', () => {
          describe('without gatewayType', () => {
            it('should fail', () => {
              expect(() =>
                validator.validate(
                  {
                    deploymentType: 'docker-compose',
                    appsFolders: ['beers', 'burgers'],
                    directoryPath: '../',
                    monitoring: 'no',
                    // @ts-expect-error FIXME
                    serviceDiscoveryType: 'eureka',
                  },
                  {
                    applicationType: APPLICATION_TYPE_MICROSERVICE,
                  },
                ),
              ).toThrow(/^A gateway type must be provided when dealing with microservices and the deployment type is docker-compose.$/);
            });
          });
        });
        describe('without serviceDiscoveryType', () => {
          it('should not fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: 'docker-compose',
                appsFolders: ['beers', 'burgers'],
                directoryPath: '../',
                monitoring: 'no',
              }),
            ).not.toThrow();
          });
        });
      });
      describe('when having a kubernetes-related deployment', () => {
        describe('without appFolders', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: 'kubernetes',
                directoryPath: '../',
                kubernetesServiceType: 'LoadBalancer',
                monitoring: 'no',
                // @ts-expect-error FIXME
                serviceDiscoveryType: 'eureka',
              }),
            ).toThrow(/^The deployment attribute appsFolders was not found.$/);
          });
        });
        describe('without directoryPath', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: 'kubernetes',
                appsFolders: ['beers', 'burgers'],
                kubernetesServiceType: 'LoadBalancer',
                monitoring: 'no',
                // @ts-expect-error FIXME
                serviceDiscoveryType: 'eureka',
              }),
            ).toThrow(/^The deployment attribute directoryPath was not found.$/);
          });
        });
        describe('without monitoring, dockerPushCommand, dockerRepositoryName, kubernetesNamespace, kubernetesUseDynamicStorage, kubernetesStorageClassName or istio and an ingressDomain', () => {
          it('should not fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: 'kubernetes',
                appsFolders: ['beers', 'burgers'],
                directoryPath: '../',
                kubernetesServiceType: 'LoadBalancer',
                // @ts-expect-error FIXME
                serviceDiscoveryType: 'eureka',
              }),
            ).not.toThrow();
          });
        });
        describe('without kubernetesServiceType', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: 'kubernetes',
                appsFolders: ['beers', 'burgers'],
                directoryPath: '../',
                // @ts-expect-error FIXME
                serviceDiscoveryType: 'eureka',
              }),
            ).toThrow(/^A kubernetes service type must be provided when dealing with kubernetes-related deployments.$/);
          });
        });
        describe('with istio', () => {
          describe('without an ingressDomain', () => {
            it('should fail', () => {
              expect(() =>
                validator.validate({
                  deploymentType: 'kubernetes',
                  appsFolders: ['beers', 'burgers'],
                  directoryPath: '../',
                  // @ts-expect-error FIXME
                  serviceDiscoveryType: 'eureka',
                  kubernetesServiceType: 'LoadBalancer',
                  istio: true,
                }),
              ).toThrow(
                /^An ingress domain must be provided when dealing with kubernetes-related deployments, with istio and when the service type is ingress.$/,
              );
            });
          });
        });
        describe('with the kubernetesServiceType being Ingress', () => {
          describe('without an ingressType', () => {
            it('should fail', () => {
              expect(() =>
                validator.validate({
                  deploymentType: 'kubernetes',
                  appsFolders: ['beers', 'burgers'],
                  directoryPath: '../',
                  kubernetesServiceType: 'Ingress',
                  // @ts-expect-error FIXME
                  serviceDiscoveryType: 'eureka',
                }),
              ).toThrow(
                /^An ingress type is required when dealing with kubernetes-related deployments and when the service type is ingress.$/,
              );
            });
          });
        });
      });
    });
    describe('when passing an unknown deployment type', () => {
      it('should fail', () => {
        expect(() =>
          validator.validate({
            deploymentType: 'whatever',
            appsFolders: ['beers', 'burgers'],
            directoryPath: '../',
          }),
        ).toThrow(/^The deployment type whatever isn't supported.$/);
      });
    });
  });
});
