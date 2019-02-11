/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const utils = require('../utils');

/* Constants use throughout */
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const VUE_DIR = 'src/main/webapp/app/';
const CLIENT_VUE_TEMPLATES_DIR = 'vue';

/**
* The default is to use a file path string. It implies use of the template method.
* For any other config an object { file:.., method:.., template:.. } can be used
*/

const vueFiles = {
    client: [
        {
            path: VUE_DIR,
            templates: [
                {
                    file: 'entities/entity-details.vue',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-details.vue`
                },
                {
                    file: 'entities/entity-details.component.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-details.component.ts`
                },
                {
                    file: 'entities/entity-update.vue',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-update.vue`
                },
                {
                    file: 'entities/entity-update.component.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-update.component.ts`
                },
                {
                    file: 'entities/entity.vue',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.vue`
                },
                {
                    file: 'entities/entity.component.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.component.ts`
                },
                {
                    file: 'entities/entity.service.ts',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.service.ts`
                },
                {
                    file: 'entities/entity.model.ts',
                    // using entityModelFileName so that there is no conflict when generating microservice entities
                    renameTo: generator => `shared/model/${generator.entityModelFileName}.model.ts`
                }
            ]
        }
    ],
    test: [
        {
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                {
                    file: 'spec/app/entities/entity-management.component.spec.ts',
                    renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}.component.spec.ts`
                },
                {
                    file: 'spec/app/entities/entity-management-detail.component.spec.ts',
                    renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}-detail.component.spec.ts`
                },
                {
                    file: 'spec/app/entities/entity-management-update.component.spec.ts',
                    renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}-update.component.spec.ts`
                },
                {
                    file: 'spec/app/entities/entity-management.service.spec.ts',
                    renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}.service.spec.ts`
                }
            ]
        },
        {
            condition: generator => generator.protractorTests,
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                {
                    file: 'e2e/entities/entity-page-object.ts',
                    renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}.page-object.ts`
                },
                {
                    file: 'e2e/entities/entity.spec.ts',
                    renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}.spec.ts`
                },
                {
                    file: 'e2e/entities/entity-update-page-object.ts',
                    renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}-update.page-object.ts`
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
    // write client side files for Vue.js
    this.writeFilesToDisk(vueFiles, this, false, `${CLIENT_VUE_TEMPLATES_DIR}`);

    // Add entity to menu
    const className = this.entityClass;
    const entityName = this.entityInstance;
    const entityAngularName = this.entityAngularName;
    utils.addEntityToMenu(this, this.entityFileName, this.entityTranslationKeyMenu, className);

    // Add entity paths to routing system
    utils.addEntityToRouterImport(this, entityAngularName, this.entityFileName, this.entityFolderName);
    utils.addEntityToRouter(this, entityName, this.entityFileName, entityAngularName);

    // Add entity services to main
    utils.addEntityServiceToMainImport(this, className, this.entityFileName, this.entityFolderName);
    utils.addEntityServiceToMain(this, entityName, className);

    if (!this.enableTranslation) {
        utils.replaceTranslation(this, [
            `app/entities/${this.entityFolderName}/${this.entityFileName}.vue`,
            `app/entities/${this.entityFolderName}/${this.entityFileName}-update.vue`,
            `app/entities/${this.entityFolderName}/${this.entityFileName}-details.vue`
        ]);
    }
}
