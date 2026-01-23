/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import type JDLApplicationConfigurationOption from '../../../core/models/jdl-application-configuration-option.ts';
import type JDLApplicationConfiguration from '../../../core/models/jdl-application-configuration.ts';
import type JDLApplication from '../../../core/models/jdl-application.ts';
import type {
  JDLJSONApplication,
  JDLJSONApplicationContent,
  PostProcessedJDLJSONApplication,
  RawJDLJSONApplication,
} from '../../../core/types/exporter.ts';
import { GENERATOR_NAME } from '../export-utils.ts';

/**
 * Exports JDL applications to JDL files in separate folders (based on application base names).
 * @param applications the applications to exporters (key: application name, value: a JDLApplication).
 * @return object[] exported applications in their final form.
 */
export function formatApplicationsToExport(applications: Record<string, JDLApplication>): PostProcessedJDLJSONApplication[] {
  if (!applications) {
    throw new Error('Applications have to be passed to be exported.');
  }
  return Object.values(applications).map(application => setUpApplicationStructure(application));
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
    applicationToExport[GENERATOR_NAME].creationTimestamp = Number.parseInt(
      application.getConfigurationOptionValue('creationTimestamp'),
      10,
    );
  }
  const postProcessedApplicationToExport: PostProcessedJDLJSONApplication = cleanUpOptions(applicationToExport as JDLJSONApplication);
  return postProcessedApplicationToExport;
}

function getApplicationConfig(application: JDLApplication): JDLJSONApplicationContent {
  const result: JDLJSONApplicationContent = {};
  application.forEachConfigurationOption((option: JDLApplicationConfigurationOption<any>) => {
    result[option.name] = option.getValue();
  });
  return result;
}

function getApplicationNamespaceConfig(application: JDLApplication) {
  if (application.namespaceConfigs.length === 0) {
    return undefined;
  }
  const result: Record<string, Record<string, any>> = {};
  application.forEachNamespaceConfiguration((configurationOption: JDLApplicationConfiguration) => {
    result[configurationOption.namespace!] ??= {};
    configurationOption.forEachOption(option => {
      result[configurationOption.namespace!][option.name] = option.getValue();
    });
  });
  return result;
}

function cleanUpOptions(application: RawJDLJSONApplication): PostProcessedJDLJSONApplication {
  const res = structuredClone(application);
  const blueprints = application[GENERATOR_NAME].blueprints?.map(blueprintName => ({
    name: blueprintName,
  }));
  const microfrontends = application[GENERATOR_NAME].microfrontends?.map(baseName => ({
    baseName,
  }));
  return { ...res, [GENERATOR_NAME]: { ...res[GENERATOR_NAME], blueprints, microfrontends } };
}
