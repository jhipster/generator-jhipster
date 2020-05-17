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
const fs = require('fs');
const https = require('https');
const path = require('path');
const cliUtils = require('./utils');
const importJdl = require('./import-jdl');

const { logger } = cliUtils;

module.exports = (args, options = {}, env) => {
    let file = args[0];
    let basename;
    let filename;
    const fileExtension = path.extname(file);
    if (fileExtension) {
        filename = path.basename(file);
        basename = path.basename(file, fileExtension);
    } else {
        filename = `${file}.jdl`;
        basename = file;
    }
    if (!file || !path.isAbsolute(file)) {
        file = `https://raw.githubusercontent.com/jhipster/jdl-samples/master/${filename}`;
    }

    logger.debug(`Downloading file: ${file}`);
    https
        .get(file, response => {
            if (response.statusCode !== 200) {
                logger.error(`Error downloading ${file}: ${response.statusCode} - ${response.statusMessage}`);
                return;
            }

            logger.debug(`Creating folder: ${basename}`);
            if (!fs.existsSync(basename)) {
                fs.mkdirSync(basename);
            }
            logger.debug(`Creating file: ${path.join(basename, filename)}`);
            const fileStream = fs.createWriteStream(`${basename}/${filename}`);
            fileStream.on('finish', () => {
                fileStream.close(() => {
                    if (!options.downloadOnly) {
                        process.chdir(path.resolve(basename));
                        importJdl([`${filename}`], options, env);
                    }
                });
            });
            response.pipe(fileStream);
        })
        .on('error', e => {
            logger.error(e.message, e);
        });
};
