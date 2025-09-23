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
import entityOptions from '../../../jhipster/entity-options.ts';

const { MapperTypes, PaginationTypes, SearchTypes, ServiceTypes } = entityOptions;
const { MAPSTRUCT } = MapperTypes;
const NO_MAPPER = MapperTypes.NO;
const { SERVICE_CLASS, SERVICE_IMPL } = ServiceTypes;
const NO_SERVICE = ServiceTypes.NO;
const { ELASTICSEARCH, COUCHBASE, NO: NO_SEARCH } = SearchTypes;
const Options = {
  DTO: 'dto',
  SERVICE: 'service',
  PAGINATION: 'pagination',
  MICROSERVICE: 'microservice',
  SEARCH: 'search',
  ANGULAR_SUFFIX: 'angularSuffix',
  CLIENT_ROOT_FOLDER: 'clientRootFolder',
} as const satisfies Record<string, string>;

const optionNames = Object.values(Options);

const dtoValues = { MAPSTRUCT, NO: NO_MAPPER };
const serviceValues = { SERVICE_CLASS, SERVICE_IMPL, NO: NO_SERVICE };
const paginationValues = {
  PAGINATION: PaginationTypes.PAGINATION,
  'INFINITE-SCROLL': PaginationTypes.INFINITE_SCROLL,
  NO: PaginationTypes.NO,
};
const searchValues = { ELASTICSEARCH, COUCHBASE, NO: NO_SEARCH };

const Values = {
  dto: dtoValues,
  service: serviceValues,
  pagination: paginationValues,
  search: searchValues,
} as const;

const DefaultValues = {
  [Options.DTO]: Values[Options.DTO].NO,
  [Options.SERVICE]: Values[Options.SERVICE].NO,
  [Options.PAGINATION]: Values[Options.PAGINATION].NO,
};

function getOptionName(optionValue: string): string | undefined {
  return optionNames.find(optionName => (Values as Record<string, Record<string, string>>)[optionName]?.[optionValue]);
}

const OptionValues = {
  mapstruct: 'MAPSTRUCT',
  SIMPLE: 'simple',
  serviceClass: 'SERVICE_CLASS',
  serviceImpl: 'SERVICE_IMPL',
  pagination: 'PAGINATION',
  'infinite-scroll': 'INFINITE-SCROLL',
  elasticsearch: 'ELASTICSEARCH',
  couchbase: 'COUCHBASE',
} as const;

function forEach(passedFunction: (optionName: string) => void): void {
  if (!passedFunction) {
    throw new Error('A function has to be passed to loop over the binary options.');
  }
  optionNames.forEach(passedFunction);
}

function exists(passedOption: string | keyof typeof Values | 'microservice' | 'angularSuffix' | 'clientRootFolder', passedValue?: any) {
  return (
    !(optionNames as string[]).includes(passedOption) ||
    optionNames.some(
      option =>
        passedOption === option &&
        (passedOption === Options.MICROSERVICE ||
          passedOption === Options.ANGULAR_SUFFIX ||
          passedOption === Options.CLIENT_ROOT_FOLDER ||
          Object.values((Values as Record<string, Record<string, string>>)[option]).includes(passedValue)),
    )
  );
}

export default {
  Options,
  // TODO change the names
  DefaultValues,
  OptionValues,
  Values,
  exists,
  forEach,
  getOptionName,
};
