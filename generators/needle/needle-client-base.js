const needleBase = require('./needle-base');

module.exports = class extends needleBase {
    addStyle(style, comment, filePath, needle) {
        const styleBlock = this.mergeStyleAndComment(style, comment);
        const rewriteFileModel = this.generateFileModel(filePath, needle, styleBlock);

        this.addBlockContentToFile(rewriteFileModel, 'Style not added to JHipster app.\n');
    }

    mergeStyleAndComment(style, comment) {
        let styleBlock = '';

        if (comment) {
            styleBlock += '/* ==========================================================================\n';
            styleBlock += `${comment}\n`;
            styleBlock += '========================================================================== */\n';
        }
        styleBlock += `${style}\n`;

        return styleBlock;
    }
};
