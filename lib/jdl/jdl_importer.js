/** Copyright 2013-2019 the original author or authors from the JHipster project.
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
const EntityParser = require('../parsers/entity_parser');
const JHipsterApplicationExporter = require('../exporters/jhipster_application_exporter');
const JHipsterDeploymentExporter = require('../exporters/jhipster_deployment_exporter');
const JHipsterEntityExporter = require('../exporters/jhipster_entity_exporter');
const BusinessErrorChecker = require('../exceptions/business_error_checker');

module.exports = {
  createImporterFromContent,
  createImporterFromFiles
};

/**
 * Creates a new JDL importer from files.
 * @param {Array} files - the JDL files to parse.
 * @param {Object} configuration - a configuration object.
 * @param {string} configuration.applicationName - the application's name, optional if parsing applications
 * @param {string} configuration.applicationType - the application type, optional if parsing applications
 * @param {string} configuration.databaseType - the database type, optional if parsing applications
 * @param {string} configuration.generatorVersion - the generator's version, optional if parsing applications
 * @param {string} configuration.forceNoFiltering - whether to force filtering
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
 * @param {string} jdlString - the JDL string content to parse.
 * @param {Object} configuration - a configuration object.
 * @param {string} configuration.applicationName - the application's name, optional if parsing applications
 * @param {string} configuration.applicationType - the application type, optional if parsing applications
 * @param {string} configuration.databaseType - the database type, optional if parsing applications
 * @param {string} configuration.generatorVersion - the generator's version, optional if parsing applications
 * @param {string} configuration.forceNoFiltering - whether to force filtering
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
      const jdlObject = getJDLObject(content, configuration);
      checkForErrors(jdlObject, configuration);
      if (jdlObject.getApplicationQuantity() === 0 && Object.keys(jdlObject.entities).length > 0) {
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

function parseFiles(files) {
  return JDLReader.parseFromFiles(files);
}

function getJDLObject(parsedJDLContent, configuration) {
  return DocumentParser.parseFromConfigurationObject({
    document: parsedJDLContent,
    applicationType: configuration.applicationType,
    applicationName: configuration.applicationName,
    generatorVersion: configuration.generatorVersion
  });
}

function checkForErrors(jdlObject, configuration) {
  const errorChecker = new BusinessErrorChecker(jdlObject, {
    applicationType: configuration.applicationType,
    databaseType: configuration.databaseType
  });
  errorChecker.checkForErrors();
}

function importOnlyEntities(jdlObject, configuration) {
  const jsonEntities = getJSONEntities(jdlObject, configuration);
  return exportJSONEntities(jsonEntities, configuration);
}

function importOneApplicationAndEntities(jdlObject, configuration) {
  const importState = {
    exportedApplications: [],
    exportedEntities: [],
    exportedDeployments: []
  };
  const application = jdlObject.applications[Object.keys(jdlObject.applications)[0]];
  importState.exportedApplications.push(JHipsterApplicationExporter.exportApplication(application));
  if (jdlObject.getEntityQuantity() !== 0) {
    const jsonEntities = getJSONEntities(jdlObject, application.config);
    importState.exportedEntities = uniqBy(
      [
        ...importState.exportedEntities,
        ...exportJSONEntitiesInApplications(jsonEntities, configuration, jdlObject.applications)
      ],
      'name'
    );
  }
  return importState;
}

function importApplicationsAndEntities(jdlObject, configuration) {
  const importState = {
    exportedApplications: [],
    exportedEntities: [],
    exportedDeployments: []
  };
  importState.exportedApplications = JHipsterApplicationExporter.exportApplications(jdlObject.applications);
  if (jdlObject.getEntityQuantity() !== 0) {
    jdlObject.forEachApplication(application => {
      const jsonEntities = getJSONEntities(jdlObject, application.config);
      importState.exportedEntities = uniqBy(
        [
          ...importState.exportedEntities,
          ...exportJSONEntitiesInApplications(jsonEntities, configuration, jdlObject.applications)
        ],
        'name'
      );
    });
  }
  return importState;
}

function importDeployments(deployments) {
  return JHipsterDeploymentExporter.exportDeployments(deployments);
}

function getJSONEntities(jdlObject, configuration) {
  return EntityParser.parse({
    jdlObject,
    baseName: configuration.baseName,
    applicationType: configuration.applicationType,
    databaseType: configuration.databaseType
  });
}

function exportJSONEntities(entities, configuration) {
  return JHipsterEntityExporter.exportEntities({
    entities,
    forceNoFiltering: configuration.forceNoFiltering,
    application: {
      name: configuration.applicationName,
      type: configuration.applicationType
    }
  });
}

function exportJSONEntitiesInApplications(entities, configuration, applications) {
  return JHipsterEntityExporter.exportEntitiesInApplications({
    entities,
    forceNoFiltering: configuration.forceNoFiltering,
    applications
  });
}
