const chalk = require('chalk');
const _ = require('lodash');
const needleClientBase = require('./needle-client');
const constants = require('../../generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

module.exports = class extends needleClientBase {
    addGlobalCSSStyle(style, comment) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}content/css/global.css`;
        this.addStyle(style, comment, filePath, 'jhipster-needle-css-add-global');
    }

    addGlobalSCSSStyle(style, comment) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`;
        this.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-global');
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
        const adminModulePath = `${CLIENT_MAIN_SRC_DIR}app/admin/admin.module.ts`;
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

        return this.generateFileModel(modulePath, needle, this.stripMargin(importStatement));
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
        return this.generateFileModel(modulePath, needle, this.stripMargin(`|${appName}${angularName}Module,`));
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
};
