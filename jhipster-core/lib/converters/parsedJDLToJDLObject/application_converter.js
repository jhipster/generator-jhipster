/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

const { createJDLApplication } = require('../../core/jdl_application_factory');
const { convertOptions } = require('./option_converter');

module.exports = { convertApplications };

/**
 * Converts parsed applications to JDL applications.
 * @param {Array<Object>} parsedApplications - the parsed applications.
 * @param {Object} configuration - a configuration object.
 * @param {String} configuration.generatorVersion - the generator's version to use when converting applications.
 * @param {Number} configuration.creationTimestamp - a creation timestamp to use for entities.
 * @param {Array<String>} entityNames - the entity names.
 * @return {Array} the converted JDL applications.
 */
function convertApplications(parsedApplications, configuration = {}, entityNames = []) {
  if (!parsedApplications) {
    throw new Error('Applications have to be passed so as to be converted.');
  }
  return parsedApplications.map(parsedApplication => {
    const applicationWithCustomValues = addCustomValuesToApplication(parsedApplication, configuration);
    const applicationEntityNames = resolveApplicationEntityNames(parsedApplication, entityNames);
    const jdlApplication = createJDLApplication(applicationWithCustomValues.config);
    jdlApplication.addEntityNames(applicationEntityNames);
    const entityOptions = getEntityOptionsInApplication(parsedApplication);
    checkEntityNamesInOptions(
      jdlApplication.getConfigurationOptionValue('baseName'),
      entityOptions,
      applicationEntityNames
    );
    entityOptions.forEach(option => jdlApplication.addOption(option));
    return jdlApplication;
  });
}

function addCustomValuesToApplication(parsedApplication, configuration) {
  const application = { ...parsedApplication };
  if (configuration.generatorVersion) {
    application.config.jhipsterVersion = configuration.generatorVersion;
  }
  if (configuration.creationTimestamp) {
    application.config.creationTimestamp = configuration.creationTimestamp;
  }
  return application;
}

function resolveApplicationEntityNames(application, entityNames) {
  const { entityList, excluded } = application.entities;
  let applicationEntities = entityList;
  if (entityList.includes('*')) {
    applicationEntities = entityNames;
  }
  checkEntityNamesInApplication(application.config.baseName, applicationEntities, entityNames);
  if (excluded.length !== 0) {
    applicationEntities = applicationEntities.filter(entity => !excluded.includes(entity));
  }
  return applicationEntities;
}

/**
 * Checks whether the entity names used in the application are present in the JDL content.
 * @param {String} applicationName - the application's name
 * @param {Array<String>} entityNamesInApplication - the entity names declared in the application
 * @param {Array<String>} entityNames - all the entity names
 */

function checkEntityNamesInApplication(applicationName, entityNamesInApplication, entityNames) {
  const entityNameSet = new Set(entityNames);
  entityNamesInApplication.forEach(entityNameInApplication => {
    if (!entityNameSet.has(entityNameInApplication)) {
      throw new Error(
        `The entity ${entityNameInApplication} which is declared in ${applicationName}'s entity list doesn't exist.`
      );
    }
  });
}

function getEntityOptionsInApplication(parsedApplication) {
  return convertOptions(parsedApplication.options);
}

/**
 * Checks whether the entity names used in the options are present in the entity names declared for the application.
 * @param {String} applicationName - the application's name
 * @param {Array<JDLUnaryOption|JDLBinaryOption>} entityOptions - the options declared in the application
 * @param {Array<String>} entityNamesInApplication - the entity names declared in the application
 */
function checkEntityNamesInOptions(applicationName, entityOptions, entityNamesInApplication) {
  const entityNamesInApplicationSet = new Set(entityNamesInApplication);
  entityOptions.forEach(option => {
    const entityNamesForTheOption = option.resolveEntityNames(entityNamesInApplication);
    entityNamesForTheOption.forEach(entityNameForTheOption => {
      if (!entityNamesInApplicationSet.has(entityNameForTheOption)) {
        throw new Error(
          `The entity ${entityNameForTheOption} in the ${option.name} option isn't declared in ${applicationName}'s entity list.`
        );
      }
    });
  });
}
