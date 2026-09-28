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
import { getDefaultJDLDeploymentDefaults } from '../../../jdl-config/jhipster-jdl-config.ts';
import { customCamelCase } from '../../../utils/string-utils.ts';
import type { ImportTarget } from '../../convert-jdl-to-files.ts';
import { binaryOptions } from '../../core/built-in-options/index.ts';
import logger from '../../core/utils/objects/logger.ts';

import type { JDLFiles } from './ast-to-files.ts';

const GENERATOR_JHIPSTER = 'generator-jhipster';
const { SERVICE_CLASS } = binaryOptions.Values.service;

/*
 * TODO: the compatibility defaults are customizations of the generators, and each one should move to the generator it
 * belongs to, rather than to the jdl conversion or the jdl generator: the client root folder of a microservice entity to
 * the preparation of the entities (base-application, as the microservice name already is), the defaults of a deployment
 * type to the deployment generators, the service of an entity with a dto or filtering to the server generators. A
 * default leaves this layer once its generator applies it.
 */

/** The `.yo-rc.json` of an application: it has the blueprints and microfrontends keys, undefined without them, as the importer wrote them. */
function applicationFile({ [GENERATOR_JHIPSTER]: config, ...namespaceConfigs }: Record<string, any>) {
  return { ...namespaceConfigs, [GENERATOR_JHIPSTER]: { ...config, blueprints: config.blueprints, microfrontends: config.microfrontends } };
}

/** The options of a deployment, in the order the importer wrote them; the other ones follow. */
const DEPLOYMENT_KEYS = [
  'deploymentType',
  'appsFolders',
  'directoryPath',
  'gatewayType',
  'kubernetesServiceType',
  'istio',
  'ingressDomain',
  'ingressType',
  'storageType',
  'monitoring',
  'clusteredDbApps',
];

/** The attributes of an object, those of keys first, in their order, the undefined ones left out. */
function inOrder(object: Record<string, any>, keys: string[]): Record<string, any> {
  const ordered: Record<string, any> = {};
  for (const key of [...keys, ...Object.keys(object)]) {
    if (object[key] !== undefined && !(key in ordered)) ordered[key] = object[key];
  }
  return ordered;
}

/** The `.yo-rc.json` of a deployment: the defaults of its type, then its options. */
function deploymentFile({ [GENERATOR_JHIPSTER]: config }: Record<string, any>) {
  return {
    [GENERATOR_JHIPSTER]: inOrder(
      {
        ...getDefaultJDLDeploymentDefaults(config.deploymentType),
        ...config,
        appsFolders: config.appsFolders ?? [],
        clusteredDbApps: config.clusteredDbApps ?? [],
      },
      DEPLOYMENT_KEYS,
    ),
  };
}

/** The attributes of a json entity, in the order the importer wrote them; the other ones follow. */
const ENTITY_KEYS = [
  'annotations',
  'name',
  'fields',
  'relationships',
  'documentation',
  'entityTableName',
  'dto',
  'pagination',
  'service',
  'jpaMetamodelFiltering',
  'fluentMethods',
  'readOnly',
  'embedded',
  'clientRootFolder',
  'microserviceName',
  'angularJSSuffix',
  'skipServer',
  'skipClient',
  'applications',
];

/** The relationship types, in the order the importer wrote the relationships of each side. */
const RELATIONSHIP_TYPES = ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'];

/** The type of the relationship a json relationship is a side of. */
const relationshipTypeOf = ({ relationshipSide, relationshipType }: Record<string, any>): string =>
  relationshipSide === 'right' ? relationshipType.split('-').reverse().join('-') : relationshipType;

/** The key of a relationship, from either side: the source entity, its relationship name, the destination entity. */
const relationshipKey = (source: string, relationshipName: string, destination: string) => `${source}|${relationshipName}|${destination}`;

/** An entity with a dto, or filtering, gets a service class, unless it declares a service. */
function withServiceClass(entity: Record<string, any>) {
  if (entity.service !== undefined || (entity.dto === undefined && !entity.jpaMetamodelFiltering)) {
    return entity;
  }
  logger.info(
    `The ${entity.dto === undefined ? 'filter' : 'dto'} option is set for ${entity.name}, the '${SERVICE_CLASS}' value for the ` +
      "'service' is gonna be set for this entity if no other value has been set.",
  );
  return { ...entity, service: SERVICE_CLASS };
}

/**
 * Adds to the json files of a jdl the values the jdl does not declare, and shapes them as the importer wrote them, for
 * the generators and the projects written before:
 * - the defaults of a deployment type, the service of an entity with a dto or filtering;
 * - the entities imported into a microservice get its name, unless the jdl names microservices, and its client root
 *   folder, unless the jdl gives them another; a microservice leaves out the entities of another microservice;
 * - an entity lists the applications it is in, `*` for a jdl without application, and has annotations;
 * - the relationships of an entity are ordered by side, then by type; the destination side of a relationship to a
 *   built-in entity has the builtInEntity option;
 * - the attributes of an entity, and the options of a deployment, are in the order the importer wrote them.
 * @param target - the application the jdl is imported into.
 */
export function applyCompatibilityDefaults({ files, relativeRoot }: JDLFiles, target: ImportTarget = {}): JDLFiles {
  const entries = Object.entries(files).map(([path, content]) => {
    const [folder, ...rest] = path.split('/');
    return { path, folder, yoRc: rest.length === 1 && rest[0] === '.yo-rc.json', content };
  });
  const applications = new Map(
    entries
      .filter(({ yoRc, content }) => yoRc && !content[GENERATOR_JHIPSTER]?.deploymentType)
      .map(({ folder, content }) => [folder, content[GENERATOR_JHIPSTER]]),
  );
  const entityApplications = new Map<string, string[]>();
  for (const { baseName, entities = [] } of applications.values()) {
    for (const name of entities) entityApplications.set(name, [...(entityApplications.get(name) ?? []), baseName]);
  }
  const entityEntries = entries.filter(({ yoRc }) => !yoRc);
  const microservice = target.applicationType === APPLICATION_TYPE_MICROSERVICE ? target.applicationName : undefined;
  const namesMicroservices = entityEntries.some(({ content }) => content.microserviceName !== undefined);
  const builtInRelationships = new Set(
    entityEntries.flatMap(({ content }) =>
      content.relationships
        .filter((relationship: Record<string, any>) => relationship.relationshipWithBuiltInEntity)
        .map(({ relationshipName, otherEntityName }: Record<string, any>) =>
          relationshipKey(customCamelCase(content.name), relationshipName, otherEntityName),
        ),
    ),
  );

  const result: JDLFiles['files'] = {};
  for (const { path, folder, yoRc, content } of entries) {
    if (yoRc) {
      result[path] = content[GENERATOR_JHIPSTER]?.deploymentType ? deploymentFile(content) : applicationFile(content);
      continue;
    }
    let entity = withServiceClass(content);
    if (microservice) {
      entity = {
        ...entity,
        microserviceName: entity.microserviceName ?? (namesMicroservices ? undefined : microservice),
        clientRootFolder: entity.clientRootFolder ?? microservice,
      };
    }
    const application = applications.get(folder);
    const owner = application ? application.applicationType === APPLICATION_TYPE_MICROSERVICE && application.baseName : microservice;
    if (owner && entity.microserviceName && entity.microserviceName.toLowerCase() !== owner.toLowerCase()) continue;

    const relationships = entity.relationships
      .map((relationship: Record<string, any>) =>
        (
          relationship.relationshipSide === 'right' &&
          builtInRelationships.has(
            relationshipKey(relationship.otherEntityName, relationship.otherEntityRelationshipName, customCamelCase(entity.name)),
          )
        ) ?
          { ...relationship, options: { builtInEntity: true, ...relationship.options } }
        : relationship,
      )
      .map((relationship: Record<string, any>, index: number) => ({ relationship, index }))
      .sort(
        (a: any, b: any) =>
          Number(a.relationship.relationshipSide === 'right') - Number(b.relationship.relationshipSide === 'right') ||
          RELATIONSHIP_TYPES.indexOf(relationshipTypeOf(a.relationship)) - RELATIONSHIP_TYPES.indexOf(relationshipTypeOf(b.relationship)) ||
          a.index - b.index,
      )
      .map(({ relationship }: { relationship: Record<string, any> }) => relationship);
    const withDefaults: Record<string, any> = {
      ...entity,
      annotations: entity.annotations ?? {},
      relationships,
      applications: application ? (entityApplications.get(entity.name) ?? []) : ['*'],
    };
    result[path] = inOrder(withDefaults, ENTITY_KEYS);
  }
  return { files: result, relativeRoot };
}
