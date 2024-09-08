/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import type JDLApplication from '../../../core/models/jdl-application.js';
import { GENERATOR_NAME } from '../export-utils.js';
import type {
  JDLJSONApplication,
  JDLJSONApplicationContent,
  PostProcessedJDLJSONApplication,
  RawJDLJSONApplication,
} from '../../../core/types/exporter.js';
import type JDLApplicationConfigurationOption from '../../../core/models/jdl-application-configuration-option.js';
import type JDLApplicationConfiguration from '../../../core/models/jdl-application-configuration.js';

/**
 * Exports JDL applications to JDL files in separate folders (based on application base names).
 * @param applications the applications to exporters (key: application name, value: a JDLApplication).
 * @return object[] exported applications in their final form.
 */
export function formatApplicationsToExport(applications: Record<string, JDLApplication>): PostProcessedJDLJSONApplication[] {
  if (!applications) {
    throw new Error('Applications have to be passed to be exported.');
  }
  return Object.values(applications).map(application => {
    return setUpApplicationStructure(application);
  });
}

/**
 * Exports JDL a application to a JDL file in the current directory.
 * @param {Object} application - the JDL application to export.
 * @return {Object} the exported application in its final form.
 */
export function formatApplicationToExport(application: JDLApplication): PostProcessedJDLJSONApplication {
  return setUpApplicationStructure(application);
}

function setUpApplicationStructure(application: JDLApplication): PostProcessedJDLJSONApplication {
  const applicationToExport: Partial<JDLJSONApplication> = {
    [GENERATOR_NAME]: {},
  };
  applicationToExport[GENERATOR_NAME] = getApplicationConfig(application);
  if (application.namespaceConfigs.length > 0) {
    applicationToExport.namespaceConfigs = getApplicationNamespaceConfig(application);
  }
  applicationToExport[GENERATOR_NAME].entities = application.getEntityNames();
  if (application.hasConfigurationOption('creationTimestamp')) {
    applicationToExport[GENERATOR_NAME].creationTimestamp = parseInt(application.getConfigurationOptionValue('creationTimestamp'), 10);
  }
  const postProcessedApplicationToExport: PostProcessedJDLJSONApplication = cleanUpOptions(applicationToExport as JDLJSONApplication);
  return postProcessedApplicationToExport;
}

function getApplicationConfig(application: JDLApplication): Partial<JDLJSONApplicationContent> {
  const result = {};
  application.forEachConfigurationOption((option: JDLApplicationConfigurationOption<any>) => {
    result[option.name] = option.getValue();
  });
  return result;
}

function getApplicationNamespaceConfig(application: JDLApplication) {
  if (application.namespaceConfigs.length === 0) {
    return undefined;
  }
  const result = {};
  application.forEachNamespaceConfiguration((configurationOption: JDLApplicationConfiguration) => {
    result[configurationOption.namespace!] = result[configurationOption.namespace!] ?? {};
    configurationOption.forEachOption(option => {
      result[configurationOption.namespace!][option.name] = option.getValue();
    });
  });
  return result;
}

function cleanUpOptions(application: RawJDLJSONApplication): PostProcessedJDLJSONApplication {
  const res: RawJDLJSONApplication = structuredClone(application);
  if (res[GENERATOR_NAME].frontEndBuilder) {
    delete res[GENERATOR_NAME].frontEndBuilder;
  }
  delete res.entityNames;
  if (application[GENERATOR_NAME].blueprints) {
    res[GENERATOR_NAME].blueprints = application[GENERATOR_NAME].blueprints.map(blueprintName => ({
      name: blueprintName,
    }));
  }
  if (application[GENERATOR_NAME].microfrontends) {
    res[GENERATOR_NAME].microfrontends = application[GENERATOR_NAME].microfrontends.map(baseName => ({
      baseName,
    }));
  }
  return res as unknown as PostProcessedJDLJSONApplication;
}
