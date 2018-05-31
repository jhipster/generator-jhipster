/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const _ = require('lodash');
const shelljs = require('shelljs');
const path = require('path');
const chalk = require('chalk');
const jhiCore = require('jhipster-core');
const BaseGenerator = require('../generator-base');
const packagejs = require('../../package.json');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.argument('jdlFiles', { type: Array, required: true });
        this.jdlFiles = this.options.jdlFiles;

        // This adds support for a `--db` flag
        this.option('db', {
            desc: 'Provide DB option for the application when using skip-server flag',
            type: String
        });

        // This adds support for a `--json-only` flag
        this.option('json-only', {
            desc: 'Generate only the JSON files and skip entity regeneration',
            type: Boolean,
            defaults: false
        });

        // Support for the '--ignore-application' flag
        this.option('ignore-application', {
            desc: 'Ignores application generation',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-ui-grouping` flag
        this.option('skip-ui-grouping', {
            desc: 'Disable the UI grouping behaviour for entity client side code',
            type: Boolean,
            defaults: false
        });
        this.registerClientTransforms();
        this.applicationsLeftToGenerate = [];
        this.entitiesLeftToGenerate = [];
    }

    get initializing() {
        return {
            validate() {
                if (this.jdlFiles) {
                    this.jdlFiles.forEach((key) => {
                        if (!shelljs.test('-f', key)) {
                            this.env.error(chalk.red(`\nCould not find ${key}, make sure the path is correct.\n`));
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
                this.clientFramework = this.clientFramework || 'angularX';
                this.clientPackageManager = this.config.get('clientPackageManager');
                if (!this.clientPackageManager) {
                    if (this.useYarn) {
                        this.clientPackageManager = 'yarn';
                    } else {
                        this.clientPackageManager = 'npm';
                    }
                }
            }
        };
    }

    get configuring() {
        return {
            insight() {
                const insight = this.insight();
                insight.trackWithEvent('generator', 'import-jdl');
            },

            parseJDL() {
                this.log('The JDL is being parsed.');
                const jdlImporter = new jhiCore.JDLImporter(this.jdlFiles, {
                    databaseType: this.prodDatabaseType,
                    applicationType: this.applicationType,
                    applicationName: this.baseName,
                    generatorVersion: packagejs.version,
                    forceNoFiltering: this.options.force
                });
                try {
                    this.importState = jdlImporter.import();
                    if (this.importState.exportedEntities.length > 0) {
                        const entityNames = _.uniq(this.importState.exportedEntities
                            .map(exportedEntity => exportedEntity.name))
                            .join(', ');
                        this.log(`Updated entities are: ${chalk.yellow(entityNames)}.`);
                    } else {
                        this.log(chalk.yellow('No change in entity configurations, no entities were updated.'));
                    }
                } catch (error) {
                    this.debug('Error:', error);
                    if (error) {
                        const errorName = `${error.name}:` || '';
                        const errorMessage = error.message || '';
                        this.log(chalk.red(`${errorName} ${errorMessage}`));
                    }
                    this.error(`Error while parsing applications and entities from the JDL ${error}`);
                }
            }
        };
    }

    get writing() {
        return {
            generateApplications() {
                if (!shouldGenerateApplications(this) || this.importState.exportedApplications.length === 0) {
                    return;
                }
                if (this.importState.exportedApplications.length === 1) {
                    try {
                        generateApplicationFiles(
                            this,
                            this.importState.exportedApplications[0]
                        );
                    } catch (error) {
                        this.error(`While generating applications from the parsed JDL\n${error}`);
                    }
                } else {
                    // sub-folder generation, not yet handled
                    this.applicationsLeftToGenerate = this.importState.exportedApplications
                        .map(application => application['generator-jhipster'].baseName);
                }
            },

            generateEntities() {
                if (this.importState.exportedEntities.length === 0) {
                    return;
                }
                if (this.options['json-only']) {
                    this.log('Entity JSON files created. Entity generation skipped.');
                    return;
                }
                try {
                    this.importState.exportedEntities.forEach((exportedEntity) => {
                        if (this.importState.exportedApplications.length === 0
                                || this.importState.exportedApplications.length === 1) {
                            this.log(`Generating ${this.importState.exportedEntities.length} entities.`);
                            generateEntityFiles(this, exportedEntity);
                        } else {
                            // sub-folder generation, not yet handled
                            this.entitiesLeftToGenerate.push(exportedEntity.name);
                        }
                    });
                } catch (error) {
                    this.error(`While generating entities from the parsed JDL\n${error}`);
                }
            }
        };
    }

    end() {
        if (!this.options['skip-install'] && !this.skipClient && !this.options['json-only']
            && !shouldGenerateApplications(this, this.jdlObject)) {
            this.debug('Building client');
            this.rebuildClient();
        }
        if (this.applicationsLeftToGenerate.length !== 0) {
            this.info(`Here are the application names to generate: ${this.applicationsLeftToGenerate.join(', ')}`);
        }
        if (this.entitiesLeftToGenerate.length !== 0) {
            this.info(`Here are the entity names to generate: ${_.uniq(this.entitiesLeftToGenerate).join(', ')}`);
        }
    }
};

function shouldGenerateApplications(generator) {
    return !generator.options['ignore-application'] && generator.importState.exportedApplications.length !== 0;
}

function generateApplicationFiles(generator, application) {
    callSubGenerator(generator, '..', 'app', {
        force: generator.options.force,
        debug: generator.options.debug,
        'skip-install': generator.options['skip-install'],
        'skip-user-management': application['generator-jhipster'].skipUserManagement,
        'jhi-prefix': application['generator-jhipster'].jhiPrefix
    });
}

function generateEntityFiles(generator, entity) {
    callSubGenerator(generator, '..', 'entity', {
        force: generator.options.force,
        debug: generator.options.debug,
        regenerate: true,
        'skip-install': true,
        'skip-client': entity.skipClient,
        'skip-server': entity.skipServer,
        'no-fluent-methods': entity.noFluentMethod,
        'skip-user-management': entity.skipUserManagement,
        'skip-ui-grouping': generator.options['skip-ui-grouping'],
        arguments: [entity.name]
    });
}

function callSubGenerator(currentGenerator, subgenPath, name, args) {
    currentGenerator.composeWith(require.resolve(path.join(subgenPath, name)), args);
}
