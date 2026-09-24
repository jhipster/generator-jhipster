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

import { describe, expect, it } from 'esmocha';

import { lookupCommandsConfigs } from '../command/lookup-commands-configs.ts';

import { getDefaultJDLApplicationConfig, getDefaultJDLDeploymentConfig } from './jhipster-jdl-config.ts';

describe('jdl definitions', () => {
  // Every jdl option a generator declares belongs to one of the two trees: the application definitions are the options
  // reached from `app`, the deployment ones the options reached from `deployment`. An option declared by a generator
  // neither reaches is a mistake in a command's `import`s rather than in the definitions.
  it('should split every jdl option declared by a generator between the application and the deployment definitions', () => {
    const declared = Object.keys(lookupCommandsConfigs({ filter: config => Boolean(config.jdl) })).sort();
    const application = Object.keys(getDefaultJDLApplicationConfig().optionsTypes);
    const deployment = Object.keys(getDefaultJDLDeploymentConfig().optionsTypes);
    expect([...new Set([...application, ...deployment])].sort()).toEqual(declared);
  });

  it('should let a keyword be declared by both trees, each with its own definition', () => {
    // serviceDiscoveryType is declared by spring-boot and by deployment. The same generic name token
    // is validated against the definitions of the enclosing declaration.
    const shared = Object.keys(getDefaultJDLApplicationConfig().optionsTypes).filter(
      name => name in getDefaultJDLDeploymentConfig().optionsTypes,
    );
    expect(shared).toEqual(['serviceDiscoveryType']);
  });

  it.skip('should match snapshot', () => {
    expect(getDefaultJDLApplicationConfig()).toMatchSnapshot();
  });
});
