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
import { YO_RC_CONFIG_KEY, readEntityFile, readYoRcFile } from '../../utils/yo-rc.js';
import type { RawJDLJSONApplication } from '../core/types/exporter.js';
import type { YoRcJHipsterApplicationConfigValue, YoRcJHipsterApplicationContent } from '../../jhipster/types/yo-rc.js';
import type { JSONEntity } from '../core/types/json-config.js';
import type { YoRcFileContent } from '../../constants/yeoman.ts';
import { convertApplicationToJDL } from './json-to-jdl-application-converter.js';
import { convertEntitiesToJDL } from './json-to-jdl-entity-converter.js';
import exportJDLObject from './exporters/jdl-exporter.js';

export default {
  convertToJDL,
  convertSingleContentToJDL,
};

/**
 * Exports to JDL every JHipster file found in the passed directory (down to one subfolder level).
 * @param directory the directory to find JHipster files.
 * @param output the file where the JDL will be written
 */
export function convertToJDL(runtime: JDLRuntime, directory = '.', output: string | false = 'app.jdl'): JDLObject | undefined {
  let jdlObject: JDLObject;
  if (doesFileExist(path.join(directory, '.yo-rc.json'))) {
    const yoRcFileContent: YoRcJHipsterApplicationContent = readYoRcFile(directory);
    let entities: Map<string, JSONEntity> | undefined;
    if (doesDirectoryExist(path.join(directory, '.jhipster'))) {
      entities = getJSONEntityFiles(directory);
    }
    jdlObject = getJDLObjectFromSingleApplication(yoRcFileContent, runtime, entities);
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

export function convertSingleContentToJDL(
  yoRcFileContent: YoRcJHipsterApplicationContent<Record<string, any>>,
  runtime: JDLRuntime,
  entities?: Map<string, JSONEntity>,
): string {
  return getJDLObjectFromSingleApplication(yoRcFileContent, runtime, entities).toString();
}

function getJDLObjectFromMultipleApplications(directory: string, runtime: JDLRuntime): JDLObject {
  const subDirectories = getSubdirectories(directory);
  if (subDirectories.length === 0) {
    throw new Error('There are no subdirectories.');
  }
  let jdlObject = new JDLObject();
  subDirectories.forEach(subDirectory => {
    const applicationDirectory = path.join(directory, subDirectory);
    const yoRcFileContent = readYoRcFile<YoRcJHipsterApplicationConfigValue>(applicationDirectory);
    let entities = new Map<string, JSONEntity>();
    if (doesDirectoryExist(path.join(applicationDirectory, '.jhipster'))) {
      entities = getJSONEntityFiles(applicationDirectory);
    }
    jdlObject = getJDLObjectFromSingleApplication(yoRcFileContent, runtime, entities, jdlObject);
  });
  return jdlObject;
}

export function getJDLObjectFromSingleApplication(
  yoRcFileContent: YoRcJHipsterApplicationContent,
  runtime: JDLRuntime,
  entities?: Map<string, JSONEntity>,
  existingJDLObject = new JDLObject(),
): JDLObject {
  const cleanedYoRcFileContent = cleanYoRcFileContent(yoRcFileContent);
  const jdlApplication: JDLApplication = convertApplicationToJDL(cleanedYoRcFileContent, runtime);
  if (!entities) {
    existingJDLObject.addApplication(jdlApplication);
    return existingJDLObject;
  }
  const jdlObject: JDLObject = convertEntitiesToJDL(entities);
  entities.forEach((entity: JSONEntity, entityName: string) => jdlApplication.addEntityName(entityName));
  jdlObject.addApplication(jdlApplication);
  return mergeJDLObjects(existingJDLObject, jdlObject);
}

function cleanYoRcFileContent(yoRcFileContent: YoRcFileContent): RawJDLJSONApplication {
  yoRcFileContent = structuredClone(yoRcFileContent);
  const blueprints = (yoRcFileContent as YoRcJHipsterApplicationContent)[YO_RC_CONFIG_KEY].blueprints?.map(blueprint => blueprint.name);
  const microfrontends = (yoRcFileContent as YoRcJHipsterApplicationContent)[YO_RC_CONFIG_KEY].microfrontends?.map(
    ({ baseName }) => baseName,
  );
  const result: RawJDLJSONApplication = {
    ...yoRcFileContent,
    [YO_RC_CONFIG_KEY]: removeFieldsWithNullishValues({ ...yoRcFileContent[YO_RC_CONFIG_KEY], blueprints, microfrontends }),
  };
  for (const key of Object.keys(result)) {
    result[key as keyof RawJDLJSONApplication] = removeFieldsWithNullishValues(result[key as keyof RawJDLJSONApplication]!);
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
