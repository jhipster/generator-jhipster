/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

const JDLObject = require('../core/jdl_object');
const { createJDLApplication } = require('../core/jdl_application_factory');

const GENERATOR_NAME = 'generator-jhipster';

module.exports = {
  convertApplicationToJDL,
  convertApplicationsToJDL
};

function convertApplicationsToJDL({ applications, jdl } = {}) {
  const jsonApplications = applications || [];
  const jdlObject = jdl || new JDLObject();
  jsonApplications.forEach(application => {
    const convertedApplication = convertApplicationToJDL({ application });
    jdlObject.addApplication(convertedApplication);
  });
  return jdlObject;
}

function convertApplicationToJDL({ application } = {}) {
  return createJDLApplication(application[GENERATOR_NAME]);
}
