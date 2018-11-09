/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const utils = require('./utils');
const clientUtils = require('../client/utils');

/* Constants use throughout */
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
                    file: 'entities/entity-update.vue',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-update.vue`
                },
                {
                    file: 'entities/entity.vue',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.vue`
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
    // write client side files for VueJS
    this.writeFilesToDisk(vueFiles, this, false, `${CLIENT_VUE_TEMPLATES_DIR}`);

    // Add entity to menu
    const className = this.entityClass;
    const entityName = this.entityInstance;
    utils.addEntityToMenu(this, entityName, className);

    // Add entity paths to routing system
    utils.addEntityToRouterImport(this, className, this.entityFileName, this.entityFolderName);
    utils.addEntityToRouter(this, entityName, className);

    if (!this.enableTranslation) {
        clientUtils.replaceTranslation(this, [
            `app/entities/${this.entityFolderName}/${this.entityFileName}.vue`,
            `app/entities/${this.entityFolderName}/${this.entityFileName}-update.vue`,
            `app/entities/${this.entityFolderName}/${this.entityFileName}-details.vue`
        ]);
    }
}
