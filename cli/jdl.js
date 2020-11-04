/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const chalk = require('chalk');
const fs = require('fs');
const https = require('https');
const path = require('path');
const cliUtils = require('./utils');
const importJdl = require('./import-jdl');

const { logger } = cliUtils;

/**
 * Add jdl extension to the file
 */
const toJdlFile = file => {
    if (!path.extname(file)) {
        return `${file}.jdl`;
    }
    return file;
};

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
 * JDL command
 * @param {any} args arguments passed for import-jdl
 * @param {any} options options passed from CLI
 * @param {any} env the yeoman environment
 * @param {function} forkProcess the method to use for process forking
 */
module.exports = (args, options = {}, env, forkProcess) => {
    logger.debug('cmd: import-jdl from ./import-jdl');
    logger.debug(`args: ${toString(args)}`);
    if (options.inline) {
        return importJdl(args, options, env, forkProcess);
    }
    if (!args || args.length === 0) {
        logger.fatal(chalk.red('\nAt least one jdl file is required.\n'));
    }
    const promises = args.map(toJdlFile).map(filename => {
        if (!fs.existsSync(filename)) {
            let url;
            try {
                const urlObject = new URL(filename);
                url = filename;
                filename = path.basename(urlObject.pathname);
            } catch (_error) {
                if (options.skipSampleRepository) {
                    return Promise.reject(new Error(`Could not find ${filename}, make sure the path is correct.`));
                }
                url = new URL(filename, 'https://raw.githubusercontent.com/jhipster/jdl-samples/main/').toString();
                filename = path.basename(filename);
            }
            return downloadFile(url, filename);
        }
        return Promise.resolve(filename);
    });
    return Promise.all(promises).then(jdlFiles => importJdl(jdlFiles, options, env, forkProcess));
};
