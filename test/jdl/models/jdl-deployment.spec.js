/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

/* eslint-disable no-new, no-unused-expressions */
const { expect } = require('chai');
const JDLDeployment = require('../../../jdl/models/jdl-deployment');

describe('JDLDeployment', () => {
    describe('new', () => {
        context('when not passing any argument', () => {
            it('should fail', () => {
                expect(() => {
                    new JDLDeployment();
                }).to.throw(/^The deploymentType is mandatory to create a deployment\.$/);
            });
        });
        context('when not passing the deploymentType', () => {
            it('should fail', () => {
                expect(() => {
                    new JDLDeployment({ deploymentType: null });
                }).to.throw(/^The deploymentType is mandatory to create a deployment\.$/);
            });
        });
        context('when passing arguments', () => {
            let deployment;
            let args = {};

            before(() => {
                args = {
                    deploymentType: 'kubernetes',
                    appsFolders: '../',
                    dockerRepositoryName: 'test',
                };
                deployment = new JDLDeployment(args);
            });

            it('should create a new instance', () => {
                expect(deployment.deploymentType).to.equal(args.deploymentType);
                expect(deployment.appsFolders).to.equal(args.appsFolders);
                expect(deployment.dockerRepositoryName).to.equal(args.dockerRepositoryName);
            });
        });
    });
    describe('toString', () => {
        context('with some default options', () => {
            let deployment;
            let args;

            before(() => {
                args = {
                    deploymentType: 'docker-compose',
                    appsFolders: ['foo', 'bar'],
                    directoryPath: '../',
                    gatewayType: 'zuul',
                    dockerRepositoryName: 'test',
                };
                deployment = new JDLDeployment(args);
            });

            it('should stringify its content without default values', () => {
                expect(deployment.toString()).to.eql(`deployment {
    deploymentType ${args.deploymentType}
    appsFolders [${args.appsFolders.join(', ').replace(/'/g, '')}]
    dockerRepositoryName ${args.dockerRepositoryName}
  }`);
            });
        });
        context('with some non default options', () => {
            let deployment;
            let args;

            before(() => {
                args = {
                    deploymentType: 'docker-compose',
                    appsFolders: ['foo', 'bar'],
                    directoryPath: '../parent',
                    gatewayType: 'zuul',
                    dockerRepositoryName: 'test',
                };
                deployment = new JDLDeployment(args);
            });

            it('should stringify it', () => {
                expect(deployment.toString()).to.eql(`deployment {
    deploymentType ${args.deploymentType}
    directoryPath ${args.directoryPath}
    appsFolders [${args.appsFolders.join(', ').replace(/'/g, '')}]
    dockerRepositoryName ${args.dockerRepositoryName}
  }`);
            });
        });
    });
});
