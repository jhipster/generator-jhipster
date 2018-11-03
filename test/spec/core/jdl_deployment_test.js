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
const JDLField = require('../../../lib/core/jdl_field');
const JDLValidation = require('../../../lib/core/jdl_validation');

describe.skip('JDLDeployment', () => {
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
    context('without a comment', () => {
      let deployment = null;
      let args = null;

      before(() => {
        args = {
          deploymentType: 'docker-compose',
          appsFolders: ['foo', 'bar'],
          dockerRepositoryName: 'test'
        };
        deployment = new JDLDeployment(args);
      });

      it('stringifies its content', () => {
        expect(deployment.toString()).to.eql(`
  {
    deploymentType docker-compose
    gatewayType zuul
    monitoring no
    directoryPath ../
    appsFolders [foo, bar]
    clusteredDbApps []
    consoleOptions []
    adminPassword admin
    serviceDiscoveryType eureka
    dockerRepositoryName test
    dockerPushCommand docker push
  }`);
      });
    });
    context('with a table equal to the name (snakecase)', () => {
      let deployment = null;
      let args = null;

      before(() => {
        args = {
          name: 'MySuperdeployment',
          tableName: 'my_super_deployment'
        };
        deployment = new JDLDeployment(args);
      });

      it('does not export it', () => {
        expect(deployment.toString()).to.equal(`deployment ${args.name}`);
      });
    });
    context('with a table name not equal to the name (snakecase)', () => {
      let deployment = null;
      let args = null;

      before(() => {
        args = {
          name: 'MySuperdeployment',
          tableName: 'MyTableName'
        };
        deployment = new JDLDeployment(args);
      });

      it('exports it', () => {
        expect(deployment.toString()).to.equal(`deployment ${args.name} (MyTableName)`);
      });
    });
    context('without fields', () => {
      let deployment = null;
      let args = null;

      before(() => {
        args = {
          name: 'Abc',
          tableName: 'String',
          comment: 'comment'
        };
        deployment = new JDLDeployment(args);
      });

      it('stringifies its content', () => {
        expect(deployment.toString()).to.eq(
          `/**
 * ${args.comment}
 */
deployment ${args.name} (${args.tableName})`
        );
      });
    });
    context('with fields', () => {
      let deployment = null;
      let field1 = null;
      let field2 = null;

      before(() => {
        deployment = new JDLDeployment({
          name: 'Abc',
          tableName: 'String',
          comment: 'deployment comment'
        });
        field1 = new JDLField({
          name: 'myField',
          type: 'Integer',
          comment: 'Field comment',
          validations: [new JDLValidation()]
        });
        field2 = new JDLField({
          name: 'myOtherField',
          type: 'Long'
        });
      });

      it('stringifies its content', () => {
        deployment.addField(field1);
        deployment.addField(field2);
        expect(deployment.toString()).to.eq(
          `/**
 * ${deployment.comment}
 */
deployment ${deployment.name} (${deployment.tableName}) {
  /**
   * ${field1.comment}
   */
  ${field1.name} ${field1.type} ${field1.validations[0]},
  ${field2.name} ${field2.type}
}`
        );
      });
    });
  });
});
