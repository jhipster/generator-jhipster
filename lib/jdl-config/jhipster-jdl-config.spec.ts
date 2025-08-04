import { describe, expect, it } from 'esmocha';

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
