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
const fs = require('fs');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportApplications,
  exportApplication
};

function exportApplications(applications) {
  if (!applications) {
    throw new BuildException(
      exceptions.NullPointer,
      'Applications have to be passed to be exported.');
  }
  Object.keys(applications).forEach((applicationName) => {
    exportApplication(applications[applicationName]);
  });
}

function exportApplication(application) {
  checkForErrors(application);
  setUpApplicationStructure(application);
  writeApplicationFile(application);
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
  application = JSON.parse(JSON.stringify(application));
  application['generator-jhipster'] = application.config;
  application['generator-jhipster'].promptValues = {
    packageName: application.config.packageName
  };
  delete application.config;
}

function writeApplicationFile(application) {
  fs.writeFileSync('.yo-rc.json', JSON.stringify(application, null, 2));
}
