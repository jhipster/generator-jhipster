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
import { uniqBy } from 'lodash-es';
import { applicationOptions } from '../jhipster/index.js';
import { readCurrentPathYoRcFile } from '../utils/yo-rc.js';
import type { ApplicationType } from '../core/application-types.ts';
import ParsedJDLToJDLObjectConverter from './converters/parsed-jdl-to-jdl-object/parsed-jdl-to-jdl-object-converter.js';
import JDLWithoutApplicationToJSONConverter from './converters/jdl-to-json/jdl-without-application-to-json-converter.js';
import { convert } from './converters/jdl-to-json/jdl-with-applications-to-json-converter.js';
import {
  formatApplicationToExport,
  formatApplicationsToExport,
} from './converters/exporters/applications/jhipster-application-formatter.js';
import exportDeployments from './converters/exporters/jhipster-deployment-exporter.js';
import exportEntities from './converters/exporters/jhipster-entity-exporter.js';
import { GENERATOR_NAME } from './converters/exporters/export-utils.js';
import { parseFromContent, parseFromFiles } from './core/readers/jdl-reader.js';
import createWithApplicationValidator from './converters/validators/jdl-with-application-validator.js';
import createWithoutApplicationValidator from './converters/validators/jdl-without-application-validator.js';
import type JDLObject from './core/models/jdl-object.js';
import type { ParsedJDLApplications } from './core/types/parsed.js';
import type { PostProcessedJDLJSONApplication } from './core/types/exporter.js';
import type { JDLApplicationConfig } from './core/types/parsing.js';
import type { JDLRuntime } from './core/types/runtime.js';
import { createRuntime, getDefaultRuntime } from './core/runtime.js';

const { OptionNames } = applicationOptions;
const { APPLICATION_TYPE, BASE_NAME } = OptionNames;
const GENERATOR_JHIPSTER = 'generator-jhipster'; // can't use the one of the generator as it circles

type JDLApplicationConfiguration = {
  applicationName?: string;
  applicationType?: ApplicationType;
  application?: {
    [GENERATOR_JHIPSTER]: {
      baseName?: string;
      applicationType?: ApplicationType;
    };
  };
};

/**
 * Creates a new JDL importer from files.
 * There are two ways to create an importer:
 *   - By providing an existing application content, if there's one
 *   - Deprecated: providing some application options
 */
export function createImporterFromFiles(files: string[], configuration?: JDLApplicationConfiguration, definition?: JDLApplicationConfig) {
  if (!files) {
    throw new Error('Files must be passed to create a new JDL importer.');
  }
  const runtime = definition ? createRuntime(definition) : getDefaultRuntime();
  const content = parseFromFiles(files, runtime);
  return makeJDLImporter(content, configuration || {}, runtime);
}

/**
 * Creates a new JDL importer from a JDL string content.
 * There are two ways to create an importer:
 *   - By providing an existing application content, if there's one
 *   - Deprecated: providing some application options
 */
export function createImporterFromContent(jdlString, configuration?: JDLApplicationConfiguration, definition?: JDLApplicationConfig) {
  if (!jdlString) {
    throw new Error('A JDL content must be passed to create a new JDL importer.');
  }
  const runtime = definition ? createRuntime(definition) : getDefaultRuntime();
  const content = parseFromContent(jdlString, runtime);
  return makeJDLImporter(content, configuration || {}, runtime);
}

export type ApplicationWithEntities = { config: any; namespaceConfigs: Record<string, Record<string, any>>; entities: any[] };

export type ImportState = {
  exportedApplications: any[];
  exportedApplicationsWithEntities: Record<string, ApplicationWithEntities>;
  exportedEntities: any[];
  exportedDeployments: any[];
};

function makeJDLImporter(content, configuration: JDLApplicationConfiguration, runtime: JDLRuntime) {
  let importState: ImportState = {
    exportedApplications: [],
    exportedApplicationsWithEntities: {},
    exportedEntities: [],
    exportedDeployments: [],
  };

  return {
    /**
     * Processes JDL files and converts them to JSON.
     * @param {Object} logger - the logger to use, default to the console.
     * @returns {object} the state of the process:
     *          - exportedDeployments: the exported deployments, or an empty list
     *          - exportedApplications: the exported applications, or an empty list
     *          - exportedEntities: the exported entities, or an empty list
     */
    import: () => {
      const jdlObject = getJDLObject(content, configuration, runtime);
      checkForErrors(jdlObject);
      if (jdlObject.getApplicationQuantity() === 0 && jdlObject.getEntityQuantity() > 0) {
        importState.exportedEntities = importOnlyEntities(jdlObject, configuration);
      } else if (jdlObject.getApplicationQuantity() === 1) {
        importState = importOneApplicationAndEntities(jdlObject);
      } else {
        importState = importApplicationsAndEntities(jdlObject);
      }
      if (jdlObject.getDeploymentQuantity()) {
        importState.exportedDeployments = importDeployments(jdlObject.deployments);
      }
      return importState;
    },
  };
}

function getJDLObject(parsedJDLContent: ParsedJDLApplications, configuration: JDLApplicationConfiguration, runtime: JDLRuntime) {
  let baseName = configuration.applicationName;
  let applicationType = configuration.applicationType;

  if (configuration.application) {
    baseName ??= configuration.application[GENERATOR_JHIPSTER].baseName;
    applicationType ??= configuration.application[GENERATOR_JHIPSTER].applicationType;
  }

  return ParsedJDLToJDLObjectConverter.parseFromConfigurationObject(
    {
      parsedContent: parsedJDLContent,
      applicationType,
      applicationName: baseName,
    },
    runtime,
  );
}

function checkForErrors(jdlObject: JDLObject) {
  let validator;
  if (jdlObject.getApplicationQuantity() === 0) {
    validator = createWithoutApplicationValidator(jdlObject);
  } else {
    validator = createWithApplicationValidator(jdlObject);
  }
  validator.checkForErrors();
}

function importOnlyEntities(jdlObject: JDLObject, configuration: JDLApplicationConfiguration) {
  let { applicationName, applicationType } = configuration;

  let application = configuration.application;
  if (!application) {
    application = readCurrentPathYoRcFile();
  }
  if (application?.[GENERATOR_JHIPSTER]) {
    applicationType ??= application[GENERATOR_JHIPSTER].applicationType;
    applicationName ??= application[GENERATOR_JHIPSTER].baseName;
  }

  const entitiesPerApplicationMap = JDLWithoutApplicationToJSONConverter.convert(jdlObject, applicationName!);
  const jsonEntities = entitiesPerApplicationMap.get(applicationName!);
  return exportJSONEntities(jsonEntities, configuration);
}

function importOneApplicationAndEntities(jdlObject: JDLObject) {
  const importState: ImportState = {
    exportedApplications: [],
    exportedApplicationsWithEntities: {},
    exportedEntities: [],
    exportedDeployments: [],
  };
  const formattedApplication: PostProcessedJDLJSONApplication = formatApplicationToExport(jdlObject.getApplications()[0]);
  importState.exportedApplications.push(formattedApplication);
  const jdlApplication = jdlObject.getApplications()[0];
  const applicationName = jdlApplication.getConfigurationOptionValue(BASE_NAME);
  const entitiesPerApplicationMap = convert(jdlObject);
  const jsonEntities: any = entitiesPerApplicationMap.get(applicationName);
  const { [GENERATOR_NAME]: config, ...remaining } = formattedApplication;
  importState.exportedApplicationsWithEntities[applicationName] = {
    config,
    ...remaining,
    entities: [],
  };
  if (jsonEntities.length !== 0) {
    const exportedJSONEntities = exportJSONEntities(jsonEntities, {
      applicationName,
      applicationType: jdlApplication.getConfigurationOptionValue(APPLICATION_TYPE),
      forSeveralApplications: false,
    });
    importState.exportedApplicationsWithEntities[applicationName].entities = exportedJSONEntities;
    importState.exportedEntities = uniqBy([...importState.exportedEntities, ...exportedJSONEntities], 'name');
  }
  return importState;
}

function importApplicationsAndEntities(jdlObject) {
  const importState: ImportState = {
    exportedApplications: [],
    exportedApplicationsWithEntities: {},
    exportedEntities: [],
    exportedDeployments: [],
  };

  const formattedApplications = formatApplicationsToExport(jdlObject.applications);
  importState.exportedApplications = formattedApplications;
  const entitiesPerApplicationMap: Map<any, any> = convert(jdlObject);
  entitiesPerApplicationMap.forEach((jsonEntities, applicationName) => {
    const jdlApplication = jdlObject.getApplication(applicationName);
    const exportedJSONEntities = exportJSONEntities(jsonEntities, {
      applicationName,
      applicationType: jdlApplication.getConfigurationOptionValue(APPLICATION_TYPE),
      forSeveralApplications: true,
    });
    const exportedConfig = importState.exportedApplications.find(config => applicationName === config['generator-jhipster'].baseName);
    const { 'generator-jhipster': config, ...remaining } = exportedConfig;
    importState.exportedApplicationsWithEntities[applicationName] = {
      config,
      ...remaining,
      entities: exportedJSONEntities,
    };
    importState.exportedEntities = uniqBy([...importState.exportedEntities, ...exportedJSONEntities], 'name');
  });
  return importState;
}

function importDeployments(deployments) {
  return exportDeployments(deployments);
}

function exportJSONEntities(entities, configuration) {
  let baseName = configuration.applicationName;
  let applicationType = configuration.applicationType;

  if (configuration.application) {
    baseName = configuration.application[GENERATOR_JHIPSTER].baseName;
    applicationType = configuration.application[GENERATOR_JHIPSTER].applicationType;
  }

  return exportEntities({
    entities,
    application: {
      name: baseName,
      type: applicationType,
      forSeveralApplications: !!configuration.forSeveralApplications,
    },
  });
}
