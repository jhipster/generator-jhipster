/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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
const util = require('util');
const shelljs = require('shelljs');
const generator = require('yeoman-generator');
const chalk = require('chalk');
const jhiCore = require('jhipster-core');
const BaseGenerator = require('../generator-base');

const JDLGenerator = generator.extend({});

util.inherits(JDLGenerator, BaseGenerator);

module.exports = JDLGenerator.extend({
    constructor: function (...args) { // eslint-disable-line object-shorthand
        generator.apply(this, args);
        this.argument('jdlFiles', { type: Array, required: true });
        this.jdlFiles = this.options.jdlFiles;

        // This adds support for a `--db` flag
        this.option('db', {
            desc: 'Provide DB option for the application when using skip-server flag',
            type: String
        });
    },

    initializing: {
        validate() {
            if (this.jdlFiles) {
                this.jdlFiles.forEach((key) => {
                    if (!shelljs.test('-f', key)) {
                        this.env.error(chalk.red(`\nCould not find ${key}, make sure the path is correct!\n`));
                    }
                });
            }
        },

        getConfig() {
            this.applicationType = this.config.get('applicationType');
            this.baseName = this.config.get('baseName');
            this.databaseType = this.config.get('databaseType') || this.getDBTypeFromDBValue(this.options.db);
            this.prodDatabaseType = this.config.get('prodDatabaseType') || this.options.db;
            this.devDatabaseType = this.config.get('devDatabaseType') || this.options.db;
            this.skipClient = this.config.get('skipClient');
            this.clientFramework = this.config.get('clientFramework');
            if (!this.clientFramework) {
                this.clientFramework = 'angular1';
            }
            this.clientPackageManager = this.config.get('clientPackageManager');
            if (!this.clientPackageManager) {
                if (this.useYarn) {
                    this.clientPackageManager = 'yarn';
                } else {
                    this.clientPackageManager = 'npm';
                }
            }
        }
    },

    default: {
        insight() {
            const insight = this.insight();
            insight.trackWithEvent('generator', 'import-jdl');
        },

        parseJDL() {
            this.log('The jdl is being parsed.');
            try {
                const jdlObject = jhiCore.convertToJDL(jhiCore.parseFromFiles(this.jdlFiles), this.prodDatabaseType, this.applicationType);
                const entities = jhiCore.convertToJHipsterJSON({
                    jdlObject,
                    databaseType: this.prodDatabaseType,
                    applicationType: this.applicationType
                });
                this.log('Writing entity JSON files.');
                jhiCore.exportToJSON(entities, this.options.force);
            } catch (e) {
                this.log(e);
                this.error('\nError while parsing entities from JDL\n');
            }
        },

        generateEntities() {
            this.log('Generating entities.');
            try {
                this.getExistingEntities().forEach((entity) => {
                    this.composeWith(require.resolve('../entity'), {
                        regenerate: true,
                        'skip-install': true,
                        'skip-client': entity.definition.skipClient,
                        'skip-server': entity.definition.skipServer,
                        'no-fluent-methods': entity.definition.noFluentMethod,
                        'skip-user-management': entity.definition.skipUserManagement,
                        arguments: [entity.name],
                    });
                });
            } catch (e) {
                this.error(`Error while generating entities from parsed JDL\n${e}`);
            }
        }
    },

    install() {
        const injectJsFilesToIndex = () => {
            this.log(`\n${chalk.bold.green('Running gulp Inject to add javascript to index\n')}`);
            this.spawnCommand('gulp', ['inject:app']);
        };
        // rebuild client for Angular
        const rebuildClient = () => {
            this.log(`\n${chalk.bold.green('Running `webpack:build` to update client app')}\n`);
            this.spawnCommand(this.clientPackageManager, ['run', 'webpack:build']);
        };

        if (!this.options['skip-install'] && !this.skipClient) {
            if (this.clientFramework === 'angular1') {
                injectJsFilesToIndex();
            } else {
                rebuildClient();
            }
        }
    }
});
