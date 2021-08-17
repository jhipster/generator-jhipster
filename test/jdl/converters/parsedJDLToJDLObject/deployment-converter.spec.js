/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const { expect } = require('chai');
const JDLDeployment = require('../../../../jdl/models/jdl-deployment');
const { convertDeployments } = require('../../../../jdl/converters/parsed-jdl-to-jdl-object/deployment-converter');

describe('DeploymentConverter', () => {
  describe('convertDeployments', () => {
    context('when not passing deployments', () => {
      it('should fail', () => {
        expect(() => convertDeployments()).to.throw(/^Deployments have to be passed so as to be converted\.$/);
      });
    });
    context('when passing deployments', () => {
      let convertedDeployments;
      let expectedDeployments;

      before(() => {
        convertedDeployments = convertDeployments([
          {
            deploymentType: 'openshift',
            appsFolders: ['tata', 'titi'],
            dockerRepositoryName: 'test',
          },
        ]);
        expectedDeployments = [
          new JDLDeployment({
            deploymentType: 'openshift',
            appsFolders: ['tata', 'titi'],
            dockerRepositoryName: 'test',
          }),
        ];
      });

      it('should convert them', () => {
        expect(convertedDeployments).to.deep.equal(expectedDeployments);
      });
    });
  });
});
