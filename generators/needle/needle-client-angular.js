const needleClientBase = require('./needle-client-base');
const constants = require('../generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

module.exports = class extends needleClientBase {
    addGlobalCSSStyle(style, comment) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`;
        this.addStyle(style, comment, filePath, 'jhipster-needle-css-add-global');
    }

    addGlobalSCSSStyle(style, comment) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}content/css/global.css`;
        this.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-global');
    }

    addVendorSCSSStyle(style, comment) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`;
        super.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-vendor');
    }
};
