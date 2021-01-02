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
const chalk = require('chalk');
const _ = require('lodash');
const needleClientBase = require('./needle-client');
const constants = require('../../generator-constants');
const jhipsterUtils = require('../../utils');

module.exports = class extends needleClientBase {
    addGlobalSCSSStyle(style, comment) {
        const filePath = `${this.CLIENT_MAIN_SRC_DIR}content/scss/global.scss`;
        this.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-main');
    }

    addVendorSCSSStyle(style, comment) {
        const filePath = `${this.CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`;
        super.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-vendor');
    }

    addModule(appName, angularName, folderName, fileName, enableTranslation, clientFramework) {
        const modulePath = `${this.CLIENT_MAIN_SRC_DIR}app/app.module.ts`;
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
        const adminModulePath = `${this.CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`;
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
        const errorMessage = `${
            chalk.yellow('Reference to ') + angularName + folderName + fileName + enableTranslation + clientFramework
        } ${chalk.yellow(`not added to ${modulePath}.\n`)}`;

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

    addIcon(iconName) {
        const iconsPath = `${this.CLIENT_MAIN_SRC_DIR}app/core/icons/font-awesome-icons.ts`;
        const iconImport = `fa${this.generator.upperFirstCamelCase(iconName)}`;
        if (!jhipsterUtils.checkRegexInFile(iconsPath, new RegExp(`\\b${iconImport}\\b`), this.generator)) {
            try {
                jhipsterUtils.replaceContent(
                    {
                        file: iconsPath,
                        pattern: /(\r?\n)(\s*)\/\/ jhipster-needle-add-icon-import/g,
                        content: `\n  ${iconImport},\n  // jhipster-needle-add-icon-import`,
                    },
                    this.generator
                );
            } catch (e) {
                this.generator.log(
                    chalk.yellow('\nUnable to find ') +
                        iconsPath +
                        chalk.yellow(' or other error. Icon imports not updated with icon ') +
                        iconImport +
                        chalk.yellow('.\n')
                );
                this.generator.debug('Error:', e);
            }
        }
    }

    addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue = _.startCase(routerName)) {
        const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`;
        const entityMenuPath = `${this.CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`;
        const entityEntry =
            // prettier-ignore
            this.generator.stripMargin(`|<li>
                             |                        <a class="dropdown-item" routerLink="${routerName}" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="collapseNavbar()">
                             |                            <fa-icon icon="asterisk" [fixedWidth]="true"></fa-icon>
                             |                            <span${enableTranslation ? ` jhiTranslate="global.menu.entities.${entityTranslationKeyMenu}"` : ''}>${entityTranslationValue}</span>
                             |                        </a>
                             |                    </li>`);
        const rewriteFileModel = this.generateFileModel(entityMenuPath, 'jhipster-needle-add-entity-to-menu', entityEntry);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addElementToMenu(routerName, iconName, enableTranslation, translationKeyMenu = routerName) {
        const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`;
        const entityMenuPath = `${this.CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`;
        // prettier-ignore
        const entityEntry = `<li class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                                <a class="nav-link" routerLink="${routerName}" (click)="collapseNavbar()">
                                    <fa-icon icon="${iconName}" [fixedWidth]="true"></fa-icon>
                                    <span${enableTranslation ? ` jhiTranslate="global.menu.${translationKeyMenu}"` : ''}>${_.startCase(routerName)}</span>
                                </a>
                            </li>`;
        const rewriteFileModel = this.generateFileModel(entityMenuPath, 'jhipster-needle-add-element-to-menu', entityEntry);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
        this.addIcon(iconName);
    }

    addElementToAdminMenu(routerName, iconName, enableTranslation, translationKeyMenu = routerName) {
        const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to admin menu.\n')}`;
        const navbarAdminPath = `${this.CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`;
        // prettier-ignore
        const entityEntry = `<li>
                        <a class="dropdown-item" routerLink="${routerName}" routerLinkActive="active" (click)="collapseNavbar()">
                            <fa-icon icon="${iconName}" [fixedWidth]="true"></fa-icon>
                            <span${enableTranslation ? ` jhiTranslate="global.menu.admin.${translationKeyMenu}"` : ''}>${_.startCase(routerName)}</span>
                        </a>
                    </li>`;
        const rewriteFileModel = this.generateFileModel(navbarAdminPath, 'jhipster-needle-add-element-to-admin-menu', entityEntry);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
        this.addIcon(iconName);
    }

    _addRoute(route, modulePath, moduleName, needleName, filePath) {
        const isRouteAlreadyAdded = jhipsterUtils.checkStringInFile(filePath, `path: '${route}'`, this.generator);
        if (isRouteAlreadyAdded) {
            return;
        }
        const errorMessage = `${chalk.yellow('Route ') + route + chalk.yellow(` not added to ${filePath}.\n`)}`;
        const routingEntry = this.generator.stripMargin(
            `{
            |        path: '${route}',
            |        loadChildren: () => import('${modulePath}').then(m => m.${moduleName})
            |      },`
        );
        const rewriteFileModel = this.generateFileModel(filePath, needleName, routingEntry);
        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addEntityToModule(entityInstance, entityClass, entityAngularName, entityFolderName, entityFileName, entityUrl, microServiceName) {
        const entityModulePath = `${this.CLIENT_MAIN_SRC_DIR}app/entities/entity-routing.module.ts`;
        try {
            const isSpecificEntityAlreadyGenerated = jhipsterUtils.checkStringInFile(
                entityModulePath,
                `path: '${entityUrl}'`,
                this.generator
            );

            if (!isSpecificEntityAlreadyGenerated) {
                const modulePath = `./${entityFolderName}/${entityFileName}-routing.module`;
                const moduleName = microServiceName
                    ? `${this.generator.upperFirstCamelCase(microServiceName)}${entityAngularName}RoutingModule`
                    : `${entityAngularName}RoutingModule`;

                this._addRoute(entityUrl, modulePath, moduleName, 'jhipster-needle-add-entity-route', entityModulePath);
            }
        } catch (e) {
            this.generator.debug('Error:', e);
        }
    }

    addAdminRoute(route, modulePath, moduleName) {
        const adminModulePath = `${this.CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`;
        this._addRoute(route, modulePath, moduleName, 'jhipster-needle-add-admin-route', adminModulePath);
    }
};
