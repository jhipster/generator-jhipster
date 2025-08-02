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

import { APPLICATION_TYPE_MICROSERVICE } from '../../../core/application-types.ts';
import { binaryOptions, unaryOptions } from '../../core/built-in-options/index.ts';
import type AbstractJDLOption from '../../core/models/abstract-jdl-option.js';
import type JDLApplication from '../../core/models/jdl-application.js';
import type JDLBinaryOption from '../../core/models/jdl-binary-option.js';
import type JDLObject from '../../core/models/jdl-object.js';
import type { ParsedJDLAnnotation } from '../../core/types/parsed.js';
import logger from '../../core/utils/objects/logger.ts';

const { FILTER, NO_FLUENT_METHOD, READ_ONLY, EMBEDDED, SKIP_CLIENT, SKIP_SERVER } = unaryOptions;

const {
  Options: { ANGULAR_SUFFIX, SEARCH, DTO },
} = binaryOptions;
const serviceClassOptionValue = binaryOptions.Values.service.SERVICE_CLASS;

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
export function convert(jdlOptionHolder: JDLOptionHolder): Map<string, any> {
  if (!jdlOptionHolder) {
    throw new Error('A JDL object or application must be passed to convert JDL options to JSON.');
  }
  convertedOptionContent = new Map();
  resolveEntityNamesForEachOption(jdlOptionHolder);
  setConvertedOptionContents(jdlOptionHolder);
  return convertedOptionContent;
}

function resolveEntityNamesForEachOption(jdlOptionHolder: JDLOptionHolder): void {
  jdlOptionHolder.forEachOption(jdlOption => {
    if (jdlOption.entityNames.has('*')) {
      jdlOption.setEntityNames(jdlOptionHolder.getEntityNames().filter(entityName => !jdlOption.excludedNames.has(entityName)));
    }
  });
}

function setConvertedOptionContents(jdlOptionHolder: JDLOptionHolder): void {
  jdlOptionHolder.forEachOption(jdlOption => {
    setOptionsToEachEntityName(jdlOption);
  });
}

function setOptionsToEachEntityName(jdlOption: AbstractJDLOption): void {
  const { key, value } = getJSONOptionKeyAndValue(jdlOption);

  jdlOption.entityNames.forEach(entityName => {
    setOptionToEntityName({ optionName: key, type: 'BINARY', optionValue: value }, entityName);
  });
  jdlOption.entityNames.forEach(entityName => {
    const serviceOptionValue = convertedOptionContent.get(entityName).service;
    if ((!serviceOptionValue || serviceOptionValue === 'no') && ([DTO, FILTER] as string[]).includes(jdlOption.name)) {
      logger.info(
        `The ${jdlOption.name} option is set for ${entityName}, the '${serviceClassOptionValue}' value for the ` +
          "'service' is gonna be set for this entity if no other value has been set.",
      );
      setOptionToEntityName({ optionName: 'service', type: 'BINARY', optionValue: serviceClassOptionValue }, entityName);
    }
  });

  if (jdlOption.name === SEARCH) {
    preventEntitiesFromBeingSearched(jdlOption.excludedNames);
  }
}

function getJSONOptionKeyAndValue(jdlOption: AbstractJDLOption): { key: string; value: string | boolean } {
  switch (jdlOption.name) {
    case SKIP_CLIENT:
    case SKIP_SERVER:
    case READ_ONLY:
    case EMBEDDED:
      return { key: jdlOption.name, value: true };
    case APPLICATION_TYPE_MICROSERVICE:
      return { key: 'microserviceName', value: (jdlOption as JDLBinaryOption).value };
    case NO_FLUENT_METHOD:
      return { key: 'fluentMethods', value: false };
    case ANGULAR_SUFFIX:
      return { key: 'angularJSSuffix', value: (jdlOption as JDLBinaryOption).value };
    case SEARCH:
      return { key: 'searchEngine', value: (jdlOption as JDLBinaryOption).value };
    case FILTER:
      return { key: 'jpaMetamodelFiltering', value: true };
    default:
      return { key: jdlOption.name, value: jdlOption.getType() === 'UNARY' ? true : (jdlOption as JDLBinaryOption).value };
  }
}

function preventEntitiesFromBeingSearched(entityNames: Set<string>) {
  entityNames.forEach(entityName => {
    setOptionToEntityName({ optionName: 'searchEngine', type: 'BINARY', optionValue: 'no' }, entityName);
  });
}

function setOptionToEntityName(option: ParsedJDLAnnotation, entityName: string): void {
  const { optionName, optionValue } = option;
  const optionContentForEntity = convertedOptionContent.get(entityName) ?? {};
  optionContentForEntity[optionName] = optionValue;
  convertedOptionContent.set(entityName, optionContentForEntity);
}
