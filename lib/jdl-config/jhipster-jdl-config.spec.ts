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

import { buildJDLApplicationConfig, getDefaultJDLApplicationConfig, getDefaultJDLApplicationConfigSync } from './jhipster-jdl-config.ts';

describe('getDefaultJDLApplicationConfig()', () => {
  let discoveredConfigs: JDLApplicationConfig;

  before(async () => {
    const configs = await lookupCommandsConfigs();
    discoveredConfigs = buildJDLApplicationConfig(Object.fromEntries(Object.entries(configs).filter(([_key, value]) => value.jdl)));
  });

  it('should return the default JDL application config', async () => {
    expect(await getDefaultJDLApplicationConfig()).toMatchObject(discoveredConfigs);
  });

  it.skip('should match snapshot', async () => {
    expect(await getDefaultJDLApplicationConfig()).toMatchSnapshot();
  });
});

describe('getDefaultJDLApplicationConfigSync()', () => {
  // The deprecated synchronous definitions are built from a hand maintained list of commands, so an option moving into
  // a command that the list does not name is dropped without a word. Anything this test reports as missing means that
  // list needs the command added to it, not that the expectation needs loosening.
  it('should not be missing any definition of the async version', async () => {
    const asyncOptionNames = Object.keys((await getDefaultJDLApplicationConfig()).optionsTypes);
    const syncOptionNames = Object.keys(getDefaultJDLApplicationConfigSync().optionsTypes);

    expect(asyncOptionNames.filter(name => !syncOptionNames.includes(name))).toEqual([]);
  });

  it('should match the async version', async () => {
    expect(getDefaultJDLApplicationConfigSync()).toEqual(await getDefaultJDLApplicationConfig());
  });
});
