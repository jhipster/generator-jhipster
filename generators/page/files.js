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
const constants = require('generator-jhipster/generators/generator-constants');
const _ = require('lodash');
const utils = require('../utils');

/* Constants use throughout */
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const VUE_DIR = 'src/main/webapp/app/';
const CLIENT_VUE_TEMPLATES_DIR = 'vue';

const vueFiles = {
    client: [
        {
            path: VUE_DIR,
            templates: [
                {
                    file: 'pages/page.vue',
                    renameTo: generator => `pages/${generator.pageFolderName}/${generator.pageFolderName}.vue`
                },
                {
                    file: 'pages/page.service.ts',
                    renameTo: generator => `pages/${generator.pageFolderName}/${generator.pageFolderName}.service.ts`
                },
                {
                    file: 'pages/page.component.ts',
                    renameTo: generator => `pages/${generator.pageFolderName}/${generator.pageFolderName}.component.ts`
                },
            ]
        }
    ],
    test: [
        {
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                {
                    file: 'spec/app/pages/page.component.spec.ts',
                    renameTo: generator => `spec/app/pages/${generator.pageFolderName}/${generator.pageFolderName}.component.spec.ts`
                },
                {
                    file: 'spec/app/pages/page.service.spec.ts',
                    renameTo: generator => `spec/app/pages/${generator.pageFolderName}/${generator.pageFolderName}.service.spec.ts`
                }
            ]
        },
        {
            condition: generator => generator.protractorTests,
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                {
                    file: 'e2e/pages/page.page-object.ts',
                    renameTo: generator => `e2e/pages/${generator.pageFolderName}/${generator.pageFolderName}.page-object.ts`
                },
                {
                    file: 'e2e/pages/page.spec.ts',
                    renameTo: generator => `e2e/pages/${generator.pageFolderName}/${generator.pageFolderName}.spec.ts`
                }
            ]
        }
    ]
};


module.exports = {
    writeFiles
};

function writeFiles() {
    if (this.skipClient) return;

    this.pageFolderName = this.pageName.toLowerCase();
    this.pageInstance = _.lowerFirst(this.pageName);

    // write client side files for Vue.js
    this.writeFilesToDisk(vueFiles, this, false, `${CLIENT_VUE_TEMPLATES_DIR}`);

    // Add page paths to routing system
    utils.addPageToRouterImport(this, this.pageName, this.pageFolderName);
    utils.addPageToRouter(this, this.pageName, this.pageFolderName);
    // Add page services to main
    utils.addPageServiceToMainImport(this, this.pageName, this.pageFolderName);
    utils.addPageServiceToMain(this, this.pageName, this.pageInstance);

    // Add tests to protractor conf
    if (this.protractorTests) {
        utils.addPageProtractorConf(this, this.pageFolderName);
    }
}
