/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { expect } from 'chai';
import { deploymentOptions, applicationTypes, databaseTypes, searchEngineTypes } from '../../../jdl/jhipster/index.mjs';

import DeploymentValidator from '../../../jdl/validators/deployment-validator.js';

const { MICROSERVICE } = applicationTypes;
const { MONGODB, NO } = databaseTypes;
const { Options } = deploymentOptions;

describe('jdl - DeploymentValidator', () => {
  let validator;

  before(() => {
    validator = new DeploymentValidator();
  });

  describe('validate', () => {
    context('when no deployment is passed', () => {
      it('should fail', () => {
        expect(() => validator.validate()).to.throw(/^No deployment\.$/);
      });
    });
    context('when a deployment is passed', () => {
      context('when having a docker-compose-related deployment', () => {
        context('without appFolders', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.dockerCompose,
                directoryPath: '../',
                gatewayType: Options.gatewayType.springCloudGateway,
                monitoring: 'no',
                serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
              })
            ).to.throw(/^The deployment attribute appsFolders was not found.$/);
          });
        });
        context('without directoryPath', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.dockerCompose,
                appsFolders: ['beers', 'burgers'],
                gatewayType: Options.gatewayType.springCloudGateway,
                monitoring: 'no',
                serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
              })
            ).to.throw(/^The deployment attribute directoryPath was not found.$/);
          });
        });
        context('without monitoring', () => {
          it('should not fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.dockerCompose,
                appsFolders: ['beers', 'burgers'],
                directoryPath: '../',
                gatewayType: Options.gatewayType.springCloudGateway,
                serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
              })
            ).not.to.throw();
          });
        });
        context('with microservices', () => {
          context('without gatewayType', () => {
            it('should fail', () => {
              expect(() =>
                validator.validate(
                  {
                    deploymentType: Options.deploymentType.dockerCompose,
                    appsFolders: ['beers', 'burgers'],
                    directoryPath: '../',
                    monitoring: 'no',
                    serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
                  },
                  {
                    applicationType: MICROSERVICE,
                  }
                )
              ).to.throw(/^A gateway type must be provided when dealing with microservices and the deployment type is docker-compose.$/);
            });
          });
        });
        context('without serviceDiscoveryType', () => {
          it('should not fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.dockerCompose,
                appsFolders: ['beers', 'burgers'],
                directoryPath: '../',
                monitoring: 'no',
              })
            ).not.to.throw();
          });
        });
      });
      context('when having a kubernetes-related deployment', () => {
        context('without appFolders', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.kubernetes,
                directoryPath: '../',
                kubernetesServiceType: Options.kubernetesServiceType.loadBalancer,
                monitoring: 'no',
                serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
              })
            ).to.throw(/^The deployment attribute appsFolders was not found.$/);
          });
        });
        context('without directoryPath', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.kubernetes,
                appsFolders: ['beers', 'burgers'],
                kubernetesServiceType: Options.kubernetesServiceType.loadBalancer,
                monitoring: 'no',
                serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
              })
            ).to.throw(/^The deployment attribute directoryPath was not found.$/);
          });
        });
        context(
          'without monitoring, dockerPushCommand, dockerRepositoryName, kubernetesNamespace, kubernetesUseDynamicStorage, kubernetesStorageClassName or istio and an ingressDomain',
          () => {
            it('should not fail', () => {
              expect(() =>
                validator.validate({
                  deploymentType: Options.deploymentType.kubernetes,
                  appsFolders: ['beers', 'burgers'],
                  directoryPath: '../',
                  kubernetesServiceType: Options.kubernetesServiceType.loadBalancer,
                  serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
                })
              ).not.to.throw();
            });
          }
        );
        context('without kubernetesServiceType', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.kubernetes,
                appsFolders: ['beers', 'burgers'],
                directoryPath: '../',
                serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
              })
            ).to.throw(/^A kubernetes service type must be provided when dealing with kubernetes-related deployments.$/);
          });
        });
        context('with istio', () => {
          context('without an ingressDomain', () => {
            it('should fail', () => {
              expect(() =>
                validator.validate({
                  deploymentType: Options.deploymentType.kubernetes,
                  appsFolders: ['beers', 'burgers'],
                  directoryPath: '../',
                  serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
                  kubernetesServiceType: Options.kubernetesServiceType.loadBalancer,
                  istio: true,
                })
              ).to.throw(
                /^An ingress domain must be provided when dealing with kubernetes-related deployments, with istio and when the service type is ingress.$/
              );
            });
          });
        });
        context('with the kubernetesServiceType being Ingress', () => {
          context('without an ingressType', () => {
            it('should fail', () => {
              expect(() =>
                validator.validate({
                  deploymentType: Options.deploymentType.kubernetes,
                  appsFolders: ['beers', 'burgers'],
                  directoryPath: '../',
                  kubernetesServiceType: Options.kubernetesServiceType.ingress,
                  serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
                })
              ).to.throw(
                /^An ingress type is required when dealing with kubernetes-related deployments and when the service type is ingress.$/
              );
            });
          });
        });
      });
      context('when having an openshift-related deployment', () => {
        context('without appFolders', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.openshift,
                directoryPath: '../',
                gatewayType: Options.gatewayType.springCloudGateway,
                openshiftNamespace: 'default',
              })
            ).to.throw(/^The deployment attribute appsFolders was not found.$/);
          });
        });
        context('without directoryPath', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.openshift,
                appsFolders: ['beers', 'burgers'],
                monitoring: 'no',
                openshiftNamespace: 'default',
              })
            ).to.throw(/^The deployment attribute directoryPath was not found.$/);
          });
        });
        context('without monitoring', () => {
          it('should not fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.openshift,
                appsFolders: ['beers', 'burgers'],
                directoryPath: '../',
                openshiftNamespace: 'default',
              })
            ).not.to.throw();
          });
        });
        context('without openshiftNamespace', () => {
          it('should not fail', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.openshift,
                appsFolders: ['beers', 'burgers'],
                directoryPath: '../',
              })
            ).not.to.throw();
          });
        });
        context('when there is no prodDatabaseType', () => {
          it('should fail if there is a storageType', () => {
            expect(() =>
              validator.validate(
                {
                  deploymentType: Options.deploymentType.openshift,
                  appsFolders: ['beers', 'burgers'],
                  directoryPath: '../',
                  storageType: Options.storageType.ephemeral,
                },
                { prodDatabaseType: NO }
              )
            ).to.throw(/^Can't have the storageType option set when there is no prodDatabaseType.$/);
          });
        });
        context('when the search engine is elasticsearch', () => {
          it('should fail if there is a storageType', () => {
            expect(() =>
              validator.validate(
                {
                  deploymentType: Options.deploymentType.openshift,
                  appsFolders: ['beers', 'burgers'],
                  directoryPath: '../',
                  storageType: Options.storageType.ephemeral,
                },
                { searchEngine: searchEngineTypes.ELASTICSEARCH }
              )
            ).to.throw(/^Can't have the storageType option set when elasticsearch is the search engine.$/);
          });
        });
        context('when the monitoring is done with prometheus', () => {
          it('should fail if there is a storageType', () => {
            expect(() =>
              validator.validate({
                deploymentType: Options.deploymentType.openshift,
                appsFolders: ['beers', 'burgers'],
                directoryPath: '../',
                storageType: Options.storageType.ephemeral,
                monitoring: Options.monitoring.prometheus,
              })
            ).to.throw(/^Can't have the storageType option set when the monitoring is done with prometheus.$/);
          });
        });
        context('when the prodDatabaseType is set and the storageType is not set', () => {
          it('should not fail', () => {
            expect(() =>
              validator.validate(
                {
                  deploymentType: Options.deploymentType.openshift,
                  appsFolders: ['beers', 'burgers'],
                  directoryPath: '../',
                },
                { prodDatabaseType: MONGODB }
              )
            ).not.to.throw();
          });
        });
      });
    });
    context('when passing an unknown deployment type', () => {
      it('should fail', () => {
        expect(() =>
          validator.validate({
            deploymentType: 'whatever',
            appsFolders: ['beers', 'burgers'],
            directoryPath: '../',
          })
        ).to.throw(/^The deployment type whatever isn't supported.$/);
      });
    });
  });
});
