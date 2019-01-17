const needleClient = require('./needle-client-base');

module.exports = class extends needleClient {
    addElementTranslationKey(key, value, language) {
        const errorMessage = ' not added as a new entity in the menu.';
        this.addTranslationKey(key, value, language, errorMessage, 'jhipster-needle-menu-add-element');
    }

    addAdminElementTranslationKey(key, value, language) {
        const errorMessage = ' not added as a new entry in the admin menu.';
        this.addTranslationKey(key, value, language, errorMessage, 'jhipster-needle-menu-add-admin-element');
    }

    addEntityTranslationKey(key, value, language) {
        const errorMessage = ' not added as a new entity in the menu.';
        this.addTranslationKey(key, value, language, errorMessage, 'jhipster-needle-menu-add-entry');
    }

    addTranslationKey(key, value, language, errorMessage, needle){
        const errorMessage = `${chalk.yellow(' Reference to ') + language} ${chalk.yellow(errorMessage)}`;
        const fullPath = `${CLIENT_MAIN_SRC_DIR}i18n/${language}/global.json`;
        const rewriteFileModel = this.generateFileModel(fullPath,
            needle,
            `"${key}": "${_.startCase(value)}",`);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }
};
