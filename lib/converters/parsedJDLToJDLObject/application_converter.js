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
  if (excluded.length !== 0) {
    applicationEntities = applicationEntities.filter(entity => !excluded.includes(entity));
  }
  return applicationEntities;
}
