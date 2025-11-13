/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inspect } from 'node:util';

import { packageJson } from '../lib/index.ts';

import { logger } from './utils.ts';

const downloadFile = async (url: string, filename: string): Promise<string> => {
  logger.verboseInfo(`Downloading file: ${url}`);
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw new Error(`Error downloading ${url}: ${response.status} - ${response.statusText}`);
  }
  logger.debug(`Creating file: ${path.join(filename)}`);
  await writeFile(filename, await response.body!, 'utf8');
  return filename;
};

export type DownloadJdlOptions = { skipSampleRepository?: boolean };

export const downloadJdlFile = async (jdlFile: string, { skipSampleRepository }: DownloadJdlOptions = {}): Promise<string> => {
  let url;
  try {
    const urlObject = new URL(jdlFile);
    url = jdlFile;
    jdlFile = path.basename(urlObject.pathname);
  } catch {
    if (skipSampleRepository) {
      throw new Error(`Could not find ${jdlFile}, make sure the path is correct.`);
    }
    url = new URL(jdlFile, `https://raw.githubusercontent.com/jhipster/jdl-samples/v${packageJson.version}/`).toString();
    jdlFile = path.basename(jdlFile);
  }
  try {
    return await downloadFile(url, jdlFile);
  } catch (error) {
    logger.verboseInfo((error as Error).message);
    url = new URL(jdlFile, `https://raw.githubusercontent.com/jhipster/jdl-samples/v${packageJson.version.split('.')[0]}/`).toString();
    return downloadFile(url, jdlFile);
  }
};

/**
 * Download command
 * @param jdlFiles
 * @param options options passed from CLI
 */
export const downloadJdlFiles = async (jdlFiles: string[], options: DownloadJdlOptions = {}): Promise<string[]> => {
  logger.debug('cmd: download');
  logger.debug(`jdlFiles: ${inspect(jdlFiles)}`);
  if (!jdlFiles || jdlFiles.length === 0) {
    throw new Error('\nAt least one jdl file is required.\n');
  }
  return Promise.all(jdlFiles.map(filename => downloadJdlFile(filename, options)));
};

/**
 * Download command
 * @param positionalArgs
 * @param options options passed from CLI
 */
const downloadJdlCommand = (positionalArgs: [string[]], options: DownloadJdlOptions): Promise<string[]> =>
  downloadJdlFiles(positionalArgs[0], options);

export default downloadJdlCommand;
