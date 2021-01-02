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
const JDLReader = require('./readers/jdl-reader');
const DocumentParser = require('./converters/parsed-jdl-to-jdl-object/parsed-jdl-to-jdl-object-converter');
const JDLWithoutApplicationToJSONConverter = require('./converters/jdl-to-json/jdl-without-application-to-json-converter');
const JDLWithApplicationsToJSONConverter = require('./converters/jdl-to-json/jdl-with-applications-to-json-converter');
const JHipsterApplicationExporter = require('./exporters/applications/jhipster-application-exporter');
const JHipsterApplicationFormatter = require('./exporters/applications/jhipster-application-formatter');
const JHipsterDeploymentExporter = require('./exporters/jhipster-deployment-exporter');
const JHipsterEntityExporter = require('./exporters/jhipster-entity-exporter');
const BusinessErrorChecker = require('./validators/business-error-checker');

module.exports = {
    createImporterFromContent,
    createImporterFromFiles,
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
 * @param {Boolean} configuration.skipFileGeneration - whether not to generate the .yo-rc.json file
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
 * @param {Boolean} configuration.skipFileGeneration - whether not to generate the .yo-rc.json file
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
        exportedApplicationsWithEntities: {},
        exportedEntities: [],
        exportedDeployments: [],
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
        },
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
    let databaseType = configuration.databaseType;
    let skippedUserManagement = false;

    if (configuration.application) {
        baseName = configuration.application['generator-jhipster'].baseName;
        applicationType = configuration.application['generator-jhipster'].applicationType;
        generatorVersion = configuration.application['generator-jhipster'].jhipsterVersion;
        creationTimestamp = configuration.application['generator-jhipster'].creationTimestamp;
        skippedUserManagement = configuration.application['generator-jhipster'].skipUserManagement;
        databaseType = configuration.application['generator-jhipster'].databaseType;
    }

    return DocumentParser.parseFromConfigurationObject({
        parsedContent: parsedJDLContent,
        applicationType,
        applicationName: baseName,
        generatorVersion,
        creationTimestamp,
        skippedUserManagement,
        databaseType,
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
        skippedUserManagement,
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
        databaseType,
    });
    const jsonEntities = entitiesPerApplicationMap.get(applicationName);
    return exportJSONEntities(jsonEntities, configuration);
}

function importOneApplicationAndEntities(jdlObject, configuration) {
    const { creationTimestamp, skipFileGeneration } = configuration;

    const importState = {
        exportedApplications: [],
        exportedApplicationsWithEntities: {},
        exportedEntities: [],
        exportedDeployments: [],
    };
    const formattedApplication = JHipsterApplicationFormatter.formatApplicationToExport(jdlObject.getApplications()[0], configuration);
    if (!skipFileGeneration) {
        JHipsterApplicationExporter.exportApplication(formattedApplication);
    }
    importState.exportedApplications.push(formattedApplication);
    const jdlApplication = jdlObject.getApplications()[0];
    const applicationName = jdlApplication.getConfigurationOptionValue('baseName');
    const entitiesPerApplicationMap = JDLWithApplicationsToJSONConverter.convert({
        jdlObject,
        creationTimestamp,
    });
    const jsonEntities = entitiesPerApplicationMap.get(applicationName);
    importState.exportedApplicationsWithEntities[applicationName] = {
        config: formattedApplication['generator-jhipster'],
        entities: [],
    };
    if (jsonEntities.length !== 0) {
        const exportedJSONEntities = exportJSONEntities(jsonEntities, {
            applicationName,
            applicationType: jdlApplication.getConfigurationOptionValue('applicationType'),
            forSeveralApplications: false,
            skipFileGeneration,
        });
        importState.exportedApplicationsWithEntities[applicationName].entities = exportedJSONEntities;
        importState.exportedEntities = uniqBy([...importState.exportedEntities, ...exportedJSONEntities], 'name');
    }
    return importState;
}

function importApplicationsAndEntities(jdlObject, configuration) {
    const { creationTimestamp, skipFileGeneration } = configuration;

    const importState = {
        exportedApplications: [],
        exportedApplicationsWithEntities: {},
        exportedEntities: [],
        exportedDeployments: [],
    };

    const formattedApplications = JHipsterApplicationFormatter.formatApplicationsToExport(jdlObject.applications, configuration);
    importState.exportedApplications = formattedApplications;
    if (!skipFileGeneration) {
        JHipsterApplicationExporter.exportApplications(formattedApplications);
    }
    const entitiesPerApplicationMap = JDLWithApplicationsToJSONConverter.convert({
        jdlObject,
        creationTimestamp,
    });
    entitiesPerApplicationMap.forEach((jsonEntities, applicationName) => {
        const jdlApplication = jdlObject.getApplication(applicationName);
        const exportedJSONEntities = exportJSONEntities(jsonEntities, {
            applicationName,
            applicationType: jdlApplication.getConfigurationOptionValue('applicationType'),
            forSeveralApplications: true,
            skipFileGeneration,
        });
        const exportedConfig = importState.exportedApplications.find(config => applicationName === config['generator-jhipster'].baseName);
        importState.exportedApplicationsWithEntities[applicationName] = {
            config: exportedConfig['generator-jhipster'],
            entities: exportedJSONEntities,
        };
        importState.exportedEntities = uniqBy([...importState.exportedEntities, ...exportedJSONEntities], 'name');
    });
    return importState;
}

function importDeployments(deployments) {
    return JHipsterDeploymentExporter.exportDeployments(deployments);
}

function exportJSONEntities(entities, configuration) {
    const { forceNoFiltering, skipFileGeneration } = configuration;
    let baseName = configuration.applicationName;
    let applicationType = configuration.applicationType;

    if (configuration.application) {
        baseName = configuration.application['generator-jhipster'].baseName;
        applicationType = configuration.application['generator-jhipster'].applicationType;
    }

    return JHipsterEntityExporter.exportEntities({
        entities,
        forceNoFiltering,
        skipFileGeneration,
        application: {
            name: baseName,
            type: applicationType,
            forSeveralApplications: !!configuration.forSeveralApplications,
        },
    });
}
