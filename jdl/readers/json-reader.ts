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

import fs from 'fs';
import { convertEntitiesToJDL } from '../converters/json-to-jdl-entity-converter.js';
import { convertServerOptionsToJDL } from '../converters/json-to-jdl-option-converter.js';
import mergeJDLObjects from '../models/jdl-object-merger.js';
import { applicationOptions } from '../jhipster/index.mjs';
import { doesDirectoryExist } from '../utils/file-utils.js';
import { readJSONFile } from './json-file-reader.js';
import JDLObject from '../models/jdl-object.js';

const { OptionNames } = applicationOptions;
/* Parse the given jhipster app dir and return a JDLObject */
export default function parseFromDir(dir: string): JDLObject {
  if (!dir) {
    throw new Error('The app directory must be passed to read JSON files.');
  }
  if (!doesDirectoryExist(dir)) {
    throw new Error(`The passed directory '${dir}' must exist and must be a directory to read JSON files.`);
  }
  const entityDir = `${dir}/.jhipster`;
  if (!doesDirectoryExist(entityDir)) {
    throw new Error(`'${entityDir}' must exist as a directory.`);
  }
  const entities = new Map();
  const files = fs.readdirSync(entityDir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const entityName = file.slice(0, file.length - 5);
      try {
        entities.set(entityName, readJSONFile(`${entityDir}/${file}`));
      } catch (error) {
        // Not an entity file, not adding
      }
    }
  });
  const applicationOptions = readJSONFile(`${dir}/.yo-rc.json`)['generator-jhipster'];

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const jdlObject = convertServerOptionsToJDL(applicationOptions);
  const skippedUserManagement = !!applicationOptions[OptionNames.SKIP_USER_MANAGEMENT];
  const convertedJDLObject = convertEntitiesToJDL({ entities, skippedUserManagement });
  return mergeJDLObjects(jdlObject, convertedJDLObject);
}
