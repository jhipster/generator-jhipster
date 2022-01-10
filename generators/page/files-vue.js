/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const constants = require('../generator-constants');
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
          override: generator => generator.options.recreate,
          file: 'pages/page.vue',
          renameTo: generator => `pages/${generator.pageFolderName}/${generator.pageFileName}.vue`,
        },
        {
          override: generator => generator.options.recreate,
          file: 'pages/page.service.ts',
          renameTo: generator => `pages/${generator.pageFolderName}/${generator.pageFileName}.service.ts`,
        },
        {
          override: generator => generator.options.recreate,
          file: 'pages/page.component.ts',
          renameTo: generator => `pages/${generator.pageFolderName}/${generator.pageFileName}.component.ts`,
        },
      ],
    },
  ],
  test: [
    {
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        {
          override: generator => generator.options.recreate,
          file: 'spec/app/pages/page.component.spec.ts',
          renameTo: generator => `spec/app/pages/${generator.pageFolderName}/${generator.pageFileName}.component.spec.ts`,
        },
        {
          override: generator => generator.options.recreate,
          file: 'spec/app/pages/page.service.spec.ts',
          renameTo: generator => `spec/app/pages/${generator.pageFolderName}/${generator.pageFileName}.service.spec.ts`,
        },
      ],
    },
    {
      condition: generator => generator.protractorTests,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        {
          override: generator => generator.options.recreate,
          file: 'e2e/pages/page.page-object.ts',
          renameTo: generator => `e2e/pages/${generator.pageFolderName}/${generator.pageFileName}.page-object.ts`,
        },
        {
          override: generator => generator.options.recreate,
          file: 'e2e/pages/page.spec.ts',
          renameTo: generator => `e2e/pages/${generator.pageFolderName}/${generator.pageFileName}.spec.ts`,
        },
      ],
    },
  ],
};

module.exports = {
  writeFiles,
  customizeFiles,
};

function writeFiles() {
  // write client side files for Vue
  return this.writeFilesToDisk(vueFiles, CLIENT_VUE_TEMPLATES_DIR);
}

function customizeFiles() {
  // Add page paths to routing system
  utils.vueAddPageToRouterImport(this, this.pageName, this.pageFolderName, this.pageFileName);
  utils.vueAddPageToRouter(this, this.pageName, this.pageFileName);
  // Add page services to main
  utils.vueAddPageServiceToMainImport(this, this.pageName, this.pageFileName);
  utils.vueAddPageServiceToMain(this, this.pageName, this.pageInstance);

  // Add tests to protractor conf
  if (this.protractorTests) {
    utils.vueAddPageProtractorConf(this);
  }
}
