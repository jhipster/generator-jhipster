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
const path = require('path');
const shelljs = require('shelljs');
const _ = require('underscore.string');
const chalk = require('chalk');
const BaseGenerator = require('../generator-base');
const jhipsterConstants = require('../generator-constants');
const prompts = require('./prompts');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        // This adds support for a `--from-cli` flag
        this.option('regen', {
            desc: 'Regenerates all saved clients',
            type: Boolean,
            defaults: false
        });
        this.registerPrettierTransform();
    }

    get initializing() {
        return {
            getConfig() {
                this.openApiClients = this.config.get('openApiClients') || {};
            },
            displayLogo() {
                // Have Yeoman greet the user.
                this.log(chalk.white('Welcome to the JHipster OpenApi client Sub-Generator'));
            }
        };
    }

    get prompting() {
        return {
            askActionType: prompts.askActionType,
            askExistingAvailableDocs: prompts.askExistingAvailableDocs,
            askGenerationInfos: prompts.askGenerationInfos
        };
    }

    get configuring() {
        return {
            determineApisToGenerate() {
                this.clientsToGenerate = {};
                if (this.options.regen || this.props.action === 'all') {
                    this.clientsToGenerate = this.openApiClients;
                } else if (this.props.action === 'new' || this.props.action === undefined) {
                    this.clientsToGenerate[this.props.cliName] = {
                        spec: this.props.inputSpec,
                        useServiceDiscovery: this.props.useServiceDiscovery,
                        generatorName: this.props.generatorName
                    };
                } else if (this.props.action === 'select') {
                    this.props.selected.forEach(selection => {
                        this.clientsToGenerate[selection.cliName] = selection.spec;
                    });
                }
            },

            saveConfig() {
                if (!this.options.regen && this.props.saveConfig) {
                    this.openApiClients[this.props.cliName] = this.clientsToGenerate[this.props.cliName];
                    this.config.set('openApiClients', this.openApiClients);
                }
            }
        };
    }

    get writing() {
        return {
            callOpenApiGenerator() {
                this.baseName = this.config.get('baseName');
                this.authenticationType = this.config.get('authenticationType');
                this.packageName = this.config.get('packageName');
                this.clientPackageManager = this.config.get('clientPackageManager');
                this.packageFolder = this.config.get('packageFolder');
                this.buildTool = this.config.get('buildTool');

                this.javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;

                Object.keys(this.clientsToGenerate).forEach(cliName => {
                    const inputSpec = this.clientsToGenerate[cliName].spec;
                    const generatorName = this.clientsToGenerate[cliName].generatorName;
                    let execLine;
                    if (generatorName === 'spring') {
                        const cliPackage = `${this.packageName}.client.${_.underscored(cliName)}`;
                        this.log(chalk.green(`Generating java client code for ${cliName} (${inputSpec})`));

                        execLine =
                            `${this.clientPackageManager} run openapi-generator -- generate -g spring -Dmodels -Dapis ` +
                            '-DsupportingFiles=ApiKeyRequestInterceptor.java,ClientConfiguration.java ' +
                            ` -t ${path.resolve(__dirname, 'templates/swagger-codegen/libraries/spring-cloud')} --library spring-cloud ` +
                            ` -i ${inputSpec} --artifact-id ${_.camelize(cliName)} --api-package ${cliPackage}.api` +
                            ` --model-package ${cliPackage}.model` +
                            ' --type-mappings DateTime=OffsetDateTime,Date=LocalDate --import-mappings OffsetDateTime=java.time.OffsetDateTime,LocalDate=java.time.LocalDate' +
                            ` -DdateLibrary=custom,basePackage=${this.packageName}.client,configPackage=${cliPackage},title=${_.camelize(cliName)}`;
                        if (this.clientsToGenerate[cliName].useServiceDiscovery) {
                            execLine += ' --additional-properties ribbon=true';
                        }
                    }
                    this.log(execLine);
                    shelljs.exec(execLine);
                });
            },

            writeTemplates() {
                if (this.buildTool === 'maven') {
                    if (!['microservice', 'gateway', 'uaa'].includes(this.applicationType)) {
                        let exclusions;
                        if (this.authenticationType === 'session') {
                            exclusions =
                                '            <exclusions>\n' +
                                '                <exclusion>\n' +
                                '                    <groupId>org.springframework.cloud</groupId>\n' +
                                '                    <artifactId>spring-cloud-starter-ribbon</artifactId>\n' +
                                '                </exclusion>\n' +
                                '            </exclusions>';
                        }
                        this.addMavenDependency('org.springframework.cloud', 'spring-cloud-starter-openfeign', null, exclusions);
                    }
                    this.addMavenDependency('org.springframework.cloud', 'spring-cloud-starter-oauth2');
                } else if (this.buildTool === 'gradle') {
                    if (!['microservice', 'gateway', 'uaa'].includes(this.applicationType)) {
                        if (this.authenticationType === 'session') {
                            const content =
                                "compile 'org.springframework.cloud:spring-cloud-starter-openfeign', { exclude group: 'org.springframework.cloud', module: 'spring-cloud-starter-ribbon' }";
                            this.rewriteFile('./build.gradle', 'jhipster-needle-gradle-dependency', content);
                        } else {
                            this.addGradleDependency('compile', 'org.springframework.cloud', 'spring-cloud-starter-openfeign');
                        }
                    }
                    this.addGradleDependency('compile', 'org.springframework.cloud', 'spring-cloud-starter-oauth2');
                }

                const mainClassFile = `${this.javaDir + this.getMainClassName()}.java`;

                if (this.applicationType !== 'microservice' || !['uaa', 'jwt'].includes(this.authenticationType)) {
                    this.rewriteFile(
                        mainClassFile,
                        'import org.springframework.core.env.Environment;',
                        'import org.springframework.cloud.openfeign.EnableFeignClients;'
                    );
                }

                this.rewriteFile(
                    mainClassFile,
                    'import org.springframework.core.env.Environment;',
                    'import org.springframework.context.annotation.ComponentScan;'
                );

                const componentScan = `${'@ComponentScan( excludeFilters = {\n' +
                    '    @ComponentScan.Filter('}${this.packageName}.client.ExcludeFromComponentScan.class)\n` +
                    '})';
                this.rewriteFile(mainClassFile, '@SpringBootApplication', componentScan);

                if (this.applicationType !== 'microservice' || !['uaa', 'jwt'].includes(this.authenticationType)) {
                    this.rewriteFile(mainClassFile, '@SpringBootApplication', '@EnableFeignClients');
                }
                this.template(
                    'src/main/java/package/client/_ExcludeFromComponentScan.java',
                    `${this.javaDir}/client/ExcludeFromComponentScan.java`
                );
            }
        };
    }

    end() {
        this.log('End of openapi-cli generator');
    }
};
