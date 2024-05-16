/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { JSONEntity, JSONRootObject } from './types.js';
import { removeFieldsWithNullishValues } from '../../generators/base/support/config.js';
import { GENERATOR_JHIPSTER } from '../../generators/generator-constants.js';

export default {
  convertToJDL,
  convertSingleContentToJDL,
};

/**
 * Exports to JDL every JHipster file found in the passed directory (down to one subfolder level).
 * @param directory the directory to find JHipster files.
 * @param output the file where the JDL will be written
 */
export function convertToJDL(directory = '.', output: string | false = 'app.jdl'): JDLObject | undefined {
  let jdlObject: JDLObject;
  if (doesFileExist(path.join(directory, '.yo-rc.json'))) {
    const yoRcFileContent: Partial<JSONRootObject> = readJSONFile(path.join(directory, '.yo-rc.json'));
    let entities: Map<string, JSONEntity> | undefined;
    if (doesDirectoryExist(path.join(directory, '.jhipster'))) {
      entities = getJSONEntityFiles(directory, yoRcFileContent);
    }
    jdlObject = getJDLObjectFromSingleApplication(yoRcFileContent, entities);
  } else {
    try {
      jdlObject = getJDLObjectFromMultipleApplications(directory);
    } catch (error) {
      return undefined;
    }
  }
  if (output) {
    output = path.isAbsolute(output) ? output : path.join(directory, output);
    exportJDLObject(jdlObject, output);
  }
  return jdlObject;
}

export function convertSingleContentToJDL(yoRcFileContent: Record<string, any>, entities?: Map<string, JSONEntity>): string {
  return getJDLObjectFromSingleApplication(yoRcFileContent, entities).toString();
}

function getJDLObjectFromMultipleApplications(directory: string): JDLObject {
  const subDirectories = getSubdirectories(directory);
  if (subDirectories.length === 0) {
    throw new Error('There are no subdirectories.');
  }
  let jdlObject = new JDLObject();
  subDirectories.forEach(subDirectory => {
    const applicationDirectory = path.join(directory, subDirectory);
    const yoRcFileContent: Partial<JSONRootObject> = readJSONFile(path.join(applicationDirectory, '.yo-rc.json'));
    let entities: Map<string, JSONEntity> = new Map();
    if (doesDirectoryExist(path.join(applicationDirectory, '.jhipster'))) {
      entities = getJSONEntityFiles(applicationDirectory, yoRcFileContent);
    }
    jdlObject = getJDLObjectFromSingleApplication(yoRcFileContent, entities, jdlObject);
  });
  return jdlObject;
}

export function getJDLObjectFromSingleApplication(
  yoRcFileContent: Record<string, any>,
  entities?: Map<string, JSONEntity>,
  existingJDLObject = new JDLObject(),
): JDLObject {
  const cleanedYoRcFileContent = cleanYoRcFileContent(yoRcFileContent);
  const jdlApplication = convertApplicationToJDL({ application: cleanedYoRcFileContent });
  if (!entities) {
    existingJDLObject.addApplication(jdlApplication);
    return existingJDLObject;
  }
  const jdlObject = convertEntitiesToJDL(entities);
  entities.forEach((entity, entityName) => jdlApplication.addEntityName(entityName));
  jdlObject.addApplication(jdlApplication);
  return mergeJDLObjects(existingJDLObject, jdlObject);
}

function cleanYoRcFileContent(yoRcFileContent: Record<string, any>) {
  for (const key of Object.keys(yoRcFileContent)) {
    yoRcFileContent[key] = removeFieldsWithNullishValues(yoRcFileContent[key]);
  }
  delete yoRcFileContent[GENERATOR_JHIPSTER].promptValues;
  if (yoRcFileContent[GENERATOR_JHIPSTER].blueprints) {
    yoRcFileContent[GENERATOR_JHIPSTER].blueprints = yoRcFileContent[GENERATOR_JHIPSTER].blueprints.map(blueprint => blueprint.name);
  }
  if (yoRcFileContent[GENERATOR_JHIPSTER].microfrontends) {
    yoRcFileContent[GENERATOR_JHIPSTER].microfrontends = yoRcFileContent[GENERATOR_JHIPSTER].microfrontends.map(({ baseName }) => baseName);
  }
  return yoRcFileContent;
}

function getJSONEntityFiles(applicationDirectory: string, yoRcFileContent: Partial<JSONRootObject>): Map<string, JSONEntity> {
  const entities: Map<string, JSONEntity> = new Map();
  fs.readdirSync(path.join(applicationDirectory, '.jhipster')).forEach(file => {
    const entityName = file.slice(0, file.indexOf('.json'));
    if (
      yoRcFileContent['generator-jhipster'] &&
      yoRcFileContent['generator-jhipster']!.entities &&
      !yoRcFileContent['generator-jhipster']!.entities!.includes(entityName)
    ) {
      throw new Error(
        `Mismatch identified between the application description amount of entity listed and the entity found in the .jhipster folder for entity name: ${entityName}`,
      );
    }
    const jsonFilePath = path.join(applicationDirectory, '.jhipster', file);
    if (fs.statSync(jsonFilePath).isFile() && file.endsWith('.json')) {
      entities.set(entityName, readJSONFile(jsonFilePath));
    }
  });
  return entities;
}

function getSubdirectories(rootDirectory: string) {
  return fs.readdirSync(path.join(rootDirectory)).filter(file => doesDirectoryExist(path.join(rootDirectory, file)));
}
