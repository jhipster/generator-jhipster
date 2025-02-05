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
import { javaMainPackageTemplatesBlock } from '../server/support/index.js';
import type Generator from './generator.js';

const domainFiles = [
  {
    condition: ctx => ctx.entityDomainLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['domain/_persistClass_.java.jhi.spring_data_neo4j'],
  },
];

const repositoryFiles = [
  {
    condition: ctx => ctx.entityPersistenceLayer,
    ...javaMainPackageTemplatesBlock('_entityPackage_'),
    templates: ['repository/_entityClass_Repository.java'],
  },
];

export const entityFiles = {
  domainFiles,
  repositoryFiles,
};

export function cleanupEntitiesTask() {}

export default async function writeEntitiesTask(this: Generator, { application, entities }) {
  for (const entity of entities.filter(entity => !entity.skipServer)) {
    await this.writeFiles({
      sections: entityFiles,
      context: { ...application, ...entity },
    });
  }
}
