import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import type { JHipsterConfig, JHipsterConfigs } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cwd = join(__dirname, '../..');
let jdlConfigs: JHipsterConfigs;

export const lookupCommandsConfigs = async (options?: { filter: (config: JHipsterConfig) => boolean }): Promise<JHipsterConfigs> => {
  if (jdlConfigs) {
    return jdlConfigs;
  }
  const { filter = () => true } = options ?? {};
  jdlConfigs = {};
  const files = [...(await glob('generators/*/index.{j,t}s', { cwd })), ...(await glob('generators/*/generators/*/index.{j,t}s', { cwd }))];
  for (const file of files) {
    const index = await import(`${cwd}/${file}`);
    const configs: JHipsterConfigs = index.command?.configs ?? {};
    for (const [key, value] of Object.entries(configs)) {
      if (filter(value)) {
        jdlConfigs[key] = value;
      }
    }
  }
  return jdlConfigs;
};
