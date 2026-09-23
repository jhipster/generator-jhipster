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

import { getDefaultRuntime } from '../../../jdl-config/jdl-runtime.ts';
import type JDLDeployment from '../../core/models/jdl-deployment.ts';

import { convertDeployments } from './deployment-converter.ts';

describe('jdl - DeploymentConverter', () => {
  describe('convertDeployments', () => {
    describe('when not passing deployments', () => {
      it('should fail', () => {
        expect(() => convertDeployments(undefined as any, getDefaultRuntime())).toThrow(
          /^Deployments have to be passed so as to be converted\.$/,
        );
      });
    });
    describe('when passing a value an option does not allow', () => {
      it('should fail', () => {
        expect(() =>
          convertDeployments(
            [{ deploymentType: 'kubernetes', appsFolders: ['tata'], serviceDiscoveryType: 'zookeeper' } as any],
            getDefaultRuntime(),
          ),
        ).toThrow(/^The value 'zookeeper' is not allowed for the deployment option 'serviceDiscoveryType'\.$/);
      });

      it('should let an option without choices take any value', () => {
        expect(() =>
          convertDeployments(
            [{ deploymentType: 'kubernetes', appsFolders: ['tata'], kubernetesNamespace: 'anything-goes' } as any],
            getDefaultRuntime(),
          ),
        ).not.toThrow();
      });
    });

    describe('when passing deployments', () => {
      let convertedDeployments: JDLDeployment[];

      before(() => {
        convertedDeployments = convertDeployments(
          [
            {
              deploymentType: 'docker-compose',
              appsFolders: ['tata', 'titi'],
              dockerRepositoryName: 'test',
            },
          ],
          getDefaultRuntime(),
        );
      });

      it('should convert them', () => {
        expect(convertedDeployments).toMatchInlineSnapshot(`
[
  JDLDeployment {
    "appsFolders": Set {
      "tata",
      "titi",
    },
    "clusteredDbApps": Set {},
    "deploymentType": "docker-compose",
    "directoryPath": "../",
    "dockerRepositoryName": "test",
    "gatewayType": "SpringCloudGateway",
    "ingressDomain": undefined,
    "ingressType": undefined,
    "istio": undefined,
    "kubernetesServiceType": undefined,
    "monitoring": "no",
    "serviceDiscoveryType": "consul",
    "storageType": undefined,
  },
]
`);
      });
    });
  });
});
