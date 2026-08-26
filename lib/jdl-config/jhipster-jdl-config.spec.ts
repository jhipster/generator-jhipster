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

import { lookupCommandsConfigs } from '../command/lookup-commands-configs.ts';
import type { JDLApplicationConfig } from '../jdl/core/types/parsing.ts';

import { buildJDLApplicationConfig, getDefaultJDLApplicationConfig } from './jhipster-jdl-config.ts';

describe('getDefaultJDLApplicationConfig()', () => {
  let discoveredConfigs: JDLApplicationConfig;

  before(async () => {
    const configs = await lookupCommandsConfigs();
    discoveredConfigs = buildJDLApplicationConfig(Object.fromEntries(Object.entries(configs).filter(([_key, value]) => value.jdl)));
  });

  it('should return the default JDL application config', async () => {
    expect(getDefaultJDLApplicationConfig()).toMatchObject(discoveredConfigs);
  });

  it.skip('should match snapshot', async () => {
    expect(getDefaultJDLApplicationConfig()).toMatchSnapshot();
  });
});
