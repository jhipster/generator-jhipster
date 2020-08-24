/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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
const FileUtils = require('../utils/file-utils');
const { convertEntitiesToJDL } = require('../converters/json-to-jdl-entity-converter');
const { convertServerOptionsToJDL } = require('../converters/json-to-jdl-option-converter');
const JSONFileReader = require('./json-file-reader');
const { SKIP_USER_MANAGEMENT } = require('../jhipster/unary-options');
const { mergeJDLObjects } = require('../models/jdl-object-merger');

module.exports = {
    parseFromDir,
};

/* Parse the given jhipster app dir and return a JDLObject */
function parseFromDir(dir) {
    if (!dir) {
        throw new Error('The app directory must be passed to read JSON files.');
    }
    if (!FileUtils.doesDirectoryExist(dir)) {
        throw new Error(`The passed directory '${dir}' must exist and must be a directory to read JSON files.`);
    }
    const entityDir = `${dir}/.jhipster`;
    if (!FileUtils.doesDirectoryExist(entityDir)) {
        throw new Error(`'${entityDir}' must exist as a directory.`);
    }
    const entities = new Map();
    const files = fs.readdirSync(entityDir);
    files.forEach(file => {
        if (file.endsWith('.json')) {
            const entityName = file.slice(0, file.length - 5);
            try {
                entities.set(entityName, JSONFileReader.readJSONFile(`${entityDir}/${file}`));
            } catch (error) {
                // Not an entity file, not adding
            }
        }
    });
    const jdlObject = convertServerOptionsToJDL(JSONFileReader.readJSONFile(`${dir}/.yo-rc.json`)['generator-jhipster']);
    const skippedUserManagement = jdlObject.hasOption(SKIP_USER_MANAGEMENT);
    const convertedJDLObject = convertEntitiesToJDL({ entities, skippedUserManagement });
    return mergeJDLObjects(jdlObject, convertedJDLObject);
}
