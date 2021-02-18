/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const path = require('path');
const fs = require('fs');
const JDLObject = require('../models/jdl-object');
const { mergeJDLObjects } = require('../models/jdl-object-merger');
const { doesFileExist, doesDirectoryExist } = require('../utils/file-utils');
const { readJSONFile } = require('../readers/json-file-reader');
const { convertApplicationToJDL } = require('./json-to-jdl-application-converter');
const { convertEntitiesToJDL } = require('./json-to-jdl-entity-converter');
const { exportToJDL: exportJDLObject } = require('../exporters/jdl-exporter');
const { OptionNames } = require('../jhipster/application-options');

module.exports = {
  convertToJDL,
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
    existingJDLObject.addApplication(jdlApplication);
    return existingJDLObject;
  }
  const entities = getJSONEntityFiles(directory);
  const skippedUserManagement = jdlApplication.getConfigurationOptionValue(OptionNames.SKIP_USER_MANAGEMENT);
  const jdlObject = convertEntitiesToJDL({ entities, skippedUserManagement });
  entities.forEach((entity, entityName) => jdlApplication.addEntityName(entityName));
  jdlObject.addApplication(jdlApplication);
  return mergeJDLObjects(existingJDLObject, jdlObject);
}

function cleanYoRcFileContent(yoRcFileContent) {
  const [generatorName] = Object.keys(yoRcFileContent);
  delete yoRcFileContent[generatorName].promptValues;
  if (yoRcFileContent[generatorName].blueprints) {
    yoRcFileContent[generatorName].blueprints = yoRcFileContent[generatorName].blueprints.map(blueprint => blueprint.name);
  }
  if (yoRcFileContent[generatorName].otherModules) {
    yoRcFileContent[generatorName].otherModules = yoRcFileContent[generatorName].otherModules.map(module => module.name);
  }
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
