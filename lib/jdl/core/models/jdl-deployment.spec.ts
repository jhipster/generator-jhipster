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

import { before, describe, expect, it } from 'esmocha';

import JDLDeployment from './jdl-deployment.ts';

describe('jdl - JDLDeployment', () => {
  describe('new', () => {
    describe('when not passing any argument', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error empty parameter not authorized
          new JDLDeployment();
        }).toThrow(/^The deploymentType is mandatory to create a deployment\.$/);
      });
    });
    describe('when not passing the deploymentType', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          new JDLDeployment({ deploymentType: null });
        }).toThrow(/^The deploymentType is mandatory to create a deployment\.$/);
      });
    });
    describe('when passing arguments', () => {
      let deployment;
      let args: any = {};

      before(() => {
        args = {
          deploymentType: 'kubernetes',
          appsFolders: '../',
          dockerRepositoryName: 'test',
        };
        deployment = new JDLDeployment(args);
      });

      it('should create a new instance', () => {
        expect(deployment.deploymentType).toEqual(args.deploymentType);
        expect(deployment.appsFolders).toEqual(args.appsFolders);
        expect(deployment.dockerRepositoryName).toEqual(args.dockerRepositoryName);
      });
    });
  });
  describe('toString', () => {
    describe('with some default options', () => {
      let deployment;
      let args;

      before(() => {
        args = {
          deploymentType: 'docker-compose',
          appsFolders: ['foo', 'bar'],
          directoryPath: '../',
          gatewayType: 'SpringCloudGateway',
          dockerRepositoryName: 'test',
        };
        deployment = new JDLDeployment(args);
      });

      it('should stringify its content without default values', () => {
        expect(deployment.toString()).toMatchInlineSnapshot(`
"deployment {
    deploymentType docker-compose
    appsFolders [foo, bar]
    clusteredDbApps []
    dockerRepositoryName test
  }"
`);
      });
    });
    describe('with some non default options', () => {
      let deployment;
      let args;

      before(() => {
        args = {
          deploymentType: 'docker-compose',
          appsFolders: ['foo', 'bar'],
          directoryPath: '../parent',
          gatewayType: 'SpringCloudGateway',
          dockerRepositoryName: 'test',
        };
        deployment = new JDLDeployment(args);
      });

      it('should stringify it', () => {
        expect(deployment.toString()).toMatchInlineSnapshot(`
"deployment {
    deploymentType docker-compose
    appsFolders [foo, bar]
    directoryPath ../parent
    clusteredDbApps []
    dockerRepositoryName test
  }"
`);
      });
    });
  });
});
