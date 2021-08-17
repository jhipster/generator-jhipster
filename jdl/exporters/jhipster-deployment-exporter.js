/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const path = require('path');
const { createFolderIfItDoesNotExist, doesFileExist } = require('../utils/file-utils');
const DeploymentValidator = require('../validators/deployment-validator');
const { GENERATOR_NAME, writeConfigFile } = require('./export-utils');

module.exports = {
  exportDeployments,
};

/**
 * Exports JDL deployments to .yo-rc.json files in separate folders (based on deployment type).
 * @param deployments the deployments to exporters (key: deployment type, value: JDLDeployment- deployment config).
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
  const validator = new DeploymentValidator();
  validator.validate(deployment);
}

function setUpDeploymentStructure(deployment) {
  let deploymentToExport = {};
  deploymentToExport[GENERATOR_NAME] = JSON.parse(JSON.stringify(deployment, null, 2).concat('\n'));
  deploymentToExport[GENERATOR_NAME].appsFolders = deployment.appsFolders;
  deploymentToExport[GENERATOR_NAME].clusteredDbApps = deployment.clusteredDbApps;
  deploymentToExport = setUpArrayOptions(deploymentToExport);
  return deploymentToExport;
}

function setUpArrayOptions(deployment) {
  deployment[GENERATOR_NAME].appsFolders = Array.from(deployment[GENERATOR_NAME].appsFolders);
  deployment[GENERATOR_NAME].clusteredDbApps = Array.from(deployment[GENERATOR_NAME].clusteredDbApps);
  return deployment;
}

/**
 * This function writes a Yeoman config file in a folder.
 * @param deployment the deployment.
 */
function writeDeploymentConfigs(deployment) {
  const folderName = deployment[GENERATOR_NAME].deploymentType;
  if (doesFileExist(folderName)) {
    throw new Error(`A file named '${folderName}' already exists, so a folder of the same name can't be created for the application.`);
  }
  createFolderIfItDoesNotExist(folderName);
  writeConfigFile(deployment, path.join(folderName, '.yo-rc.json'));
}
