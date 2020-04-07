/** Copyright 2013-2020 the original author or authors from the JHipster project.
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
const { uniqBy } = require('lodash');
const JDLReader = require('../readers/jdl_reader');
const DocumentParser = require('../parsers/document_parser');
const JDLWithoutApplicationToJSONConverter = require('../converters/JDLToJSON/jdl_without_application_to_json_converter');
const JDLWithApplicationsToJSONConverter = require('../converters/JDLToJSON/jdl_with_applications_to_json_converter');
const JHipsterApplicationExporter = require('../exporters/jhipster_application_exporter');
const JHipsterDeploymentExporter = require('../exporters/jhipster_deployment_exporter');
const JHipsterEntityExporter = require('../exporters/jhipster_entity_exporter');
const BusinessErrorChecker = require('../validators/business_error_checker');

module.exports = {
  createImporterFromContent,
  createImporterFromFiles
};

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
 * @param {String} configuration.generatorVersion - deprecated, the generator's version, optional if parsing applications
 * @param {String} configuration.forceNoFiltering - whether to force filtering
 * @param {Boolean} configuration.skipYoRcGeneration - whether not to generate the .yo-rc.json file
 * @param {Boolean} configuration.skipEntityFilesGeneration - whether not to generate the .jhipster folder along with the entity files
 * @param {Date} configuration.creationTimestamp - the creation timestamp to use when generating entities
 * @returns {Object} a JDL importer.
 * @throws {Error} if files aren't passed.
 */
function createImporterFromFiles(files, configuration) {
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
 * @param {String} configuration.generatorVersion - deprecated, the generator's version, optional if parsing applications
 * @param {String} configuration.forceNoFiltering - whether to force filtering
 * @param {Boolean} configuration.skipYoRcGeneration - whether not to generate the .yo-rc.json file
 * @param {Boolean} configuration.skipEntityFilesGeneration - whether not to generate the .jhipster folder along with the entity files
 * @param {Date} configuration.creationTimestamp - the creation timestamp to use when generating entities
 * @returns {Object} a JDL importer.
 * @throws {Error} if the content isn't passed.
 */
function createImporterFromContent(jdlString, configuration) {
  if (!jdlString) {
    throw new Error('A JDL content must be passed to create a new JDL importer.');
  }
  const content = JDLReader.parseFromContent(jdlString);
  return makeJDLImporter(content, configuration || {});
}

function makeJDLImporter(content, configuration) {
  let importState = {
    exportedApplications: [],
    exportedEntities: [],
    exportedDeployments: []
  };

  return {
    /**
     * Processes JDL files and converts them to JSON.
     * @returns {object} the state of the process:
     *          - exportedDeployments: the exported deployments, or an empty list
     *          - exportedApplications: the exported applications, or an empty list
     *          - exportedEntities: the exported entities, or an empty list
     */
    import: () => {
      configuration.creationTimestampConfig = getCreationTimestampToUse(configuration.creationTimestamp);
      const jdlObject = getJDLObject(content, configuration);
      checkForErrors(jdlObject, configuration);
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
    }
  };
}

function getCreationTimestampToUse(passedCreationTimestamp) {
  let creationTimestampConfig = new Date();
  // We don't need seconds precision, discard it.
  creationTimestampConfig.setSeconds(0);
  if (passedCreationTimestamp) {
    const parsedTimestamp = Date.parse(passedCreationTimestamp);
    if (parsedTimestamp) {
      creationTimestampConfig = new Date(parsedTimestamp);
    }
  }
  return creationTimestampConfig.getTime();
}

function parseFiles(files) {
  return JDLReader.parseFromFiles(files);
}

function getJDLObject(parsedJDLContent, configuration) {
  let baseName = configuration.applicationName;
  let applicationType = configuration.applicationType;
  let generatorVersion = configuration.generatorVersion;
  let creationTimestamp = configuration.creationTimestampConfig;
  let skippedUserManagement = false;

  if (configuration.application) {
    baseName = configuration.application['generator-jhipster'].baseName;
    applicationType = configuration.application['generator-jhipster'].applicationType;
    generatorVersion = configuration.application['generator-jhipster'].jhipsterVersion;
    creationTimestamp = configuration.application['generator-jhipster'].creationTimestamp;
    skippedUserManagement = configuration.application['generator-jhipster'].skipUserManagement;
  }

  return DocumentParser.parseFromConfigurationObject({
    parsedContent: parsedJDLContent,
    applicationType,
    applicationName: baseName,
    generatorVersion,
    creationTimestamp,
    skippedUserManagement
  });
}

function checkForErrors(jdlObject, configuration) {
  let applicationType = configuration.applicationType;
  let databaseType = configuration.databaseType;
  let skippedUserManagement = false;
  if (configuration.application) {
    applicationType = configuration.application['generator-jhipster'].applicationType;
    databaseType = configuration.application['generator-jhipster'].databaseType;
    skippedUserManagement = configuration.application['generator-jhipster'].skipUserManagement;
  }
  const errorChecker = new BusinessErrorChecker(jdlObject, {
    applicationType,
    databaseType,
    skippedUserManagement
  });
  errorChecker.checkForErrors();
}

function importOnlyEntities(jdlObject, configuration) {
  let { applicationName, applicationType, databaseType, creationTimestamp } = configuration;

  if (configuration.application) {
    applicationType = configuration.application['generator-jhipster'].applicationType;
    applicationName = configuration.application['generator-jhipster'].baseName;
    databaseType = configuration.application['generator-jhipster'].databaseType;
    creationTimestamp = configuration.application['generator-jhipster'].creationTimestamp;
  }

  const entitiesPerApplicationMap = JDLWithoutApplicationToJSONConverter.convert({
    jdlObject,
    applicationName,
    applicationType,
    creationTimestamp,
    databaseType
  });
  const jsonEntities = entitiesPerApplicationMap.get(applicationName);
  return exportJSONEntities(jsonEntities, configuration);
}

function importOneApplicationAndEntities(jdlObject, configuration) {
  const { creationTimestamp, skipEntityFilesGeneration } = configuration;

  const importState = {
    exportedApplications: [],
    exportedEntities: [],
    exportedDeployments: []
  };
  importState.exportedApplications.push(
    JHipsterApplicationExporter.exportApplicationInCurrentDirectory(jdlObject.getApplications()[0], configuration)
  );
  const jdlApplication = jdlObject.getApplications()[0];
  const applicationName = jdlApplication.getConfigurationOptionValue('baseName');
  const entitiesPerApplicationMap = JDLWithApplicationsToJSONConverter.convert({
    jdlObject,
    creationTimestamp
  });
  const jsonEntities = entitiesPerApplicationMap.get(applicationName);
  if (jsonEntities.length !== 0) {
    const exportedJSONEntities = exportJSONEntities(jsonEntities, {
      applicationName,
      applicationType: jdlApplication.getConfigurationOptionValue('applicationType'),
      forSeveralApplications: false,
      skipEntityFilesGeneration
    });
    importState.exportedEntities = uniqBy([...importState.exportedEntities, ...exportedJSONEntities], 'name');
  }
  return importState;
}

function importApplicationsAndEntities(jdlObject, configuration) {
  const { creationTimestamp, skipEntityFilesGeneration } = configuration;

  const importState = {
    exportedApplications: [],
    exportedEntities: [],
    exportedDeployments: []
  };

  importState.exportedApplications = JHipsterApplicationExporter.exportApplications(jdlObject.applications);
  const entitiesPerApplicationMap = JDLWithApplicationsToJSONConverter.convert({
    jdlObject,
    creationTimestamp
  });
  entitiesPerApplicationMap.forEach((entities, applicationName) => {
    const jdlApplication = jdlObject.getApplication(applicationName);
    const jsonEntities = entitiesPerApplicationMap.get(applicationName);
    const exportedJSONEntities = exportJSONEntities(jsonEntities, {
      applicationName,
      applicationType: jdlApplication.getConfigurationOptionValue('applicationType'),
      forSeveralApplications: true,
      skipEntityFilesGeneration
    });
    importState.exportedEntities = uniqBy([...importState.exportedEntities, ...exportedJSONEntities], 'name');
  });
  return importState;
}

function importDeployments(deployments) {
  return JHipsterDeploymentExporter.exportDeployments(deployments);
}

function exportJSONEntities(entities, configuration) {
  const { forceNoFiltering, skipEntityFilesGeneration } = configuration;
  let baseName = configuration.applicationName;
  let applicationType = configuration.applicationType;

  if (configuration.application) {
    baseName = configuration.application['generator-jhipster'].baseName;
    applicationType = configuration.application['generator-jhipster'].applicationType;
  }

  return JHipsterEntityExporter.exportEntities({
    entities,
    forceNoFiltering,
    skipEntityFilesGeneration,
    application: {
      name: baseName,
      type: applicationType,
      forSeveralApplications: !!configuration.forSeveralApplications
    }
  });
}
