const chalk = require('chalk');
const needleServer = require('./needle-server');
const constants = require('../generator-constants');

const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

module.exports = class extends needleServer {
    addChangelog(changelogName) {
        this.addChangelogToMaster(changelogName, 'jhipster-needle-liquibase-add-changelog');
    }

    addConstraintsChangelog(changelogName) {
        this.addChangelogToMaster(changelogName, 'jhipster-needle-liquibase-add-constraints-changelog');
    }

    addChangelogToMaster(changelogName, needle) {
        const errorMessage = `${chalk.yellow('Reference to ') + changelogName}.xml ${chalk.yellow('not added.\n')}`;
        const fullPath = `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`;
        const content = `<include file="config/liquibase/changelog/${changelogName}.xml" relativeToChangelogFile="false"/>`;

        const rewriteFileModel = this.generateFileModel(fullPath, needle, content);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addColumnToEntityChangeset(filePath, content) {
        const errorMessage = 'Column not added.';
        const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-liquibase-add-column', content);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addChangesetToEntityChangelog(filePath, content) {
        const errorMessage = 'Changeset not added.';
        const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-liquibase-add-changeset', content);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }
};
