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

import { fieldTypes } from '../../jhipster/index.ts';
import type { Entity } from '../../jhipster/types/entity.ts';

const {
  CommonDBTypes: { UUID },
} = fieldTypes;

export const entitySimple = {
  name: 'Simple',
  changelogDate: '20220129000100',
  jpaMetamodelFiltering: true,
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
} satisfies Entity;

export const entityAnotherSimple = {
  name: 'AnotherSimple',
  changelogDate: '20220129000200',
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
  dto: 'mapstruct',
  service: 'serviceImpl',
  pagination: 'pagination',
  clientRootFolder: 'test-root',
} satisfies Entity;

export const entitiesSimple = [entitySimple, entityAnotherSimple] satisfies Entity[];

export const entitiesWithRelationships = [
  entitySimple,
  entityAnotherSimple,
  {
    name: 'RelationshipWithSimple',
    changelogDate: '20220129001000',
    fields: [{ fieldName: 'twoName', fieldType: 'String' }],
    relationships: [{ relationshipName: 'relationship', otherEntityName: 'Simple', relationshipType: 'many-to-one' }],
  },
] satisfies Entity[];

export const entityCustomId = {
  name: 'EntityWithCustomId',
  changelogDate: '20220129002000',
  entityPackage: 'custom',
  fields: [
    {
      fieldName: 'id',
      fieldType: UUID,
    },
  ],
} satisfies Entity;

export const entitiesMicroservice = {
  name: 'Microservice',
  skipFakeData: true,
  changelogDate: '20220129000300',
  fields: [{ fieldName: 'simpleName', fieldType: 'String' }],
  microserviceName: 'microservice1',
  service: 'serviceClass',
  pagination: 'infinite-scroll',
} satisfies Entity;

export const entitySkipClient = {
  name: 'SkipClient',
  changelogDate: '20220129000400',
  skipClient: true,
  fields: [{ fieldName: 'skipClientName', fieldType: 'String' }],
} satisfies Entity;

export const entitiesServerSamples = [entitySimple, entityAnotherSimple, entityCustomId, entitiesMicroservice] satisfies Entity[];

export const entitiesClientSamples = [entitySimple, entityCustomId, entitiesMicroservice, entitySkipClient] satisfies Entity[];
