const needleClientBase = require('./needle-client');
const constants = require('../../generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

module.exports = class extends needleClientBase {
    addAppCSSStyle(style, comment) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}app/app.css`;
        this.addStyle(style, comment, filePath, 'jhipster-needle-css-add-app');
    }

    addAppSCSSStyle(style, comment) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}app/app.scss`;
        this.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-app');
    }
};
