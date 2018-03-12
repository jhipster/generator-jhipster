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

const JDLApplication = require('../core/jdl_application');
const merge = require('../utils/object_utils').merge;
const fs = require('fs');
const FileUtils = require('../utils/file_utils');
const path = require('path');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportApplications,
  exportApplication
};

/**
 * Exports JDL applications to JDL files.
 * The 'path' key of the configuration object has an object for value, and paths are stored by application name.
 * For instance, the path to the 'my_application' app can be set with { paths: my_application: '/home/dev/apps' }
 * @param configuration keys:
 *        - applications, the applications to export (key: application name, value: JDLApplication)
 *        - paths, the paths where the applications will be exported (key: application name, value: path)
 */
function exportApplications(configuration) {
  if (!configuration || !configuration.applications) {
    throw new BuildException(
      exceptions.NullPointer,
      'Applications have to be passed to be exported.');
  }
  const merged = merge(defaults(), configuration);
  Object.keys(merged.applications).forEach((applicationName) => {
    exportApplication({
      application: merged.applications[applicationName],
      path: merged.paths[applicationName] || ''
    });
  });
}

/**
 * Exports JDL a application to a JDL file.
 * @param configuration keys:
 *        - application, the application to export
 *        - path, the path where the app will be.
 */
function exportApplication(configuration) {
  const merged = merge(defaults(), configuration);
  checkForErrors(merged.application);
  merged.application = setUpApplicationStructure(merged.application);
  writeApplicationFile(merged);
}

function defaults() {
  return {
    paths: {},
    path: ''
  };
}

function checkForErrors(application) {
  if (!application) {
    throw new BuildException(
      exceptions.NullPointer,
      'An application has to be passed to be exported.');
  }
  const errors = JDLApplication.checkValidity(application);
  if (errors.length !== 0) {
    throw new BuildException(
      exceptions.InvalidObject,
      `The application must be valid in order to be converted.\nErrors: ${errors.join(', ')}`);
  }
}

function setUpApplicationStructure(application) {
  let applicationToExport = JSON.parse(JSON.stringify(application));
  applicationToExport['generator-jhipster'] = applicationToExport.config;
  applicationToExport.entities = application.entities.toArray();
  applicationToExport['generator-jhipster'].testFrameworks = application.config.testFrameworks;
  applicationToExport['generator-jhipster'].languages = application.config.languages;
  applicationToExport = setUpArrayOptions(applicationToExport);
  applicationToExport = cleanUpOptions(applicationToExport);
  delete applicationToExport.config;
  return applicationToExport;
}


function setUpArrayOptions(application) {
  application['generator-jhipster'].testFrameworks = application['generator-jhipster'].testFrameworks.toArray();
  application['generator-jhipster'].languages = application['generator-jhipster'].languages.toArray();
  return application;
}

function cleanUpOptions(application) {
  if (!application['generator-jhipster'].frontEndBuilder) {
    delete application['generator-jhipster'].frontEndBuilder;
  }
  delete application['generator-jhipster'].path;
  return application;
}

function writeApplicationFile(configuration) {
  const applicationPath = path.join(configuration.path, configuration.application['generator-jhipster'].baseName);
  checkApplicationPath(applicationPath);
  createFolderIfNeeded(applicationPath);
  fs.writeFileSync(path.join(applicationPath, '.yo-rc.json'), JSON.stringify(configuration.application, null, 2));
}

function checkApplicationPath(applicationPath) {
  if (FileUtils.doesFileExist(applicationPath)) {
    throw new BuildException(
      exceptions.WrongDir,
      `A file located '${applicationPath}' already exists, so a folder of the same name can't be created`
      + ' for the application.');
  }
}

function createFolderIfNeeded(applicationPath) {
  if (!FileUtils.doesDirectoryExist(applicationPath)) {
    FileUtils.createDirectory(applicationPath);
  }
}
