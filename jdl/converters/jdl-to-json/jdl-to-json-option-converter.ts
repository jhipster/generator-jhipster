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

import logger from '../../utils/objects/logger.js';
import UnaryOptions from '../../jhipster/unary-options.js';

import BinaryOptions from '../../jhipster/binary-options.js';
import EntityOptions from '../../jhipster/entity-options.js';
import JDLObject from '../../models/jdl-object.js';
import JDLApplication from '../../models/jdl-application.js';

const { FILTER, NO_FLUENT_METHOD, READ_ONLY, EMBEDDED, SKIP_CLIENT, SKIP_SERVER } = UnaryOptions;

const { ServiceTypes } = EntityOptions;

const NO_SERVICE = ServiceTypes.NO;
const {
  Options: { ANGULAR_SUFFIX, MICROSERVICE, SEARCH, DTO },
} = BinaryOptions;
const serviceClassOptionValue = BinaryOptions.Values.service.SERVICE_CLASS;

const USER = 'user';

let convertedOptionContent: Map<string, any>;

export default { convert };

type JDLOptionHolder = JDLObject | JDLApplication;

/**
 * Converts JDL options to JSON content to be set in JSON entities.
 * This function takes a single parameter: a JDL option holder. This holder is a class or an object responding to these
 * calls:
 *   - forEachOption, to loop over JDL options
 *   - getEntityNames, to get the declared entity names
 * @param jdlOptionHolder - a JDL object (a JDLObject or a JDLApplication) containing the options.
 * @return {Map<String, Object>} a map having for keys entity names and for values the JSON option contents.
 */
export function convert(jdlOptionHolder: JDLOptionHolder) {
  if (!jdlOptionHolder) {
    throw new Error('A JDL object or application must be passed to convert JDL options to JSON.');
  }
  convertedOptionContent = new Map();
  resolveEntityNamesForEachOption(jdlOptionHolder);
  setConvertedOptionContents(jdlOptionHolder);
  return convertedOptionContent;
}

function resolveEntityNamesForEachOption(jdlOptionHolder: JDLOptionHolder) {
  jdlOptionHolder.forEachOption(jdlOption => {
    if (jdlOption.entityNames.has('*')) {
      jdlOption.setEntityNames(
        jdlOptionHolder.getEntityNames().filter(entityName => !jdlOption.excludedNames.has(entityName) && entityName.toLowerCase() !== USER)
      );
    }
  });
}

function setConvertedOptionContents(jdlOptionHolder: JDLOptionHolder) {
  jdlOptionHolder.forEachOption(jdlOption => {
    setOptionsToEachEntityName(jdlOption);
  });
}

function setOptionsToEachEntityName(jdlOption) {
  const { key, value } = getJSONOptionKeyAndValue(jdlOption);

  jdlOption.entityNames.forEach(entityName => {
    setOptionToEntityName({ optionName: key, optionValue: value }, entityName);
  });
  jdlOption.entityNames.forEach(entityName => {
    const serviceOptionValue = convertedOptionContent.get(entityName).service;
    if ((!serviceOptionValue || serviceOptionValue === NO_SERVICE) && [DTO, FILTER].includes(jdlOption.name)) {
      logger.info(
        `The ${jdlOption.name} option is set for ${entityName}, the '${serviceClassOptionValue}' value for the ` +
          "'service' is gonna be set for this entity if no other value has been set."
      );
      setOptionToEntityName({ optionName: 'service', optionValue: serviceClassOptionValue }, entityName);
    }
  });

  if (jdlOption.name === SEARCH) {
    preventEntitiesFromBeingSearched(jdlOption.excludedNames);
  }
}

function getJSONOptionKeyAndValue(jdlOption) {
  switch (jdlOption.name) {
    case SKIP_CLIENT:
    case SKIP_SERVER:
    case READ_ONLY:
    case EMBEDDED:
      return { key: jdlOption.name, value: true };
    case MICROSERVICE:
      return { key: 'microserviceName', value: jdlOption.value };
    case NO_FLUENT_METHOD:
      return { key: 'fluentMethods', value: false };
    case ANGULAR_SUFFIX:
      return { key: 'angularJSSuffix', value: jdlOption.value };
    case SEARCH:
      return { key: 'searchEngine', value: jdlOption.value };
    case FILTER:
      return { key: 'jpaMetamodelFiltering', value: true };
    default:
      return { key: jdlOption.name, value: jdlOption.value || true };
  }
}

function preventEntitiesFromBeingSearched(entityNames) {
  entityNames.forEach(entityName => {
    setOptionToEntityName({ optionName: 'searchEngine', optionValue: false }, entityName);
  });
}

function setOptionToEntityName(option, entityName: string) {
  const { optionName, optionValue } = option;
  const optionContentForEntity = convertedOptionContent.get(entityName) || {};
  optionContentForEntity[optionName] = optionValue;
  convertedOptionContent.set(entityName, optionContentForEntity);
}
