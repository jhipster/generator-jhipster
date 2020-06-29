/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
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

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const constants = require('../generator-constants');

const TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;

const cypressFiles = {
    common: [
        {
            condition: generator => generator.cypressTests,
            templates: ['cypress.json'],
        },
    ],
    clientTestFw: [
        {
            condition: generator => generator.cypressTests,
            path: TEST_SRC_DIR,
            templates: [
                'cypress/plugins/index.ts',
                'cypress/integration/account/login_page_spec.ts',
                'cypress/integration/account/register_page_spec.ts',
                'cypress/integration/administration/administration_spec.ts',
                'cypress/support/commands.ts',
                'cypress/support/index.ts',
                'cypress/tsconfig.json',
            ],
        },
    ],
};
module.exports = {
    writeFiles,
};

function writeFiles() {
    return {
        writeFiles() {
            this.writeFilesToDisk(cypressFiles, this, false, this.fetchFromInstalledJHipster('e2e/templates'));
        },
    };
}
