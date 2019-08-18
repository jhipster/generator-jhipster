/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const chalk = require('chalk');
const needleServer = require('./needle-server');
const constants = require('../../generator-constants');

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

    addLoadColumnToEntityChangeSet(filePath, content) {
        const errorMessage = 'LoadColumn not added.';
        const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-liquibase-add-loadcolumn', content);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addChangesetToEntityChangelog(filePath, content) {
        const errorMessage = 'Changeset not added.';
        const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-liquibase-add-changeset', content);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }
};
