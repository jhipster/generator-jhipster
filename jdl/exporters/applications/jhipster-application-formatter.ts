/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { GENERATOR_NAME } from '../export-utils.js';

/**
 * Exports JDL applications to JDL files in separate folders (based on application base names).
 * @param applications the applications to exporters (key: application name, value: a JDLApplication).
 * @param {Object} [configuration]
 * @return object[] exported applications in their final form.
 */
export function formatApplicationsToExport(applications, configuration) {
  if (!applications) {
    throw new Error('Applications have to be passed to be exported.');
  }
  return Object.values(applications).map(application => {
    // TODO: This is probably a bug, too many arguments given.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return setUpApplicationStructure(application, configuration);
  });
}

/**
 * Exports JDL a application to a JDL file in the current directory.
 * @param {Object} application - the JDL application to export.
 * @param {Object} [configuration]
 * @return {Object} the exported application in its final form.
 */
export function formatApplicationToExport(application, configuration = {}) {
  // TODO: This is probably a bug, too many arguments given.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return setUpApplicationStructure(application, configuration);
}

function setUpApplicationStructure(application) {
  let applicationToExport: any = {
    [GENERATOR_NAME]: {},
  };
  applicationToExport[GENERATOR_NAME] = getApplicationConfig(application);
  applicationToExport.entities = application.getEntityNames();
  if (application.hasConfigurationOption('creationTimestamp')) {
    applicationToExport[GENERATOR_NAME].creationTimestamp = parseInt(application.getConfigurationOptionValue('creationTimestamp'), 10);
  }
  applicationToExport = cleanUpOptions(applicationToExport);
  return applicationToExport;
}

function getApplicationConfig(application) {
  const result = {};
  application.forEachConfigurationOption(option => {
    result[option.name] = option.getValue();
  });
  return result;
}

function cleanUpOptions(application) {
  if (!application[GENERATOR_NAME].frontEndBuilder) {
    delete application[GENERATOR_NAME].frontEndBuilder;
  }
  delete application.entityNames;
  if (application[GENERATOR_NAME].blueprints) {
    application[GENERATOR_NAME].blueprints = application[GENERATOR_NAME].blueprints.map(blueprintName => ({
      name: blueprintName,
    }));
  }
  if (application[GENERATOR_NAME].microfrontends) {
    application[GENERATOR_NAME].microfrontends = application[GENERATOR_NAME].microfrontends.map(baseName => ({
      baseName,
    }));
  }
  return application;
}
