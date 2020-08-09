/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

const path = require('path');
const { formatApplicationToExport, formatApplicationsToExport } = require('./jhipster-application-formatter');
const { createFolderIfItDoesNotExist, doesFileExist } = require('../../utils/file-utils');
const { GENERATOR_NAME, writeConfigFile } = require('../export-utils');

module.exports = {
    exportApplications,
    exportApplication,
    exportApplicationInCurrentDirectory,
};

/**
 * Exports JDL applications to JDL files in separate folders (based on application base names).
 * @param applications the applications to exporters (key: application name, value: a JDLApplication).
 * @param {Object} configuration - the configuration object.
 * @param {Boolean} configuration.skipFileGeneration - set true to skip writing .yo-rc.json.
 * @param {Integer} configuration.creationTimestampConfig - date representation to be written to creationTimestamp at .yo-rc.json.
 * @return object[] exported applications in their final form.
 */
function exportApplications(applications, configuration = {}) {
    if (!applications) {
        throw new Error('Applications have to be passed to be exported.');
    }
    const formattedApplications = formatApplicationsToExport(applications, configuration);
    formattedApplications.forEach(formattedApplication => {
        if (!configuration.skipFileGeneration) {
            writeApplicationFileForMultipleApplications(formattedApplication);
        }
    });
    return formattedApplications;
}

/**
 * Alias of exportApplication.
 */
function exportApplicationInCurrentDirectory(application, configuration = {}) {
    return exportApplication(application, configuration);
}

/**
 * Exports JDL a application to a JDL file in the current directory.
 * @param {Object} application - the JDL application to export.
 * @param {Object} configuration - the configuration object.
 * @param {Boolean} configuration.skipFileGeneration - set true to skip writing .yo-rc.json.
 * @param {Integer} configuration.creationTimestampConfig - date representation to be written to creationTimestamp at .yo-rc.json.
 * @return {Object} the exported application in its final form.
 */
function exportApplication(application, configuration = {}) {
    const exportableApplication = formatApplicationToExport(application, configuration);
    if (!configuration.skipFileGeneration) {
        writeConfigFile(exportableApplication);
    }
    return exportableApplication;
}

/**
 * This function writes a Yeoman config file in an application folder.
 * @param application the application.
 */
function writeApplicationFileForMultipleApplications(application) {
    const applicationBaseName = application[GENERATOR_NAME].baseName;
    if (doesFileExist(applicationBaseName)) {
        throw new Error(
            `A file named '${applicationBaseName}' already exists, so a folder of the same name can't be created for the application.`
        );
    }
    createFolderIfItDoesNotExist(applicationBaseName);
    writeConfigFile(application, path.join(applicationBaseName, '.yo-rc.json'));
}
