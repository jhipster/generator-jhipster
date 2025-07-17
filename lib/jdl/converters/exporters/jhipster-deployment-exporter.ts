/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import path from 'path';
import { createFolderIfItDoesNotExist, doesFileExist } from '../../core/utils/file-utils.js';
import DeploymentValidator from '../validators/deployment-validator.js';
import type JDLDeployment from '../../core/models/jdl-deployment.js';
import type { YoRcJHipsterDeploymentContent } from '../../../jhipster/types/yo-rc.js';
import { GENERATOR_NAME, writeConfigFile } from './export-utils.js';

/**
 * Exports JDL deployments to .yo-rc.json files in separate folders (based on deployment type).
 * @param deployments the deployments to exporters (key: deployment type, value: JDLDeployment- deployment config).
 * @return object[] exported deployments in their final form.
 */
export default function exportDeployments(deployments: Record<string, JDLDeployment>): Partial<YoRcJHipsterDeploymentContent>[] {
  if (!deployments) {
    throw new Error('Deployments have to be passed to be exported.');
  }
  return Object.values(deployments).map(deployment => {
    checkForErrors(deployment);
    const yoRcDeployment: Partial<YoRcJHipsterDeploymentContent> = setUpDeploymentStructure(deployment);
    writeDeploymentConfigs(yoRcDeployment);
    return yoRcDeployment;
  });
}

function checkForErrors(deployment: JDLDeployment) {
  const validator = new DeploymentValidator();
  validator.validate(deployment);
}

function setUpDeploymentStructure(deployment: JDLDeployment) {
  let deploymentToExport: Partial<YoRcJHipsterDeploymentContent> = {};
  deploymentToExport[GENERATOR_NAME] = JSON.parse(JSON.stringify(deployment, null, 2).concat('\n'));
  deploymentToExport[GENERATOR_NAME]!.appsFolders = deployment.appsFolders;
  deploymentToExport[GENERATOR_NAME]!.clusteredDbApps = deployment.clusteredDbApps;
  deploymentToExport = setUpArrayOptions(deploymentToExport);
  return deploymentToExport;
}

function setUpArrayOptions(deployment: Partial<YoRcJHipsterDeploymentContent>) {
  deployment[GENERATOR_NAME]!.appsFolders = Array.from(deployment[GENERATOR_NAME]?.appsFolders || []);
  deployment[GENERATOR_NAME]!.clusteredDbApps = Array.from(deployment[GENERATOR_NAME]?.clusteredDbApps || []);
  return deployment;
}

/**
 * This function writes a Yeoman config file in a folder.
 * @param deployment the deployment.
 */
function writeDeploymentConfigs(deployment: Partial<YoRcJHipsterDeploymentContent>) {
  const folderName = deployment[GENERATOR_NAME]!.deploymentType!;
  if (doesFileExist(folderName)) {
    throw new Error(`A file named '${folderName}' already exists, so a folder of the same name can't be created for the application.`);
  }
  createFolderIfItDoesNotExist(folderName);
  writeConfigFile(deployment as YoRcJHipsterDeploymentContent, path.join(folderName, '.yo-rc.json'));
}
