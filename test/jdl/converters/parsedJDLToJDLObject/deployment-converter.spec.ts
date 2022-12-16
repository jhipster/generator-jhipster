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

import { jestExpect as expect } from 'mocha-expect-snapshot';
import { convertDeployments } from '../../../../jdl/converters/parsed-jdl-to-jdl-object/deployment-converter.js';

describe('DeploymentConverter', () => {
  describe('convertDeployments', () => {
    context('when not passing deployments', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => convertDeployments()).toThrow(/^Deployments have to be passed so as to be converted\.$/);
      });
    });
    context('when passing deployments', () => {
      let convertedDeployments;

      before(() => {
        convertedDeployments = convertDeployments([
          {
            deploymentType: 'openshift',
            appsFolders: ['tata', 'titi'],
            dockerRepositoryName: 'test',
          },
        ]);
      });

      it('should convert them', () => {
        expect(convertedDeployments).toMatchInlineSnapshot(`
Array [
  JDLDeployment {
    "appsFolders": Set {
      "tata",
      "titi",
    },
    "clusteredDbApps": Set {},
    "deploymentType": "openshift",
    "directoryPath": "../",
    "dockerPushCommand": "docker push",
    "dockerRepositoryName": "test",
    "monitoring": "no",
    "openshiftNamespace": "default",
    "registryReplicas": 2,
    "serviceDiscoveryType": "eureka",
    "storageType": "ephemeral",
  },
]
`);
      });
    });
  });
});
