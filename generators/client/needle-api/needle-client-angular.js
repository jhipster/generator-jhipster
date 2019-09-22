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
const chalk = require('chalk');
const _ = require('lodash');
const needleClientBase = require('./needle-client');
const constants = require('../../generator-constants');
const jhipsterUtils = require('../../utils');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

module.exports = class extends needleClientBase {
    addGlobalSCSSStyle(style, comment) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`;
        this.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-main');
    }

    addVendorSCSSStyle(style, comment) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`;
        super.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-vendor');
    }

    addModule(appName, angularName, folderName, fileName, enableTranslation, clientFramework) {
        const modulePath = `${CLIENT_MAIN_SRC_DIR}app/app.module.ts`;
        const importNeedle = 'jhipster-needle-angular-add-module-import';
        const moduleNeedle = 'jhipster-needle-angular-add-module';

        this._genericAddModule(
            appName,
            angularName,
            folderName,
            fileName,
            enableTranslation,
            clientFramework,
            modulePath,
            importNeedle,
            moduleNeedle
        );
    }

    addToAdminModule(appName, adminAngularName, adminFolderName, adminFileName, enableTranslation, clientFramework) {
        const adminModulePath = `${CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`;
        const importNeedle = 'jhipster-needle-add-admin-module-import';
        const moduleNeedle = 'jhipster-needle-add-admin-module';

        this._genericAddModule(
            appName,
            adminAngularName,
            adminFolderName,
            adminFileName,
            enableTranslation,
            clientFramework,
            adminModulePath,
            importNeedle,
            moduleNeedle
        );
    }

    _genericAddModule(
        appName,
        angularName,
        folderName,
        fileName,
        enableTranslation,
        clientFramework,
        modulePath,
        importNeedle,
        moduleNeedle
    ) {
        const errorMessage = `${chalk.yellow('Reference to ') +
            angularName +
            folderName +
            fileName +
            enableTranslation +
            clientFramework} ${chalk.yellow(`not added to ${modulePath}.\n`)}`;

        const importRewriteFileModel = this._generateRewriteFileModelWithImportStatement(
            appName,
            angularName,
            folderName,
            fileName,
            modulePath,
            importNeedle
        );
        this.addBlockContentToFile(importRewriteFileModel, errorMessage);

        const moduleRewriteFileModel = this._generateRewriteFileModelAddModule(appName, angularName, modulePath, moduleNeedle);
        this.addBlockContentToFile(moduleRewriteFileModel, errorMessage);
    }

    _generateRewriteFileModelWithImportStatement(appName, angularName, folderName, fileName, modulePath, needle) {
        const importStatement = this._generateImportStatement(appName, angularName, folderName, fileName);

        return this.generateFileModel(modulePath, needle, this.generator.stripMargin(importStatement));
    }

    _generateImportStatement(appName, angularName, folderName, fileName) {
        let importStatement = `|import { ${appName}${angularName}Module } from './${folderName}/${fileName}.module';`;
        if (importStatement.length > constants.LINE_LENGTH) {
            // prettier-ignore
            importStatement = `|import {
                        |    ${appName}${angularName}Module
                        |} from './${folderName}/${fileName}.module';`;
        }

        return importStatement;
    }

    _generateRewriteFileModelAddModule(appName, angularName, modulePath, needle) {
        return this.generateFileModel(modulePath, needle, this.generator.stripMargin(`|${appName}${angularName}Module,`));
    }

    addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu) {
        const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`;
        const entityMenuPath = `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`;
        const entityEntry =
            // prettier-ignore
            this.generator.stripMargin(`|<li>
                             |                        <a class="dropdown-item" routerLink="${routerName}" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="collapseNavbar()">
                             |                            <fa-icon icon="asterisk" fixedWidth="true"></fa-icon>
                             |                            <span${enableTranslation ? ` jhiTranslate="global.menu.entities.${entityTranslationKeyMenu}"` : ''}>${_.startCase(routerName)}</span>
                             |                        </a>
                             |                    </li>`);
        const rewriteFileModel = this.generateFileModel(entityMenuPath, 'jhipster-needle-add-entity-to-menu', entityEntry);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addElementToMenu(routerName, glyphiconName, enableTranslation, translationKeyMenu = routerName) {
        const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`;
        const entityMenuPath = `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`;
        // prettier-ignore
        const entityEntry = `<li class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                                <a class="nav-link" routerLink="${routerName}" (click)="collapseNavbar()">
                                    <fa-icon [icon]="'${glyphiconName}'" [fixedWidth]="true"></fa-icon>&nbsp;
                                    <span${enableTranslation ? ` jhiTranslate="global.menu.${translationKeyMenu}"` : ''}>${_.startCase(routerName)}</span>
                                </a>
                            </li>`;
        const rewriteFileModel = this.generateFileModel(entityMenuPath, 'jhipster-needle-add-element-to-menu', entityEntry);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addElementToAdminMenu(routerName, glyphiconName, enableTranslation, translationKeyMenu = routerName) {
        const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to admin menu.\n')}`;
        const navbarAdminPath = `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`;
        // prettier-ignore
        const entityEntry = `<li>
                        <a class="dropdown-item" routerLink="${routerName}" routerLinkActive="active" (click)="collapseNavbar()">
                            <fa-icon [icon]="'${glyphiconName}'" [fixedWidth]="true"></fa-icon>&nbsp;
                            <span${enableTranslation ? ` jhiTranslate="global.menu.admin.${translationKeyMenu}"` : ''}>${_.startCase(routerName)}</span>
                        </a>
                    </li>`;
        const rewriteFileModel = this.generateFileModel(navbarAdminPath, 'jhipster-needle-add-element-to-admin-menu', entityEntry);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addEntityToModule(entityInstance, entityClass, entityAngularName, entityFolderName, entityFileName, entityUrl, microServiceName) {
        const entityModulePath = `${CLIENT_MAIN_SRC_DIR}app/entities/entity.module.ts`;
        const errorMessage = `${chalk.yellow('Reference to ') +
            entityInstance +
            entityClass +
            entityFolderName +
            entityFileName} ${chalk.yellow(`not added to ${entityModulePath}.\n`)}`;

        try {
            const isSpecificEntityAlreadyGenerated = jhipsterUtils.checkStringInFile(
                entityModulePath,
                `path: '${entityUrl}'`,
                this.generator
            );

            if (!isSpecificEntityAlreadyGenerated) {
                const appName = this.generator.getAngularXAppName();
                const isAnyEntityAlreadyGenerated = jhipsterUtils.checkStringInFile(entityModulePath, 'loadChildren', this.generator);

                const modulePath = `./${entityFolderName}/${entityFileName}.module`;
                const moduleName = microServiceName
                    ? `${this.generator.upperFirstCamelCase(microServiceName)}${entityAngularName}Module`
                    : `${appName}${entityAngularName}Module`;

                const splicable = isAnyEntityAlreadyGenerated
                    ? `|,{
                            |                path: '${entityUrl}',
                            |                loadChildren: () => import('${modulePath}').then(m => m.${moduleName})
                            |            }`
                    : `|{
                                |                path: '${entityUrl}',
                                |                loadChildren: () => import('${modulePath}').then(m => m.${moduleName})
                                |            }`;
                const rewriteFileModel = this.generateFileModel(
                    entityModulePath,
                    'jhipster-needle-add-entity-route',
                    this.generator.stripMargin(splicable)
                );

                this.addBlockContentToFile(rewriteFileModel, errorMessage);
            }
        } catch (e) {
            this.generator.debug('Error:', e);
        }
    }
};
