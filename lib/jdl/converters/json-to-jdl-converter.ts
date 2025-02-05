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

import path from 'path';
import fs from 'fs';
import JDLObject from '../core/models/jdl-object.js';
import mergeJDLObjects from '../core/models/jdl-object-merger.js';
import { doesDirectoryExist, doesFileExist } from '../core/utils/file-utils.js';
import { removeFieldsWithNullishValues } from '../../utils/object.js';
import type JDLApplication from '../core/models/jdl-application.js';
import type { JDLRuntime } from '../core/types/runtime.js';
import { createRuntime, getDefaultRuntime } from '../core/runtime.js';
import { YO_RC_CONFIG_KEY, readEntityFile, readYoRcFile } from '../../utils/yo-rc.js';
import type { JDLApplicationConfig } from '../core/types/parsing.js';
import type { JHipsterYoRcContent, JSONEntity, PostProcessedJSONRootObject } from '../core/types/json-config.js';
import exportJDLObject from './exporters/jdl-exporter.js';
import { convertEntitiesToJDL } from './json-to-jdl-entity-converter.js';
import { convertApplicationToJDL } from './json-to-jdl-application-converter.js';

export default {
  convertToJDL,
  convertSingleContentToJDL,
};

/**
 * Exports to JDL every JHipster file found in the passed directory (down to one subfolder level).
 * @param directory the directory to find JHipster files.
 * @param output the file where the JDL will be written
 */
export function convertToJDL(
  directory = '.',
  output: string | false = 'app.jdl',
  definition?: JDLApplicationConfig,
): JDLObject | undefined {
  let jdlObject: JDLObject;
  const runtime = definition ? createRuntime(definition) : getDefaultRuntime();
  if (doesFileExist(path.join(directory, '.yo-rc.json'))) {
    const yoRcFileContent: JHipsterYoRcContent = readYoRcFile(directory);
    let entities: Map<string, JSONEntity> | undefined;
    if (doesDirectoryExist(path.join(directory, '.jhipster'))) {
      entities = getJSONEntityFiles(directory);
    }
    jdlObject = getJDLObjectFromSingleApplication(yoRcFileContent, entities, undefined, runtime);
  } else {
    try {
      jdlObject = getJDLObjectFromMultipleApplications(directory, runtime);
    } catch {
      return undefined;
    }
  }
  if (output) {
    output = path.isAbsolute(output) ? output : path.join(directory, output);
    exportJDLObject(jdlObject, output);
  }
  return jdlObject;
}

export function convertSingleContentToJDL(yoRcFileContent: JHipsterYoRcContent, entities?: Map<string, JSONEntity>): string {
  return getJDLObjectFromSingleApplication(yoRcFileContent, entities).toString();
}

function getJDLObjectFromMultipleApplications(directory: string, runtime: JDLRuntime): JDLObject {
  const subDirectories = getSubdirectories(directory);
  if (subDirectories.length === 0) {
    throw new Error('There are no subdirectories.');
  }
  let jdlObject = new JDLObject();
  subDirectories.forEach(subDirectory => {
    const applicationDirectory = path.join(directory, subDirectory);
    const yoRcFileContent: JHipsterYoRcContent = readYoRcFile(applicationDirectory);
    let entities = new Map<string, JSONEntity>();
    if (doesDirectoryExist(path.join(applicationDirectory, '.jhipster'))) {
      entities = getJSONEntityFiles(applicationDirectory);
    }
    jdlObject = getJDLObjectFromSingleApplication(yoRcFileContent, entities, jdlObject, runtime);
  });
  return jdlObject;
}

export function getJDLObjectFromSingleApplication(
  yoRcFileContent: JHipsterYoRcContent,
  entities?: Map<string, JSONEntity>,
  existingJDLObject = new JDLObject(),
  runtime: JDLRuntime = getDefaultRuntime(),
): JDLObject {
  const cleanedYoRcFileContent: PostProcessedJSONRootObject = cleanYoRcFileContent(yoRcFileContent);
  const jdlApplication: JDLApplication = convertApplicationToJDL({ application: cleanedYoRcFileContent }, runtime);
  if (!entities) {
    existingJDLObject.addApplication(jdlApplication);
    return existingJDLObject;
  }
  const jdlObject: JDLObject = convertEntitiesToJDL(entities);
  entities.forEach((entity: JSONEntity, entityName: string) => jdlApplication.addEntityName(entityName));
  jdlObject.addApplication(jdlApplication);
  return mergeJDLObjects(existingJDLObject, jdlObject);
}

function cleanYoRcFileContent(yoRcFileContent: JHipsterYoRcContent): PostProcessedJSONRootObject {
  for (const key of Object.keys(yoRcFileContent)) {
    yoRcFileContent[key] = removeFieldsWithNullishValues(yoRcFileContent[key]);
  }
  delete yoRcFileContent[YO_RC_CONFIG_KEY].promptValues;
  const result: PostProcessedJSONRootObject = structuredClone(yoRcFileContent) as PostProcessedJSONRootObject;
  if (yoRcFileContent[YO_RC_CONFIG_KEY].blueprints) {
    result[YO_RC_CONFIG_KEY].blueprints = yoRcFileContent[YO_RC_CONFIG_KEY].blueprints.map(blueprint => blueprint.name);
  }
  if (yoRcFileContent[YO_RC_CONFIG_KEY].microfrontends) {
    result[YO_RC_CONFIG_KEY].microfrontends = yoRcFileContent[YO_RC_CONFIG_KEY].microfrontends.map(({ baseName }) => baseName);
  }
  return result;
}

function getJSONEntityFiles(applicationDirectory: string): Map<string, JSONEntity> {
  const entities = new Map<string, JSONEntity>();
  fs.readdirSync(path.join(applicationDirectory, '.jhipster')).forEach(file => {
    const entityName = file.slice(0, file.indexOf('.json'));
    try {
      entities.set(entityName, readEntityFile(applicationDirectory, entityName));
    } catch {
      // Not an entity file, not adding
    }
  });
  return entities;
}

function getSubdirectories(rootDirectory: string): string[] {
  return fs.readdirSync(path.join(rootDirectory)).filter(file => doesDirectoryExist(path.join(rootDirectory, file)));
}
