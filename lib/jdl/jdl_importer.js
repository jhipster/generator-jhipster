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

const JDLReader = require('../reader/jdl_reader');
const DocumentParser = require('../parser/document_parser');
const EntityParser = require('../parser/entity_parser');
const JHipsterApplicationExporter = require('../export/jhipster_application_exporter');
const JHipsterEntityExporter = require('../export/jhipster_entity_exporter');
const BusinessErrorChecker = require('../exceptions/business_error_checker');

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
  }

  import() {
    const parsedJDLContent = JDLReader.parseFromFiles(this.files);
    const jdlObject = DocumentParser.parseFromConfigurationObject({
      document: parsedJDLContent,
      applicationType: this.configuration.applicationType,
      applicationName: this.configuration.applicationName,
      generatorVersion: this.configuration.generatorVersion
    });
    checkForErrors(jdlObject, {
      applicationType: this.configuration.applicationType,
      databaseType: this.configuration.databaseType
    });
    if (jdlObject.getApplicationQuantity() === 0) {
      const jsonEntities = EntityParser.parse({
        jdlObject,
        applicationType: this.configuration.applicationType,
        databaseType: this.configuration.databaseType
      });
      return JHipsterEntityExporter.exportEntities({
        entities: jsonEntities,
        forceNoFiltering: this.configuration.forceNoFiltering,
        application: {
          name: this.configuration.applicationName,
          type: this.configuration.applicationType
        }
      });
    }
    let exportedEntities = [];
    JHipsterApplicationExporter.exportApplications(jdlObject.applications);
    if (jdlObject.getEntityQuantity() !== 0) {
      Object.keys(jdlObject.applications).forEach((applicationName) => {
        const jdlApplication = jdlObject.applications[applicationName];
        const jsonEntities = EntityParser.parse({
          jdlObject,
          applicationType: jdlApplication.config.applicationType,
          databaseType: jdlApplication.config.databaseType
        });
        exportedEntities = exportedEntities.concat(JHipsterEntityExporter.exportEntitiesInApplications({
          entities: jsonEntities,
          forceNoFiltering: this.configuration.forceNoFiltering,
          applications: jdlObject.applications
        }).toArray());
      });
    }
    return exportedEntities;
  }
}

function checkForErrors(jdlObject, configuration) {
  const errorChecker = new BusinessErrorChecker(jdlObject, configuration);
  errorChecker.checkForErrors();
}

module.exports = JDLImporter;
