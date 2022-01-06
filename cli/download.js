/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const fs = require('fs');
const https = require('https');
const path = require('path');
const cliUtils = require('./utils');
const packageJson = require('../package.json');

const { logger } = cliUtils;

const downloadFile = (url, filename) => {
  return new Promise((resolve, reject) => {
    logger.info(`Downloading file: ${url}`);
    https
      .get(url, response => {
        if (response.statusCode !== 200) {
          return reject(new Error(`Error downloading ${url}: ${response.statusCode} - ${response.statusMessage}`));
        }

        logger.debug(`Creating file: ${path.join(filename)}`);
        const fileStream = fs.createWriteStream(`${filename}`);
        fileStream.on('finish', () => fileStream.close());
        fileStream.on('close', () => resolve(filename));
        response.pipe(fileStream);
        return undefined;
      })
      .on('error', e => {
        reject(e);
      });
  });
};

/**
 * Download command
 * @param {string[][]} args arguments passed for import-jdl
 * @param {string[]} args[0] jdl files
 * @param {any} options options passed from CLI
 */
module.exports = ([jdlFiles = []], options = {}) => {
  logger.debug('cmd: download');
  logger.debug(`jdlFiles: ${toString(jdlFiles)}`);
  if (!jdlFiles || jdlFiles.length === 0) {
    return Promise.reject(new Error('\nAt least one jdl file is required.\n'));
  }
  return Promise.all(
    jdlFiles.map(filename => {
      let url;
      try {
        const urlObject = new URL(filename);
        url = filename;
        filename = path.basename(urlObject.pathname);
      } catch (_error) {
        if (options.skipSampleRepository) {
          return Promise.reject(new Error(`Could not find ${filename}, make sure the path is correct.`));
        }
        url = new URL(filename, `https://raw.githubusercontent.com/jhipster/jdl-samples/v${packageJson.version}/`).toString();
        filename = path.basename(filename);
      }
      return downloadFile(url, filename).catch(error => {
        logger.info(error.message);
        url = new URL(filename, 'https://raw.githubusercontent.com/jhipster/jdl-samples/main/').toString();
        return downloadFile(url, filename);
      });
    })
  );
};
