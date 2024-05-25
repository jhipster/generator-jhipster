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
import { uniqBy } from 'lodash-es';
import * as JDLReader from './readers/jdl-reader.js';
import ParsedJDLToJDLObjectConverter from './converters/parsed-jdl-to-jdl-object/parsed-jdl-to-jdl-object-converter.js';
import { readJSONFile } from './readers/json-file-reader.js';
import { doesFileExist } from './utils/file-utils.js';
import JDLWithoutApplicationToJSONConverter from './converters/jdl-to-json/jdl-without-application-to-json-converter.js';
import { convert } from './converters/jdl-to-json/jdl-with-applications-to-json-converter.js';
import { formatApplicationToExport, formatApplicationsToExport } from './exporters/applications/jhipster-application-formatter.js';
import exportDeployments from './exporters/jhipster-deployment-exporter.js';
import exportEntities from './exporters/jhipster-entity-exporter.js';
import createWithApplicationValidator from './validators/jdl-with-application-validator.js';
import createWithoutApplicationValidator from './validators/jdl-without-application-validator.js';
import { applicationOptions } from './jhipster/index.js';
import JDLObject from './models/jdl-object.js';
import { ParsedJDLApplications } from './converters/parsed-jdl-to-jdl-object/types.js';

const { OptionNames } = applicationOptions;
const { APPLICATION_TYPE, BASE_NAME } = OptionNames;

const GENERATOR_JHIPSTER = 'generator-jhipster'; // can't use the one of the generator as it circles
/**
 * Creates a new JDL importer from files.
 * There are two ways to create an importer:
 *   - By providing an existing application content, if there's one
 *   - Deprecated: providing some application options
 *
 * @param {Array} files - the JDL files to parse.
 * @param {Object} configuration - a configuration object.
 * @param {Object} configuration.application - an existing application file content
 * @param {String} configuration.applicationName - deprecated, the application's name, optional if parsing applications
 * @param {String} configuration.applicationType - deprecated, the application type, optional if parsing applications
 * @param {String} configuration.databaseType - deprecated, the database type, optional if parsing applications
 * @returns {Object} a JDL importer.
 * @throws {Error} if files aren't passed.
 */
export function createImporterFromFiles(files?, configuration?: any) {
  if (!files) {
    throw new Error('Files must be passed to create a new JDL importer.');
  }
  const content = parseFiles(files);
  return makeJDLImporter(content, configuration || {});
}

/**
 * Creates a new JDL importer from a JDL string content.
 * There are two ways to create an importer:
 *   - By providing an existing application content, if there's one
 *   - Deprecated: providing some application options
 *
 * @param {String} jdlString - the JDL String content to parse.
 * @param {Object} configuration - a configuration object.
 * @param {Object} configuration.application - an existing application file content
 * @param {String} configuration.applicationName - deprecated, the application's name, optional if parsing applications
 * @param {String} configuration.applicationType - deprecated, the application type, optional if parsing applications
 * @param {String} configuration.databaseType - deprecated, the database type, optional if parsing applications
 * @param {Array} configuration.blueprints - the blueprints used.
 * @returns {Object} a JDL importer.
 * @throws {Error} if the content isn't passed.
 */
export function createImporterFromContent(jdlString, configuration?: any) {
  if (!jdlString) {
    throw new Error('A JDL content must be passed to create a new JDL importer.');
  }
  const content = JDLReader.parseFromContent(jdlString);
  return makeJDLImporter(content, configuration || {});
}

export type ApplicationWithEntities = { config: any; namespaceConfigs: Record<string, Record<string, any>>; entities: any[] };

export type ImportState = {
  exportedApplications: any[];
  exportedApplicationsWithEntities: Record<string, ApplicationWithEntities>;
  exportedEntities: any[];
  exportedDeployments: any[];
};

function makeJDLImporter(content, configuration) {
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
    import: (logger = console) => {
      const jdlObject = getJDLObject(content, configuration);
      checkForErrors(jdlObject, configuration, logger);
      if (jdlObject.getApplicationQuantity() === 0 && jdlObject.getEntityQuantity() > 0) {
        importState.exportedEntities = importOnlyEntities(jdlObject, configuration);
      } else if (jdlObject.getApplicationQuantity() === 1) {
        importState = importOneApplicationAndEntities(jdlObject, configuration);
      } else {
        importState = importApplicationsAndEntities(jdlObject, configuration);
      }
      if (jdlObject.getDeploymentQuantity()) {
        importState.exportedDeployments = importDeployments(jdlObject.deployments);
      }
      return importState;
    },
  };
}

function parseFiles(files: string[]) {
  return JDLReader.parseFromFiles(files);
}

function getJDLObject(parsedJDLContent: ParsedJDLApplications, configuration) {
  let baseName = configuration.applicationName;
  let applicationType = configuration.applicationType;
  let databaseType = configuration.databaseType;

  if (configuration.application) {
    baseName = configuration.application[GENERATOR_JHIPSTER].baseName;
    applicationType = configuration.application[GENERATOR_JHIPSTER].applicationType;
    databaseType = configuration.application[GENERATOR_JHIPSTER].databaseType;
  }

  return ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
    parsedContent: parsedJDLContent,
    applicationType,
    applicationName: baseName,
    databaseType,
  });
}

function checkForErrors(jdlObject: JDLObject, configuration, logger = console) {
  let validator;
  if (jdlObject.getApplicationQuantity() === 0) {
    let application = configuration.application;
    if (!application && doesFileExist('.yo-rc.json')) {
      application = readJSONFile('.yo-rc.json');
    }
    let applicationType = configuration.applicationType;
    let databaseType = configuration.databaseType;
    let blueprints = configuration.blueprints;
    if (application && application[GENERATOR_JHIPSTER]) {
      if (applicationType === undefined) {
        applicationType = application[GENERATOR_JHIPSTER].applicationType;
      }
      if (databaseType === undefined) {
        databaseType = application[GENERATOR_JHIPSTER].databaseType;
      }
      if (blueprints === undefined) {
        blueprints = application[GENERATOR_JHIPSTER].blueprints;
      }
    }
    validator = createWithoutApplicationValidator(
      jdlObject,
      {
        applicationType,
        databaseType,
        blueprints,
      },
      logger,
    );
  } else {
    validator = createWithApplicationValidator(jdlObject, logger);
  }
  validator.checkForErrors();
}

function importOnlyEntities(jdlObject: JDLObject, configuration) {
  let { applicationName, applicationType, databaseType } = configuration;

  let application = configuration.application;
  if (!configuration.application && doesFileExist('.yo-rc.json')) {
    application = readJSONFile('.yo-rc.json');
  }
  if (application && application[GENERATOR_JHIPSTER]) {
    if (applicationType === undefined) {
      applicationType = application[GENERATOR_JHIPSTER].applicationType;
    }
    if (applicationName === undefined) {
      applicationName = application[GENERATOR_JHIPSTER].baseName;
    }
    if (databaseType === undefined) {
      databaseType = application[GENERATOR_JHIPSTER].databaseType;
    }
  }

  const entitiesPerApplicationMap = JDLWithoutApplicationToJSONConverter.convert({
    jdlObject,
    applicationName,
    applicationType,
    databaseType,
  });
  const jsonEntities = entitiesPerApplicationMap.get(applicationName);
  return exportJSONEntities(jsonEntities, configuration);
}

function importOneApplicationAndEntities(jdlObject: JDLObject, configuration) {
  const importState: ImportState = {
    exportedApplications: [],
    exportedApplicationsWithEntities: {},
    exportedEntities: [],
    exportedDeployments: [],
  };
  const formattedApplication = formatApplicationToExport(jdlObject.getApplications()[0], configuration);
  importState.exportedApplications.push(formattedApplication);
  const jdlApplication = jdlObject.getApplications()[0];
  const applicationName = jdlApplication.getConfigurationOptionValue(BASE_NAME);
  const entitiesPerApplicationMap = convert({
    jdlObject,
  });
  const jsonEntities: any = entitiesPerApplicationMap.get(applicationName);
  const { 'generator-jhipster': config, ...remaining } = formattedApplication;
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

function importApplicationsAndEntities(jdlObject, configuration) {
  const importState: ImportState = {
    exportedApplications: [],
    exportedApplicationsWithEntities: {},
    exportedEntities: [],
    exportedDeployments: [],
  };

  const formattedApplications = formatApplicationsToExport(jdlObject.applications, configuration);
  importState.exportedApplications = formattedApplications;
  const entitiesPerApplicationMap: Map<any, any> = convert({
    jdlObject,
  });
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
