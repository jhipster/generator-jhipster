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

const fs = require('fs');
const path = require('path');
const AbstractJDLApplication = require('../core/abstract_jdl_application');
const FileUtils = require('../utils/file_utils');

module.exports = {
  exportApplications,
  exportApplication
};

const GENERATOR_NAME = 'generator-jhipster';

/**
 * Exports JDL applications to JDL files in separate folders (based on application base names).
 * @param applications the applications to export (key: application name, value: a concrete implem of
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
 * @param application, the JDL application to export.
 * @return the exported application in its final form.
 */
function exportApplication(application) {
  checkForErrors(application);
  const formattedApplication = setUpApplicationStructure(application);
  writeApplicationFile(formattedApplication);
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
  applicationToExport.entities = application.getEntityNames();
  applicationToExport[GENERATOR_NAME].testFrameworks = application.config.testFrameworks;
  applicationToExport[GENERATOR_NAME].languages = application.config.languages;
  applicationToExport = setUpArrayOptions(applicationToExport);
  applicationToExport = cleanUpOptions(applicationToExport);
  delete applicationToExport.config;
  return applicationToExport;
}

function setUpArrayOptions(application) {
  application[GENERATOR_NAME].testFrameworks = application[GENERATOR_NAME].testFrameworks.toArray();
  application[GENERATOR_NAME].languages = application[GENERATOR_NAME].languages.toArray();
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
 * This function writes a Yeoman config file in the current folder.
 * @param application the application.
 * @param yoRcPath the yeoman conf file path
 */
function writeApplicationFile(application, yoRcPath = '.yo-rc.json') {
  let newYoRc = { ...application };
  if (FileUtils.doesFileExist(yoRcPath)) {
    const yoRc = JSON.parse(fs.readFileSync(yoRcPath, { encoding: 'utf-8' }));
    newYoRc = {
      ...yoRc,
      ...application,
      [GENERATOR_NAME]: {
        ...yoRc[GENERATOR_NAME],
        ...application[GENERATOR_NAME]
      }
    };
  }
  fs.writeFileSync(yoRcPath, JSON.stringify(newYoRc, null, 2));
}

/**
 * This function writes a Yeoman config file in an application folder.
 * The main difference between this function and 'writeApplicationFile' is that the latter should
 * be used when only one application should be generated.
 * @param application the application.
 */
function writeApplicationFileForMultipleApplications(application) {
  const applicationBaseName = application[GENERATOR_NAME].baseName;
  checkApplicationPath(applicationBaseName);
  createFolderIfNeeded(applicationBaseName);
  writeApplicationFile(application, path.join(applicationBaseName, '.yo-rc.json'));
}

function checkApplicationPath(applicationPath) {
  if (FileUtils.doesFileExist(applicationPath)) {
    throw new Error(
      `A file located '${applicationPath}' already exists, so a folder of the same name can't be created` +
        ' for the application.'
    );
  }
}

function createFolderIfNeeded(applicationPath) {
  if (!FileUtils.doesDirectoryExist(applicationPath)) {
    FileUtils.createDirectory(applicationPath);
  }
}
