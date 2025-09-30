import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { glob } from 'glob';

import type { JHipsterConfig, JHipsterConfigs } from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cwd = join(__dirname, '../..');
let jhipsterConfigs: JHipsterConfigs;

export const lookupCommandsConfigs = async (options?: { filter: (config: JHipsterConfig) => boolean }): Promise<JHipsterConfigs> => {
  const { filter = () => true } = options ?? {};
  if (!jhipsterConfigs) {
    jhipsterConfigs = {};
    const files = [
      ...(await glob('generators/*/index.{j,t}s', { cwd })),
      ...(await glob('generators/*/generators/*/index.{j,t}s', { cwd })),
    ];
    for (const file of files) {
      try {
        const index = await import(pathToFileURL(`${cwd}/${file}`).toString());
        if (index.command?.configs) {
          Object.assign(jhipsterConfigs, index.command?.configs);
        }
      } catch (error) {
        throw new Error(`Error loading configs from ${file}`, { cause: error });
      }
    }
  }
  return Object.fromEntries(Object.entries(jhipsterConfigs).filter(([_key, value]) => filter(value)));
};
