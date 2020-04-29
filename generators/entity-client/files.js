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
const _ = require('lodash');
const faker = require('faker');
const utils = require('../utils');
const constants = require('../generator-constants');

/* Use customized randexp */
const Randexp = utils.RandexpWithFaker;

/* Constants use throughout */
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const ANGULAR_DIR = constants.ANGULAR_DIR;
const REACT_DIR = constants.ANGULAR_DIR;
const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

const CLIENT_NG2_TEMPLATES_DIR = 'angular';
const CLIENT_REACT_TEMPLATES_DIR = 'react';

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */

const angularFiles = {
    client: [
        {
            path: ANGULAR_DIR,
            templates: [
                {
                    file: 'entities/entity.model.ts',
                    // using entityModelFileName so that there is no conflict when generating microservice entities
                    renameTo: generator => `shared/model/${generator.entityModelFileName}.model.ts`,
                },
            ],
        },
        {
            condition: generator => !generator.embedded,
            path: ANGULAR_DIR,
            templates: [
                {
                    file: 'entities/entity-management.component.html',
                    method: 'processHtml',
                    template: true,
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.component.html`,
                },
                {
                    file: 'entities/entity-management-detail.component.html',
                    method: 'processHtml',
                    template: true,
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-detail.component.html`,
                },
                {
                    file: 'entities/entity-management.module.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.module.ts`,
                },
                {
                    file: 'entities/entity-management.route.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.route.ts`,
                },
                {
                    file: 'entities/entity-management.component.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.component.ts`,
                },
                {
                    file: 'entities/entity-management-detail.component.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-detail.component.ts`,
                },
                {
                    file: 'entities/entity.service.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.service.ts`,
                },
            ],
        },
        {
            condition: generator => !generator.readOnly && !generator.embedded,
            path: ANGULAR_DIR,
            templates: [
                {
                    file: 'entities/entity-management-update.component.html',
                    method: 'processHtml',
                    template: true,
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-update.component.html`,
                },
                {
                    file: 'entities/entity-management-delete-dialog.component.html',
                    method: 'processHtml',
                    template: true,
                    renameTo: generator =>
                        `entities/${generator.entityFolderName}/${generator.entityFileName}-delete-dialog.component.html`,
                },
                {
                    file: 'entities/entity-management-update.component.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-update.component.ts`,
                },
                {
                    file: 'entities/entity-management-delete-dialog.component.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-delete-dialog.component.ts`,
                },
            ],
        },
    ],
    test: [
        {
            condition: generator => !generator.embedded,
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                {
                    file: 'spec/app/entities/entity-management-detail.component.spec.ts',
                    renameTo: generator =>
                        `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}-detail.component.spec.ts`,
                },
                {
                    file: 'spec/app/entities/entity-management.component.spec.ts',
                    renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}.component.spec.ts`,
                },
                {
                    file: 'spec/app/entities/entity-management.service.spec.ts',
                    renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}.service.spec.ts`,
                },
            ],
        },
        {
            condition: generator => !generator.readOnly && !generator.embedded,
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                {
                    file: 'spec/app/entities/entity-management-update.component.spec.ts',
                    renameTo: generator =>
                        `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}-update.component.spec.ts`,
                },
                {
                    file: 'spec/app/entities/entity-management-delete-dialog.component.spec.ts',
                    renameTo: generator =>
                        `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}-delete-dialog.component.spec.ts`,
                },
            ],
        },
        {
            condition: generator => generator.protractorTests && !generator.embedded,
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                {
                    file: 'e2e/entities/entity-page-object.ts',
                    renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}.page-object.ts`,
                },
                {
                    file: 'e2e/entities/entity.spec.ts',
                    renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}.spec.ts`,
                },
            ],
        },
    ],
};

const reactFiles = {
    client: [
        {
            condition: generator => !generator.embedded,
            path: REACT_DIR,
            templates: [
                {
                    file: 'entities/entity-detail.tsx',
                    method: 'processJsx',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-detail.tsx`,
                },
                {
                    file: 'entities/entity.tsx',
                    method: 'processJsx',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.tsx`,
                },
                {
                    file: 'entities/entity.reducer.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.reducer.ts`,
                },
                {
                    file: 'entities/index.tsx',
                    method: 'processJsx',
                    renameTo: generator => `entities/${generator.entityFolderName}/index.tsx`,
                },
            ],
        },
        {
            path: REACT_DIR,
            templates: [
                {
                    file: 'entities/entity.model.ts',
                    renameTo: generator => `shared/model/${generator.entityModelFileName}.model.ts`,
                },
            ],
        },
        {
            condition: generator => !generator.readOnly && !generator.embedded,
            path: REACT_DIR,
            templates: [
                {
                    file: 'entities/entity-delete-dialog.tsx',
                    method: 'processJsx',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-delete-dialog.tsx`,
                },
                {
                    file: 'entities/entity-update.tsx',
                    method: 'processJsx',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-update.tsx`,
                },
            ],
        },
    ],
    test: [
        {
            condition: generator => !generator.embedded,
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                {
                    file: 'spec/app/entities/entity-reducer.spec.ts',
                    renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}-reducer.spec.ts`,
                },
            ],
        },
        {
            condition: generator => generator.protractorTests && !generator.embedded,
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                {
                    file: 'e2e/entities/entity-page-object.ts',
                    renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}.page-object.ts`,
                },
                {
                    file: 'e2e/entities/entity.spec.ts',
                    renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}.spec.ts`,
                },
            ],
        },
        {
            condition: generator => generator.protractorTests && !generator.readOnly && !generator.embedded,
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                {
                    file: 'e2e/entities/entity-update-page-object.ts',
                    renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}-update.page-object.ts`,
                },
            ],
        },
    ],
};

module.exports = {
    writeFiles,
    angularFiles,
    reactFiles,
};

function addEnumerationFiles(generator, templateDir, clientFolder) {
    generator.fields.forEach(field => {
        if (field.fieldIsEnum === true) {
            const enumFileName = _.kebabCase(field.fieldType);
            const enumInfo = {
                ...utils.getEnumInfo(field, generator.clientRootFolder),
                angularAppName: generator.angularAppName,
                packageName: generator.packageName,
            };
            if (!generator.skipClient) {
                generator.template(
                    `${generator.fetchFromInstalledJHipster(
                        `entity-client/templates/${templateDir}`
                    )}/${clientFolder}entities/enumerations/enum.model.ts.ejs`,
                    `${clientFolder}shared/model/enumerations/${enumFileName}.model.ts`,
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
            const randExp = new Randexp(field.fieldValidateRulesPattern);
            field.fieldValidateSampleString = randExp.gen();
        }
    });
}

function writeFiles() {
    return {
        setupReproducibility() {
            if (this.skipClient) return;

            // In order to have consistent results with Faker, restart seed with current entity name hash.
            faker.seed(utils.stringHashCode(this.name.toLowerCase()));
        },

        writeClientFiles() {
            if (this.skipClient) return;
            if (this.protractorTests) {
                addSampleRegexTestingStrings(this);
            }

            let files;
            let destDir;
            let templatesDir;
            let microserviceName = this.microserviceName;

            if (this.clientFramework === ANGULAR) {
                files = angularFiles;
                destDir = ANGULAR_DIR;
                templatesDir = CLIENT_NG2_TEMPLATES_DIR;
                microserviceName = this.microserviceName;
            } else if (this.clientFramework === REACT) {
                files = reactFiles;
                destDir = REACT_DIR;
                templatesDir = CLIENT_REACT_TEMPLATES_DIR;
            } else {
                if (!this.embedded) {
                    this.addEntityToMenu(this.entityStateName, this.enableTranslation, this.clientFramework, this.entityTranslationKeyMenu);
                }
                return;
            }

            const entityTemplatesDir = `entity-client/templates/${templatesDir}`;
            this.writeFilesToDisk(files, this, false, this.fetchFromInstalledJHipster(entityTemplatesDir));
            addEnumerationFiles(this, templatesDir, destDir);

            if (!this.embedded) {
                this.addEntityToModule(
                    this.entityInstance,
                    this.entityClass,
                    this.entityAngularName,
                    this.entityFolderName,
                    this.entityFileName,
                    this.entityUrl,
                    this.clientFramework,
                    microserviceName
                );
                this.addEntityToMenu(this.entityStateName, this.enableTranslation, this.clientFramework, this.entityTranslationKeyMenu);
            }
        },
    };
}
