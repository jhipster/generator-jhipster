const chalk = require('chalk');
const _ = require('lodash');

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

    addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu) {
        const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`;
        const entityMenuPath = `${CLIENT_MAIN_SRC_DIR}app/shared/layout/header/menus/entities.tsx`;
        const entityEntry =
            // prettier-ignore
            this.generator.stripMargin(`|<DropdownItem tag={Link} to="/entity/${routerName}">
                    |      <FontAwesomeIcon icon="asterisk" fixedWidth />&nbsp;${enableTranslation ? `<Translate contentKey="global.menu.entities.${entityTranslationKeyMenu}" />` : `${_.startCase(routerName)}`}
                    |    </DropdownItem>`);
        const rewriteFileModel = this.generateFileModel(entityMenuPath, 'jhipster-needle-add-entity-to-menu', entityEntry);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }
};
