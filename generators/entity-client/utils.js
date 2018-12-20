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
    addEntityToRouter,
    addEntityServiceToMainImport,
    addEntityServiceToMainConst,
    addEntityServiceToMain
};

function addEntityToMenu(generator, entityName, translationKey, className) {
    const menuI18nTitle = generator.enableTranslation ? `v-text="$t('global.menu.entities.${translationKey}')"` : '';
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/core/jhi-navbar/jhi-navbar.vue`,
            needle: 'jhipster-needle-add-entity-to-menu',
            splicable: [
                // prettier-ignore
                `<b-dropdown-item to="/entity/${entityName}" class="dropdown-item" v-on:click="collapseNavbar()">
                    <font-awesome-icon icon="asterisk" />
                    <span ${menuI18nTitle}>${className}</span>
              </b-dropdown-item>`
            ]
        },
        generator
    );
}

function addEntityToRouterImport(generator, className, fileName, folderName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/router/index.ts`,
            needle: 'jhipster-needle-add-entity-to-router-import',
            splicable: [generator.stripMargin(
                // prettier-ignore
                `|// prettier-ignore
                |const ${className} = () => import('../entities/${folderName}/${fileName}.vue');
                |const ${className}Update = () => import('../entities/${folderName}/${fileName}-update.vue');
                |const ${className}Details = () => import('../entities/${folderName}/${fileName}-details.vue');`
            )]
        },
        generator
    );
}

function addEntityToRouter(generator, entityName, entityFileName, className) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/router/index.ts`,
            needle: 'jhipster-needle-add-entity-to-router',
            splicable: [generator.stripMargin(
                // prettier-ignore
                `|, // prettier-ignore
                |    { path: '/entity/${entityFileName}', name: '${className}', component: ${className} },
                |    { path: '/entity/${entityFileName}/new', name: '${className}Create', component: ${className}Update },
                |    { path: '/entity/${entityFileName}/:${entityName}Id/edit', name: '${className}Edit', component: ${className}Update },
                |    { path: '/entity/${entityFileName}/:${entityName}Id/view', name: '${className}View', component: ${className}Details }`
            )]
        },
        generator
    );
}

function addEntityServiceToMainImport(generator, className, fileName, folderName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/main.ts`,
            needle: 'jhipster-needle-add-entity-service-to-main-import',
            splicable: [generator.stripMargin(
                // prettier-ignore
                `|import ${className}Service from '@/entities/${folderName}/${fileName}.service';`
            )]
        },
        generator
    );
}

function addEntityServiceToMainConst(generator, entityName, className) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/main.ts`,
            needle: 'jhipster-needle-add-entity-service-to-main-declaration',
            splicable: [generator.stripMargin(
                // prettier-ignore
                `|const ${entityName}Service = new ${className}Service();`
            )]
        },
        generator
    );
}

function addEntityServiceToMain(generator, entityName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/main.ts`,
            needle: 'jhipster-needle-add-entity-service-to-main',
            splicable: [generator.stripMargin(
                // prettier-ignore
                `|,
                |    ${entityName}Service: () => ${entityName}Service`
            )]
        },
        generator
    );
}
