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
const utils = require('../utils');
const constants = require('../generator-constants');
const { angularFiles } = require('./files-angular.cjs');
const { reactFiles } = require('./files-react.cjs');
const { vueFiles } = require('./files-vue.cjs');
const { cleanupCypressEntityFiles, writeCypressEntityFiles, cypressEntityFiles: commonFiles } = require('./files-cypress.cjs');

/* Constants use throughout */
const { ANGULAR_DIR, REACT_DIR, VUE_DIR } = constants;
const { ANGULAR, REACT, VUE } = constants.SUPPORTED_CLIENT_FRAMEWORKS;

const CLIENT_COMMON_TEMPLATES_DIR = 'common';
const CLIENT_NG2_TEMPLATES_DIR = 'angular';
const CLIENT_REACT_TEMPLATES_DIR = 'react';
const CLIENT_VUE_TEMPLATES_DIR = 'vue';

module.exports = {
  writeFiles,
  addToMenu,
  angularFiles,
  reactFiles,
  vueFiles,
  commonFiles,
};

function addEnumerationFiles(generator, clientFolder) {
  generator.fields.forEach(field => {
    if (field.fieldIsEnum === true) {
      const { enumFileName } = field;
      const enumInfo = {
        ...utils.getEnumInfo(field, generator.clientRootFolder),
        frontendAppName: generator.frontendAppName,
        packageName: generator.packageName,
      };
      if (!generator.skipClient) {
        const modelPath = generator.clientFramework === ANGULAR ? 'entities' : 'shared/model';
        const destinationFile = generator.destinationPath(`${clientFolder}${modelPath}/enumerations/${enumFileName}.model.ts`);
        generator.template(
          `${generator.fetchFromInstalledJHipster(
            `entity-client/templates/${CLIENT_COMMON_TEMPLATES_DIR}`
          )}/${clientFolder}entities/enumerations/enum.model.ts.ejs`,
          destinationFile,
          generator,
          {},
          enumInfo
        );
      }
    }
  });
}

function addSampleRegexTestingStrings(generator) {
  generator.fields.forEach(field => {
    if (field.fieldValidateRulesPattern !== undefined) {
      const randExp = field.createRandexp();
      field.fieldValidateSampleString = randExp.gen();
      field.fieldValidateModifiedString = randExp.gen();
    }
  });
}

function writeFiles() {
  return {
    writeClientFiles() {
      if (this.skipClient) return undefined;
      if (this.protractorTests) {
        addSampleRegexTestingStrings(this);
      }

      let files;
      let clientMainSrcDir;
      let templatesDir;

      if (this.clientFramework === ANGULAR) {
        files = angularFiles;
        clientMainSrcDir = ANGULAR_DIR;
        templatesDir = CLIENT_NG2_TEMPLATES_DIR;
      } else if (this.clientFramework === REACT) {
        files = reactFiles;
        clientMainSrcDir = REACT_DIR;
        templatesDir = CLIENT_REACT_TEMPLATES_DIR;
      } else if (this.clientFramework === VUE) {
        files = vueFiles;
        clientMainSrcDir = VUE_DIR;
        templatesDir = CLIENT_VUE_TEMPLATES_DIR;
      }

      addEnumerationFiles(this, clientMainSrcDir);
      if (!files) return undefined;

      return this.writeFiles({ sections: files, rootTemplatesPath: templatesDir });
    },

    cleanupCypressEntityFiles,
    writeCypressEntityFiles,
  };
}

function addToMenu() {
  if (this.skipClient) return;

  if (!this.embedded) {
    this.addEntityToModule();
    this.addEntityToMenu(
      this.entityPage,
      this.enableTranslation,
      this.clientFramework,
      this.entityTranslationKeyMenu,
      this.entityClassHumanized
    );
  }
}
