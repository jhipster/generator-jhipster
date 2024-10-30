import { describe, expect, it } from 'esmocha';
import { lookupCommandsConfigs } from './lookup-commands-configs.js';
import { buildJDLApplicationConfig, getDefaultJDLApplicationConfig } from './jdl.js';

describe('getDefaultJDLApplicationConfig()', () => {
  it('should return the default JDL application config', async () => {
    const configs = await lookupCommandsConfigs();
    const discoveredConfigs = buildJDLApplicationConfig(Object.fromEntries(Object.entries(configs).filter(([_key, value]) => value.jdl)));
    expect(getDefaultJDLApplicationConfig()).toMatchObject(discoveredConfigs);
    expect(getDefaultJDLApplicationConfig()).toMatchSnapshot();
  });
});
