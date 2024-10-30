import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { glob } from 'glob';
import type { JHipsterConfig, JHipsterConfigs } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cwd = join(__dirname, '../..');
let jhipsterConfigs: JHipsterConfigs;

export const lookupCommandsConfigs = async (options?: { filter: (config: JHipsterConfig) => boolean }): Promise<JHipsterConfigs> => {
  if (jhipsterConfigs) {
    return jhipsterConfigs;
  }
  const { filter = () => true } = options ?? {};
  jhipsterConfigs = {};
  const files = [...(await glob('generators/*/index.{j,t}s', { cwd })), ...(await glob('generators/*/generators/*/index.{j,t}s', { cwd }))];
  for (const file of files) {
    const index = await import(pathToFileURL(`${cwd}/${file}`).toString());
    if (index.command?.configs) {
      Object.assign(jhipsterConfigs, index.command?.configs);
    }
  }
  return Object.fromEntries(Object.entries(jhipsterConfigs).filter(([_key, value]) => filter(value)));
};
