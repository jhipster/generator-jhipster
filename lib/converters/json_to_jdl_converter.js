/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

const path = require('path');
const fs = require('fs');
const JDLObject = require('../core/jdl_object');
const { mergeJDLObjects } = require('../core/jdl_object_merger');
const { doesFileExist, doesDirectoryExist } = require('../utils/file_utils');
const { readJSONFile } = require('../readers/json_file_reader');
const { convertApplicationToJDL } = require('./json_to_jdl_application_converter');
const { convertEntitiesToJDL } = require('./json_to_jdl_entity_converter');
const { exportToJDL: exportJDLObject } = require('../exporters/jdl_exporter');
const { SKIP_USER_MANAGEMENT } = require('../core/jhipster/unary_options');

module.exports = {
  convertToJDL
};

/**
 * Exports to JDL every JHipster file found in the passed directory (down to one subfolder level).
 * @param directory the directory to find JHipster files.
 * @param output the file where the JDL will be written
 */
function convertToJDL(directory = '.', output = 'app.jdl') {
  let jdlObject;
  if (doesFileExist(path.join(directory, '.yo-rc.json'))) {
    jdlObject = getJDLObjectFromSingleApplication(directory);
  } else {
    try {
      jdlObject = getJDLObjectFromMultipleApplications(directory);
    } catch (error) {
      return;
    }
  }
  exportJDLObject(jdlObject, path.join(directory, output));
}

function getJDLObjectFromMultipleApplications(directory) {
  const subDirectories = getSubdirectories(directory);
  if (subDirectories.length === 0) {
    throw new Error('There are no subdirectories.');
  }
  let jdlObject = new JDLObject();
  subDirectories.forEach(subDirectory => {
    jdlObject = getJDLObjectFromSingleApplication(path.join(directory, subDirectory), jdlObject);
  });
  return jdlObject;
}

function getJDLObjectFromSingleApplication(directory, existingJDLObject = new JDLObject()) {
  const yoRcFileContent = readJSONFile(path.join(directory, '.yo-rc.json'));
  const cleanedYoRcFileContent = cleanYoRcFileContent(yoRcFileContent);
  const jdlApplication = convertApplicationToJDL({ application: cleanedYoRcFileContent });
  if (!doesDirectoryExist(path.join(directory, '.jhipster'))) {
    const jdlObject = existingJDLObject;
    jdlObject.addApplication(jdlApplication);
    return jdlObject;
  }
  const entities = getJSONEntityFiles(directory);
  const skippedUserManagement = existingJDLObject ? existingJDLObject.hasOption(SKIP_USER_MANAGEMENT) : false;
  const jdlObject = convertEntitiesToJDL({ entities, skippedUserManagement });
  entities.forEach((entity, entityName) => jdlApplication.addEntity(jdlObject.getEntity(entityName)));
  jdlObject.addApplication(jdlApplication);
  return mergeJDLObjects(existingJDLObject, jdlObject);
}

function cleanYoRcFileContent(yoRcFileContent) {
  const [generatorName] = Object.keys(yoRcFileContent);
  delete yoRcFileContent[generatorName].promptValues;
  return yoRcFileContent;
}

function getJSONEntityFiles(applicationDirectory) {
  const entities = new Map();
  fs.readdirSync(path.join(applicationDirectory, '.jhipster')).forEach(file => {
    const jsonFilePath = path.join(applicationDirectory, '.jhipster', file);
    if (fs.statSync(jsonFilePath).isFile() && file.endsWith('.json')) {
      const entityName = file.slice(0, file.indexOf('.json'));
      entities.set(entityName, readJSONFile(jsonFilePath));
    }
  });
  return entities;
}

function getSubdirectories(rootDirectory) {
  return fs.readdirSync(path.join(rootDirectory)).filter(file => doesDirectoryExist(path.join(rootDirectory, file)));
}
