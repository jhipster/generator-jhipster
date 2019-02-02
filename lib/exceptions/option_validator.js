/** Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { resolveEntityNames } = require('../core/abstract_jdl_option');
const { isValid } = require('../core/jdl_binary_option');
const { Options } = require('../core/jhipster/binary_options');
const { CASSANDRA } = require('../core/jhipster/database_types');
const CustomSet = require('../utils/objects/custom_set');

module.exports = {
  checkOptions
};

let configuration;

/**
 * Checks whether the passed JDL options are valid.
 * @param jdlObject the JDL object containing the options to check.
 * @param applicationSettings the application configuration.
 * @param applicationsPerEntityName applications per entity entity name.
 */
function checkOptions(
  { jdlObject, applicationSettings, applicationsPerEntityName } = {
    applicationSettings: {},
    applicationsPerEntityName: {}
  }
) {
  if (!jdlObject) {
    throw new Error('A JDL object has to be passed to check its options.');
  }
  configuration = {
    jdlObject,
    applicationSettings,
    applicationsPerEntityName
  };
  jdlObject.getOptions().forEach(option => {
    checkOption(option);
  });
  checkForDTOWithoutService();
}

function checkOption(jdlOption) {
  if (jdlOption.getType() === 'BINARY') {
    checkBinaryOption(jdlOption);
  }
}

function checkBinaryOption(jdlOption) {
  checkForNoValue(jdlOption);
  checkForInvalidValue(jdlOption);
  checkForPaginationInAppWithCassandra(jdlOption);
}

function checkForNoValue(jdlOption) {
  if (!jdlOption.value) {
    throw new Error(`The '${jdlOption.name}' option needs a value.`);
  }
}

function checkForInvalidValue(jdlOption) {
  if (!!jdlOption.value && !isValid(jdlOption)) {
    throw new Error(`The '${jdlOption.name}' option is not valid for value '${jdlOption.value}'.`);
  }
}

function checkForPaginationInAppWithCassandra(jdlOption) {
  if (configuration.applicationSettings.databaseType === CASSANDRA && jdlOption.name === Options.PAGINATION) {
    throw new Error("Pagination isn't allowed when the app uses Cassandra.");
  } else {
    jdlOption.entityNames.forEach(entityName => {
      const applications = configuration.applicationsPerEntityName[entityName];
      if (!applications) {
        return;
      }
      applications.forEach(jdlApplication => {
        if (jdlApplication.config.databaseType === CASSANDRA && jdlOption.name === Options.PAGINATION) {
          throw new Error(
            "Pagination isn't allowed when the app uses Cassandra, for entity: " +
              `'${entityName}' and application: '${jdlApplication.config.baseName}'.`
          );
        }
      });
    });
  }
}

function checkForDTOWithoutService() {
  const dtoOptions = configuration.jdlObject.getOptionsForName(Options.DTO);
  if (dtoOptions.length === 0) {
    return;
  }
  const entityNames = configuration.jdlObject.getEntityNames();
  const serviceEntities = configuration.jdlObject
    .getOptionsForName(Options.SERVICE)
    .reduce((accumulated, serviceOption) => {
      accumulated.addAll(resolveEntityNames(serviceOption, entityNames));
      return accumulated;
    }, new CustomSet());
  const dtoEntities = dtoOptions.reduce((accumulated, dtoOption) => {
    accumulated.addAll(resolveEntityNames(dtoOption, entityNames));
    return accumulated;
  }, new CustomSet());
  const difference = getDifferenceBetweenSets(dtoEntities, serviceEntities);
  if (difference.length !== 0) {
    throw new Error(
      `Selecting DTOs without services is forbidden, for entit${difference.length > 1 ? 'ies' : 'y'} ${difference.join(
        ', '
      )}.`
    );
  }
}

function getDifferenceBetweenSets(firstSet, secondSet) {
  const difference = [];

  firstSet.forEach(element => {
    if (!secondSet.has(element)) {
      difference.push(element);
    }
  });

  return difference;
}
