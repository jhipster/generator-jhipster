const chalk = require('chalk');
const _ = require('lodash');
const needleClient = require('./needle-client-base');
const constants = require('../../generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

module.exports = class extends needleClient {
    addElementTranslationKey(key, value, language) {
        const errorMessage = ' not added as a new entity in the menu.';
        this._addTranslationKey(key, value, language, errorMessage, 'jhipster-needle-menu-add-element');
    }

    addAdminElementTranslationKey(key, value, language) {
        const errorMessage = ' not added as a new entry in the admin menu.';
        this._addTranslationKey(key, value, language, errorMessage, 'jhipster-needle-menu-add-admin-element');
    }

    addEntityTranslationKey(key, value, language) {
        const errorMessage = ' not added as a new entity in the menu.';
        this._addTranslationKey(key, value, language, errorMessage, 'jhipster-needle-menu-add-entry');
    }

    _addTranslationKey(key, value, language, errorMessage, needle) {
        const fullErrorMessage = `${chalk.yellow(' Reference to ') + language} ${chalk.yellow(errorMessage)}`;
        const fullPath = `${CLIENT_MAIN_SRC_DIR}i18n/${language}/global.json`;
        const rewriteFileModel = this.generateFileModel(fullPath, needle, `"${key}": "${_.startCase(value)}",`);

        this.addBlockContentToFile(rewriteFileModel, fullErrorMessage);
    }
};
