const needleBase = require('./needle-base');

module.exports = class extends needleBase {
    addStyle(style, comment, filePath, needle) {
        const styleBlock = this.mergeStyleAndComment(style, comment);
        this.addBlockContentToFile(filePath, styleBlock, needle);
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
