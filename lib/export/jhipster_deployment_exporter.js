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

const JDLDeployment = require('../core/jdl_deployment');
const { GENERATOR_NAME, checkPath, createFolderIfNeeded, writeConfigFile } = require('./export_utils');

module.exports = {
  exportDeployments
};

/**
 * Exports JDL deployments to .yo-rc.json files in separate folders (based on deployment type).
 * @param deployments the deployments to export (key: deployment type, value: JDLDeployment- deployment config).
 * @return object[] exported deployments in their final form.
 */
function exportDeployments(deployments) {
  if (!deployments) {
    throw new Error('Deployments have to be passed to be exported.');
  }
  return Object.values(deployments).map(deployment => {
    checkForErrors(deployment);
    deployment = setUpDeploymentStructure(deployment);
    writeDeploymentConfigs(deployment);
    return deployment;
  });
}

function checkForErrors(deployment) {
  if (!deployment) {
    throw new Error('A deployment has to be passed to be exported.');
  }
  const errors = JDLDeployment.checkValidity(deployment);
  if (errors.length !== 0) {
    throw new Error(`The deployment must be valid in order to be exported.\nErrors: ${errors.join(', ')}`);
  }
}

function setUpDeploymentStructure(deployment) {
  const cleanDeployment = JSON.parse(JSON.stringify(deployment));
  let deploymentToExport = {};
  deploymentToExport[GENERATOR_NAME] = cleanDeployment;
  deploymentToExport[GENERATOR_NAME].appsFolders = deployment.appsFolders;
  deploymentToExport[GENERATOR_NAME].consoleOptions = deployment.consoleOptions;
  deploymentToExport[GENERATOR_NAME].clusteredDbApps = deployment.clusteredDbApps;
  deploymentToExport = setUpArrayOptions(deploymentToExport);
  return deploymentToExport;
}

function setUpArrayOptions(deployment) {
  deployment[GENERATOR_NAME].appsFolders = deployment[GENERATOR_NAME].appsFolders.toArray();
  deployment[GENERATOR_NAME].consoleOptions = deployment[GENERATOR_NAME].consoleOptions.toArray();
  deployment[GENERATOR_NAME].clusteredDbApps = deployment[GENERATOR_NAME].clusteredDbApps.toArray();
  return deployment;
}

/**
 * This function writes a Yeoman config file in a folder.
 * @param deployment the deployment.
 */
function writeDeploymentConfigs(deployment) {
  const folderName = deployment[GENERATOR_NAME].deploymentType;
  checkPath(folderName);
  createFolderIfNeeded(folderName);
  writeConfigFile(deployment, path.join(folderName, '.yo-rc.json'));
}
