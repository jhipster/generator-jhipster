const needleClient = require('./needle-client-base');

module.exports = class extends needleClient {
    addEntity(microserviceName) {
        const errorMessage = `${chalk.yellow(' Reference to ') + microserviceName} ${chalk.yellow('not added to menu.\n')}`;
        const webpackDevPath = `${CLIENT_WEBPACK_DIR}/webpack.dev.js`;
        const rewriteFileModel = this.generateFileModel(webpackDevPath,
             'jhipster-needle-add-entity-to-webpack',
              `'/${microserviceName.toLowerCase()}',`);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    copyExternalAssets(sourceFolder, targetFolder) {
        const errorMessage = 'Resource path not added to JHipster app.';
        const from = `${CLIENT_MAIN_SRC_DIR}content/${sourceFolder}/`;
        const to = `content/${targetFolder}/`;
        const webpackDevPath = `${CLIENT_WEBPACK_DIR}/webpack.common.js`;
        let assetBlock = '';
        if (sourceFolder && targetFolder) {
            assetBlock = `{ from: './${from}', to: '${to}' },`;
        }
        const rewriteFileModel = this.generateFileModel(webpackDevPath,
            'jhipster-needle-add-assets-to-webpack',
            assetBlock);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }
};
