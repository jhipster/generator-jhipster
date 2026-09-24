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
import type { JDLOptionsDefinition } from '../jdl/core/parsing/types/parsing.ts';

const defaultJDLEntityConfig: JDLOptionsDefinition = Object.freeze({
  configs: {
    skipClient: { description: 'Skip the client code of the entities', jdl: { type: 'unary' } },
    skipServer: { description: 'Skip the server code of the entities', jdl: { type: 'unary' } },
    noFluentMethod: { description: 'Generate no fluent setters', jdl: { type: 'unary' } },
    readOnly: { description: 'Read only entities', jdl: { type: 'unary' } },
    filter: { description: 'Filtering of the entities with the JPA metamodel', jdl: { type: 'unary' } },
    embedded: { description: 'Embedded entities', jdl: { type: 'unary' } },
    dto: { description: 'Data transfer objects', choices: ['mapstruct', 'no'], default: 'no', jdl: { type: 'binary' } },
    service: {
      description: 'Service layer',
      choices: ['serviceClass', 'serviceImpl', 'no'],
      default: 'no',
      jdl: { type: 'binary' },
    },
    pagination: {
      description: 'Pagination of the entities',
      choices: ['pagination', 'infinite-scroll', 'no'],
      default: 'no',
      jdl: { type: 'binary', deprecatedKeywords: ['paginate'] },
    },
    microservice: { description: 'Microservice the entities belong to', jdl: { type: 'binary' } },
    search: { description: 'Search engine of the entities', choices: ['elasticsearch', 'couchbase', 'no'], jdl: { type: 'binary' } },
    angularSuffix: { description: 'Suffix of the entities in the client', jdl: { type: 'binary' } },
    clientRootFolder: { description: 'Client folder of the entities', jdl: { type: 'binary' } },
  },
});

/**
 * The entity JDL definitions: the option statements of entities, shaped like a command. Hard coded for now, the lexer
 * and the parser take them from here rather than from their own lists; the generators do not declare entity options.
 */
export const getDefaultJDLEntityConfig = (): Readonly<JDLOptionsDefinition> => defaultJDLEntityConfig;
