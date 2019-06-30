/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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

const path = require('path');
const AbstractJDLApplication = require('../core/abstract_jdl_application');
const { GENERATOR_NAME, checkPath, createFolderIfNeeded, writeConfigFile } = require('./export_utils');

module.exports = {
  exportApplications,
  exportApplication
};

/**
 * Exports JDL applications to JDL files in separate folders (based on application base names).
 * @param applications the applications to exporters (key: application name, value: a concrete implem of
 *                     AbstractJDLApplication).
 * @return object[] exported applications in their final form.
 */
function exportApplications(applications) {
  if (!applications) {
    throw new Error('Applications have to be passed to be exported.');
  }
  return Object.values(applications).map(application => {
    checkForErrors(application);
    application = setUpApplicationStructure(application);
    writeApplicationFileForMultipleApplications(application);
    return application;
  });
}

/**
 * Exports JDL a application to a JDL file in the current directory.
 * @param application, the JDL application to exporters.
 * @return the exported application in its final form.
 */
function exportApplication(application) {
  checkForErrors(application);
  const formattedApplication = setUpApplicationStructure(application);
  writeConfigFile(formattedApplication);
  return formattedApplication;
}

function checkForErrors(application) {
  if (!application) {
    throw new Error('An application has to be passed to be exported.');
  }
  const errors = AbstractJDLApplication.checkValidity(application);
  if (errors.length !== 0) {
    throw new Error(`The application must be valid in order to be exported.\nErrors: ${errors.join(', ')}`);
  }
}

function setUpApplicationStructure(application) {
  let applicationToExport = JSON.parse(JSON.stringify(application));
  applicationToExport[GENERATOR_NAME] = applicationToExport.config;
  applicationToExport.entities = Array.from(application.getEntityNames());
  applicationToExport[GENERATOR_NAME].testFrameworks = application.config.testFrameworks;
  applicationToExport[GENERATOR_NAME].languages = application.config.languages;
  applicationToExport = setUpArrayOptions(applicationToExport);
  applicationToExport = cleanUpOptions(applicationToExport);
  delete applicationToExport.config;
  return applicationToExport;
}

function setUpArrayOptions(application) {
  application[GENERATOR_NAME].testFrameworks = Array.from(application[GENERATOR_NAME].testFrameworks);
  application[GENERATOR_NAME].languages = Array.from(application[GENERATOR_NAME].languages);
  return application;
}

function cleanUpOptions(application) {
  if (!application[GENERATOR_NAME].frontEndBuilder) {
    delete application[GENERATOR_NAME].frontEndBuilder;
  }
  delete application.entityNames;
  return application;
}

/**
 * This function writes a Yeoman config file in an application folder.
 * @param application the application.
 */
function writeApplicationFileForMultipleApplications(application) {
  const applicationBaseName = application[GENERATOR_NAME].baseName;
  checkPath(applicationBaseName);
  createFolderIfNeeded(applicationBaseName);
  writeConfigFile(application, path.join(applicationBaseName, '.yo-rc.json'));
}
