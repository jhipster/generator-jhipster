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

    get default() {
        return {
            insight() {
                const insight = this.insight();
                insight.trackWithEvent('generator', 'import-jdl');
            },

            parseJDL() {
                this.log('The JDL is being parsed.');
                try {
                    const parsed = jhiCore.parseFromFiles(this.jdlFiles);
                    this.jdlObject = jhiCore.convertToJDLFromConfigurationObject({
                        document: parsed,
                        databaseType: this.prodDatabaseType,
                        applicationType: this.applicationType,
                        applicationName: this.baseName
                    });
                    if (shouldGenerateApplications(this, this.jdlObject)) {
                        this.log('Writing application configuration files.');
                        this.jdlObject.applications =
                            setGeneratorVersionInJDLApplications(this.jdlObject.applications, packagejs.version);
                        jhiCore.exportApplications({
                            applications: this.jdlObject.applications,
                            paths: getApplicationPaths(this.jdlObject.applications)
                        });
                    }
                    const entities = jhiCore.convertToJHipsterJSON({
                        jdlObject: this.jdlObject,
                        databaseType: this.prodDatabaseType,
                        applicationType: this.applicationType
                    });
                    this.log('Writing entity JSON files.');
                    if (shouldGenerateApplications(this, this.jdlObject)) {
                        this.changedEntities = jhiCore.exportEntitiesInApplications({
                            entities,
                            forceNoFiltering: this.options.force,
                            applications: this.jdlObject.applications
                        }).toArray();
                    } else {
                        this.changedEntities = jhiCore.exportEntities({
                            entities,
                            forceNoFiltering: this.options.force,
                            application: {
                                type: this.applicationType,
                                name: this.baseName
                            }
                        });
                    }

                    if (this.changedEntities.length > 0) {
                        this.log(`Updated entities are: ${chalk.yellow(this.changedEntities)}.`);
                    } else {
                        this.log(chalk.yellow('No change in entity configurations. No entities were updated.'));
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
            },

            generateEntities() {
                if (this.changedEntities.length === 0) {
                    return;
                }
                if (this.options['json-only']) {
                    this.log('Entity JSON files created. Entity generation skipped.');
                    return;
                }
                try {
                    if (shouldGenerateApplications(this, this.jdlObject)) {
                        this.log('Generating applications.');
                        Object.keys(this.jdlObject.applications).forEach((application) => {
                            this.log(`Generating application ${application.baseName}.`);
                            generateApplicationFiles(this, this.jdlObject.applications[application]);
                        });
                    }
                    this.log('Generating entities.');
                    this.getExistingEntities()
                        .filter(entity => this.changedEntities.includes(entity.name))
                        .forEach((entity) => {
                            if (shouldGenerateApplications(this, this.jdlObject) && entity.applications !== '*') {
                                entity.applications.forEach((applicationName) => {
                                    const applicationPath = path.join(
                                        shelljs.pwd().stdout,
                                        this.jdlObject.applications[applicationName].config.path || ''
                                    );
                                    generateEntityFilesInPath(this, entity, applicationPath);
                                });
                            } else {
                                generateEntityFiles(this, entity);
                            }
                        });
                } catch (error) {
                    this.error(`While generating applications and entities from the parsed JDL\n${error}`);
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
    }
};

function shouldGenerateApplications(generationConfiguration, jdlObject) {
    return !generationConfiguration.options['ignore-application'] && Object.keys(jdlObject.applications).length !== 0;
}

function getApplicationPaths(jdlApplications) {
    const paths = {};
    Object.keys(jdlApplications).forEach((baseName) => {
        paths[baseName] = jdlApplications[baseName].config.path;
    });
    return paths;
}

function setGeneratorVersionInJDLApplications(jdlApplications, version) {
    Object.keys(jdlApplications).forEach((applicationName) => {
        jdlApplications[applicationName].config.jhipsterVersion = version;
    });
    return jdlApplications;
}

function generateApplicationFiles(generator, application) {
    const initialWorkingDir = shelljs.pwd();
    shelljs.cd(path.join(shelljs.pwd().stdout, application.path || ''));
    callSubGenerator(generator, '..', 'app', {
        force: generator.options.force,
        debug: generator.options.debug,
        'skip-install': generator.options['skip-install'],
        'skip-user-management': application.config.skipUserManagement,
        'jhi-prefix': application.config.jhiPrefix
    });
    shelljs.cd(initialWorkingDir);
}

function generateEntityFilesInPath(generator, entity, folderPath) {
    const initialWorkingDir = shelljs.pwd();
    shelljs.cd(folderPath);
    generateEntityFiles(generator, entity);
    shelljs.cd(initialWorkingDir);
}

function generateEntityFiles(generator, entity) {
    callSubGenerator(generator, '..', 'entity', {
        force: generator.options.force,
        debug: generator.options.debug,
        regenerate: true,
        'skip-install': true,
        'skip-client': entity.definition.skipClient,
        'skip-server': entity.definition.skipServer,
        'no-fluent-methods': entity.definition.noFluentMethod,
        'skip-user-management': entity.definition.skipUserManagement,
        'skip-ui-grouping': generator.options['skip-ui-grouping'],
        arguments: [entity.name]
    });
}

function callSubGenerator(currentGenerator, subgenPath, name, args) {
    currentGenerator.composeWith(require.resolve(path.join(subgenPath, name)), args);
}
