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

import type { JSONEntity } from '../../core/types/json-config.js';
import type { JhipsterJSONJDLExporterWrapper } from '../../core/types/exporter.js';
import applicationTypes from '../../../jhipster/application-types.js';
import { readEntityFile } from '../../../utils/yo-rc.js';

let configuration: any = {};

/**
 * Exports the passed entities to JSON.
 * @param {Object} passedConfiguration - the object having the keys:
 * @param {Array<JSONEntity>} passedConfiguration.entities - the entity objects to export.
 * @param {Object} passedConfiguration.application - the application where the entities should be exported.
 * @param {Boolean} passedConfiguration.application.forSeveralApplications - whether to create the .jhipster folder
 *          inside a specific application's folder.
 * @param {String} passedConfiguration.application.name - the application's name, where the entities should be exported.
 * @param {String} passedConfiguration.application.type - the application's type.
 * @returns {Array<JSONEntity>} the exported entities.
 */
export default function exportEntities(passedConfiguration: JhipsterJSONJDLExporterWrapper): JSONEntity[] {
  init(passedConfiguration);
  if (configuration.entities.length === 0) {
    return configuration.entities;
  }
  const subFolder = passedConfiguration.application.forSeveralApplications ? configuration.application.name : '';
  configuration.entities = updateEntities(subFolder);
  if (shouldFilterOutEntitiesBasedOnMicroservice()) {
    configuration.entities = filterOutEntitiesByMicroservice();
  }
  return configuration.entities;
}

function init(passedConfiguration: JhipsterJSONJDLExporterWrapper) {
  if (!passedConfiguration?.entities) {
    throw new Error('Entities have to be passed to be exported.');
  }
  configuration = passedConfiguration;
}

/**
 * Writes entities in a sub folder.
 * @param subFolder the folder (to create) in which the JHipster entity folder will be.
 */
function updateEntities(applicationPath: string): JSONEntity[] {
  return configuration.entities.map((entity: JSONEntity) => {
    return updateEntityToGenerateWithExistingOne(applicationPath, entity);
  });
}

function updateEntityToGenerateWithExistingOne(applicationPath: string, entity: JSONEntity): JSONEntity {
  try {
    const fileOnDisk = readEntityFile<JSONEntity>(applicationPath, entity.name);
    if (!entity.annotations?.changelogDate && fileOnDisk?.annotations?.changelogDate) {
      entity.annotations = entity.annotations || {};
      entity.annotations.changelogDate = fileOnDisk.annotations.changelogDate;
      return { ...fileOnDisk, ...entity };
    }
  } catch {
    // New entity
  }
  return entity;
}

function shouldFilterOutEntitiesBasedOnMicroservice(): string {
  return (
    configuration.application.type && configuration.application.type === applicationTypes.MICROSERVICE && configuration.application.name
  );
}

function filterOutEntitiesByMicroservice(): JSONEntity[] {
  return configuration.entities.filter(entity => {
    return !(entity.microserviceName && entity.microserviceName.toLowerCase() !== configuration.application.name.toLowerCase());
  });
}
