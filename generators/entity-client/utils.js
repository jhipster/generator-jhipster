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
const jhipsterUtils = require('generator-jhipster/generators/utils');
const constants = require('generator-jhipster/generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

module.exports = {
    addEntityToMenu,
    addEntityToRouterImport,
    addEntityToRouter
};

function addEntityToMenu(generator, entityName, className) {
    const menuI18nTitle = generator.enableTranslation ? `v-text="$t('global.menu.entities.${entityName}')"` : '';
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/components/JhiNavBar.vue`,
            needle: 'jhipster-needle-add-entity-to-menu',
            splicable: [
                // prettier-ignore
                `<router-link to="${entityName}" tag="b-dropdown-item" class="dropdown-item" v-on:click="collapseNavbar()">
                    <font-awesome-icon icon="asterisk" />
                    <span ${menuI18nTitle}>${className}</span>
              </router-link>`
            ]
        },
        generator
    );
}

function addEntityToRouterImport(generator, className, fileName, folderName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/router/index.js`,
            needle: 'jhipster-needle-add-entity-to-router-import',
            splicable: [
                // prettier-ignore
                `
                import ${className} from '../entities/${folderName}/${fileName}'
                import ${className}Update from '../entities/${folderName}/${fileName}-update'
                import ${className}Details from '../entities/${folderName}/${fileName}-details'
                `
            ]
        },
        generator
    );
}

function addEntityToRouter(generator, entityName, className) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/router/index.js`,
            needle: 'jhipster-needle-add-entity-to-router',
            splicable: [
                // prettier-ignore
                `,{
                    path: '/${entityName}',
                    name: '${className}',
                    component: ${className}
              },{
                   path: '/${entityName}/new',
                   name: '${className}Create',
                   component: ${className}Update
             },{
                   path: '/${entityName}/:${entityName}Id/edit',
                   name: '${className}Edit',
                   component: ${className}Update
             },{
                   path: '/${entityName}/:${entityName}Id/view',
                   name: '${className}View',
                   component: ${className}Details
             }
              `
            ]
        },
        generator
    );
}
