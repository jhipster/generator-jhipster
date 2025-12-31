/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { APPLICATION_TYPE_MICROSERVICE } from '../../../core/application-types.ts';
import { removeFieldsWithNullishValues } from '../../../utils/object.ts';
import { readEntityFile } from '../../../utils/yo-rc.ts';
import type JDLJSONEntity from '../../core/basic-types/json-entity.ts';
import type { JhipsterJSONJDLExporterWrapper } from '../../core/types/exporter.ts';
import type { JSONEntity } from '../../core/types/json-config.ts';

let configuration: JhipsterJSONJDLExporterWrapper = {
  entities: [],
  application: {
    forSeveralApplications: false,
    name: '',
    type: '',
  },
};

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
    return [];
  }
  const subFolder = passedConfiguration.application.forSeveralApplications ? configuration.application.name : '';
  const entities = updateEntities(subFolder).map(entity => removeFieldsWithNullishValues(entity));
  if (shouldFilterOutEntitiesBasedOnMicroservice()) {
    return filterOutEntitiesByMicroservice(entities);
  }
  return entities;
}

function init(passedConfiguration: JhipsterJSONJDLExporterWrapper) {
  if (!passedConfiguration?.entities) {
    throw new Error('Entities have to be passed to be exported.');
  }
  configuration = passedConfiguration;
}

/**
 * Writes entities in a sub folder.
 * @param applicationPath the folder (to create) in which the JHipster entity folder will be.
 */
function updateEntities(applicationPath: string): JSONEntity[] {
  return configuration.entities.map((entity: JDLJSONEntity) => updateEntityToGenerateWithExistingOne(applicationPath, entity));
}

function updateEntityToGenerateWithExistingOne(applicationPath: string, entity: JDLJSONEntity): JSONEntity {
  try {
    const fileOnDisk = readEntityFile<JSONEntity>(applicationPath, entity.name);
    if (!entity.annotations?.changelogDate && fileOnDisk?.annotations?.changelogDate) {
      entity.annotations = entity.annotations || {};
      entity.annotations.changelogDate = fileOnDisk.annotations.changelogDate;
      return { ...fileOnDisk, ...entity } as JSONEntity;
    }
  } catch {
    // New entity
  }
  return { ...entity } as JSONEntity;
}

function shouldFilterOutEntitiesBasedOnMicroservice(): boolean {
  return configuration.application.type === APPLICATION_TYPE_MICROSERVICE && Boolean(configuration.application.name);
}

function filterOutEntitiesByMicroservice(entities: JSONEntity[]): JSONEntity[] {
  return entities.filter(
    entity => !(entity.microserviceName && entity.microserviceName.toLowerCase() !== configuration.application.name.toLowerCase()),
  );
}
