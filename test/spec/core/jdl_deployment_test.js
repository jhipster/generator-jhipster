/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const JDLDeployment = require('../../../lib/core/jdl_deployment');

describe('JDLDeployment', () => {
  describe('::new', () => {
    context('when not passing any argument', () => {
      it('fails', () => {
        expect(() => {
          new JDLDeployment();
        }).to.throw('The deploymentType is mandatory to create a deployment.');
      });
    });
    context('when not passing the deploymentType', () => {
      it('fails', () => {
        expect(() => {
          new JDLDeployment({ deploymentType: null });
        }).to.throw('The deploymentType is mandatory to create a deployment.');
      });
    });
    context('when passing arguments', () => {
      let deployment = null;
      let args = {};

      before(() => {
        args = {
          deploymentType: 'kubernetes',
          appsFolders: '../',
          dockerRepositoryName: 'test'
        };
        deployment = new JDLDeployment(args);
      });

      it('creates a new instance', () => {
        expect(deployment.deploymentType).to.eq(args.deploymentType);
        expect(deployment.appsFolders).to.eq(args.appsFolders);
        expect(deployment.dockerRepositoryName).to.eq(args.dockerRepositoryName);
      });
    });
  });
  describe('::isValid', () => {
    context('when checking the validity of an invalid object', () => {
      context('because it is nil or invalid', () => {
        it('returns false', () => {
          expect(JDLDeployment.isValid(null)).to.be.false;
          expect(JDLDeployment.isValid(undefined)).to.be.false;
        });
      });
      context('without a deploymentType attribute', () => {
        it('returns false', () => {
          expect(JDLDeployment.isValid({ appsFolders: '../', dockerRepositoryName: 'test' })).to.be.false;
        });
      });
      context('without appsFolders', () => {
        it('returns false', () => {
          expect(JDLDeployment.isValid({ deploymentType: 'kubernetes', dockerRepositoryName: 'test' })).to.be.false;
        });
      });
      context('without dockerRepositoryName', () => {
        it('returns false', () => {
          expect(JDLDeployment.isValid({ deploymentType: 'kubernetes', appsFolders: '../' })).to.be.false;
        });
      });
    });
    context('when checking the validity of a valid object', () => {
      it('returns true', () => {
        expect(
          JDLDeployment.isValid({ deploymentType: 'kubernetes', appsFolders: '../', dockerRepositoryName: 'test' })
        ).to.be.true;
      });
    });
  });
  describe('#toString', () => {
    context('with some default options', () => {
      let deployment = null;
      let args = null;

      before(() => {
        args = {
          deploymentType: 'docker-compose',
          appsFolders: ['foo', 'bar'],
          directoryPath: '../',
          gatewayType: 'zuul',
          dockerRepositoryName: 'test'
        };
        deployment = new JDLDeployment(args);
      });

      it('stringifies its content without default values', () => {
        expect(deployment.toString()).to.eql(`deployment {
    deploymentType ${args.deploymentType}
    appsFolders [${args.appsFolders.join(', ').replace(/'/g, '')}]
    dockerRepositoryName ${args.dockerRepositoryName}
  }`);
      });
    });
    context('with some non default options', () => {
      let deployment = null;
      let args = null;

      before(() => {
        args = {
          deploymentType: 'docker-compose',
          appsFolders: ['foo', 'bar'],
          directoryPath: '../parent',
          gatewayType: 'zuul',
          monitoring: 'elk',
          dockerRepositoryName: 'test'
        };
        deployment = new JDLDeployment(args);
      });

      it('stringifies it', () => {
        expect(deployment.toString()).to.eql(`deployment {
    deploymentType ${args.deploymentType}
    monitoring ${args.monitoring}
    directoryPath ${args.directoryPath}
    appsFolders [${args.appsFolders.join(', ').replace(/'/g, '')}]
    dockerRepositoryName ${args.dockerRepositoryName}
  }`);
      });
    });
  });
});
