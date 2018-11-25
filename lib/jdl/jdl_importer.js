/** Copyright 2013-2018 the original author or authors from the JHipster project.
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
const JDLReader = require('../reader/jdl_reader');
const DocumentParser = require('../parser/document_parser');
const EntityParser = require('../parser/entity_parser');
const JHipsterApplicationExporter = require('../export/jhipster_application_exporter');
const JHipsterDeploymentExporter = require('../export/jhipster_deployment_exporter');
const JHipsterEntityExporter = require('../export/jhipster_entity_exporter');
const BusinessErrorChecker = require('../exceptions/business_error_checker');

/**
 * This class' purpose is to import one, or several JDL files, and export them to JSON (entities & applications).
 * This class is recommended over the use of JDLReader, DocumentParser and the like as it uses them to parse
 * and export JDL files instead of having to use each class separately.
 */
class JDLImporter {
  /**
   * Creates a new JDLImporter class.
   * @param files an iterable having the JDL files
   * @param configuration an object having for keys:
   *                        - applicationName: the application's name, optional if parsing applications
   *                        - applicationType: the application type, same remark
   *                        - databaseType: the database type, same remark
   *                        - generatorVersion: the generator's version, same remark
   *                        - forceNoFiltering: whether to force filtering
   */
  constructor(files, configuration) {
    if (!files) {
      throw new Error('JDL files must be passed so as to be imported.');
    }
    this.files = files;
    this.configuration = configuration || {};
    this.importState = {
      exportedApplications: [],
      exportedEntities: [],
      exportedDeployments: []
    };
  }

  /**
   * Processes JDL files and converts them to JSON.
   * @returns the state of the process:
   *          - exportedApplications: the exported applications, or an empty list
   *          - exportedEntities: the exported entities, or an empty list
   */
  import() {
    const parsedJDLContent = parseFiles(this.files);
    const jdlObject = getJDLObject(parsedJDLContent, this.configuration);
    checkForErrors(jdlObject, this.configuration);
    if (jdlObject.getApplicationQuantity() === 0 && Object.keys(jdlObject.entities).length > 0) {
      this.importState.exportedEntities = importOnlyEntities(jdlObject, this.configuration);
    } else if (jdlObject.getApplicationQuantity() === 1) {
      this.importState = importOneApplicationAndEntities(jdlObject, this.configuration);
    } else {
      this.importState = importApplicationsAndEntities(jdlObject, this.configuration);
    }
    if (jdlObject.getDeploymentQuantity()) {
      this.importState.exportedDeployments = importDeployments(jdlObject.deployments);
    }
    return this.importState;
  }
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

module.exports = JDLImporter;
