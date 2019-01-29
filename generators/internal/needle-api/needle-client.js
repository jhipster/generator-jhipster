const needleBase = require('./needle-base');

const constants = require('../../generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

module.exports = class extends needleBase {
    addStyle(style, comment, filePath, needle) {
        const styleBlock = this._mergeStyleAndComment(style, comment);
        const rewriteFileModel = this.generateFileModel(filePath, needle, styleBlock);

        this.addBlockContentToFile(rewriteFileModel, 'Style not added to JHipster app.\n');
    }

    _mergeStyleAndComment(style, comment) {
        let styleBlock = '';

        if (comment) {
            styleBlock += '/* ==========================================================================\n';
            styleBlock += `${comment}\n`;
            styleBlock += '========================================================================== */\n';
        }
        styleBlock += `${style}\n`;

        return styleBlock;
    }

    addExternalResourcesToRoot(resources, comment) {
        const errorMessage = 'Resources are not added to JHipster app.';
        const indexFilePath = `${CLIENT_MAIN_SRC_DIR}index.html`;
        let resourcesBlock = '';
        if (comment) {
            resourcesBlock += `<!-- ${comment} -->\n`;
        }
        resourcesBlock += `${resources}\n`;
        const rewriteFileModel = this.generateFileModel(indexFilePath, 'jhipster-needle-add-resources-to-root', resourcesBlock);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }
};
