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
import entityOptions from './entity-options.js';

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
};

const optionNames = Object.values(Options);

const Values = {
  [Options.DTO]: { MAPSTRUCT, NO: NO_MAPPER },
  [Options.SERVICE]: { SERVICE_CLASS, SERVICE_IMPL, NO: NO_SERVICE },
  [Options.PAGINATION]: {
    PAGINATION: PaginationTypes.PAGINATION,
    'INFINITE-SCROLL': PaginationTypes.INFINITE_SCROLL,
    NO: PaginationTypes.NO,
  },
  [Options.SEARCH]: { ELASTICSEARCH, COUCHBASE, NO: NO_SEARCH },
};

const DefaultValues = {
  [Options.DTO]: Values[Options.DTO].NO,
  [Options.SERVICE]: Values[Options.SERVICE].NO,
  [Options.PAGINATION]: Values[Options.PAGINATION].NO,
};

function getOptionName(optionValue) {
  return optionNames.find(optionName => Values[optionName] && Values[optionName][optionValue]);
}

const OptionValues = {
  mapstruct: 'MAPSTRUCT',
  serviceClass: 'SERVICE_CLASS',
  serviceImpl: 'SERVICE_IMPL',
  pagination: 'PAGINATION',
  'infinite-scroll': 'INFINITE-SCROLL',
  elasticsearch: 'ELASTICSEARCH',
  couchbase: 'COUCHBASE',
};

function forEach(passedFunction) {
  if (!passedFunction) {
    throw new Error('A function has to be passed to loop over the binary options.');
  }
  optionNames.forEach(passedFunction);
}

function exists(passedOption, passedValue?: any) {
  return (
    !Object.values(Options).includes(passedOption) ||
    Object.values(Options).some(
      option =>
        passedOption === option &&
        (passedOption === Options.MICROSERVICE ||
          passedOption === Options.ANGULAR_SUFFIX ||
          passedOption === Options.CLIENT_ROOT_FOLDER ||
          Object.values(Values[option]).includes(passedValue))
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
