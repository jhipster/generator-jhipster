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

import path from 'path';
import fs from 'fs';
import JDLObject from '../models/jdl-object.js';
import mergeJDLObjects from '../models/jdl-object-merger.js';
import { doesFileExist, doesDirectoryExist } from '../utils/file-utils.js';
import { readJSONFile } from '../readers/json-file-reader.js';
import { convertApplicationToJDL } from './json-to-jdl-application-converter.js';
import { convertEntitiesToJDL } from './json-to-jdl-entity-converter.js';
import exportJDLObject from '../exporters/jdl-exporter.js';
import ApplicationOptions from '../jhipster/application-options.js';
import { Entity } from './types.js';

const { OptionNames } = ApplicationOptions;

export default {
  convertToJDL,
  convertSingleContentToJDL,
};

/**
 * Exports to JDL every JHipster file found in the passed directory (down to one subfolder level).
 * @param directory the directory to find JHipster files.
 * @param output the file where the JDL will be written
 */
export function convertToJDL(directory = '.', output = 'app.jdl') {
  let jdlObject: JDLObject;
  if (doesFileExist(path.join(directory, '.yo-rc.json'))) {
    const yoRcFileContent = readJSONFile(path.join(directory, '.yo-rc.json'));
    let entities;
    if (doesDirectoryExist(path.join(directory, '.jhipster'))) {
      entities = getJSONEntityFiles(directory);
    }
    jdlObject = getJDLObjectFromSingleApplication(yoRcFileContent, entities);
  } else {
    try {
      jdlObject = getJDLObjectFromMultipleApplications(directory);
    } catch (error) {
      return;
    }
  }
  exportJDLObject(jdlObject, path.join(directory, output));
}

export function convertSingleContentToJDL(yoRcFileContent, entities?: Map<string, Entity>) {
  return getJDLObjectFromSingleApplication(yoRcFileContent, entities).toString();
}

function getJDLObjectFromMultipleApplications(directory) {
  const subDirectories = getSubdirectories(directory);
  if (subDirectories.length === 0) {
    throw new Error('There are no subdirectories.');
  }
  let jdlObject = new JDLObject();
  subDirectories.forEach(subDirectory => {
    const applicationDirectory = path.join(directory, subDirectory);
    const yoRcFileContent = readJSONFile(path.join(applicationDirectory, '.yo-rc.json'));
    let entities: Map<string, Entity> = new Map();
    if (doesDirectoryExist(path.join(applicationDirectory, '.jhipster'))) {
      entities = getJSONEntityFiles(applicationDirectory);
    }
    jdlObject = getJDLObjectFromSingleApplication(yoRcFileContent, entities, jdlObject);
  });
  return jdlObject;
}

function getJDLObjectFromSingleApplication(
  yoRcFileContent,
  entities?: Map<string, Entity>,
  existingJDLObject = new JDLObject()
): JDLObject {
  const cleanedYoRcFileContent = cleanYoRcFileContent(yoRcFileContent);
  const jdlApplication = convertApplicationToJDL({ application: cleanedYoRcFileContent });
  if (!entities) {
    existingJDLObject.addApplication(jdlApplication);
    return existingJDLObject;
  }
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
  if (yoRcFileContent[generatorName].microfrontends) {
    yoRcFileContent[generatorName].microfrontends = yoRcFileContent[generatorName].microfrontends.map(({ baseName }) => baseName);
  }
  return yoRcFileContent;
}

function getJSONEntityFiles(applicationDirectory: string) {
  const entities: Map<string, Entity> = new Map();
  fs.readdirSync(path.join(applicationDirectory, '.jhipster')).forEach(file => {
    const jsonFilePath = path.join(applicationDirectory, '.jhipster', file);
    if (fs.statSync(jsonFilePath).isFile() && file.endsWith('.json')) {
      const entityName = file.slice(0, file.indexOf('.json'));
      entities.set(entityName, readJSONFile(jsonFilePath));
    }
  });
  return entities;
}

function getSubdirectories(rootDirectory: string) {
  return fs.readdirSync(path.join(rootDirectory)).filter(file => doesDirectoryExist(path.join(rootDirectory, file)));
}
