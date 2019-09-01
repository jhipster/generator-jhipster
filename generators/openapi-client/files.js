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
const _ = require('lodash');
const chalk = require('chalk');
const jhipsterConstants = require('../generator-constants');

module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        callOpenApiGenerator() {
            this.baseName = this.config.get('baseName');
            this.authenticationType = this.config.get('authenticationType');
            this.packageName = this.config.get('packageName');
            this.clientPackageManager = this.config.get('clientPackageManager');
            this.packageFolder = this.config.get('packageFolder');
            this.buildTool = this.config.get('buildTool');

            this.javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;

            if (Object.keys(this.clientsToGenerate).length === 0) {
                this.log('No openapi client configured. Please run "jhipster openapi-client" to generate your first OpenAPI client.');
                return;
            }

            Object.keys(this.clientsToGenerate).forEach(cliName => {
                const inputSpec = this.clientsToGenerate[cliName].spec;
                const generatorName = this.clientsToGenerate[cliName].generatorName;

                // using openapi jar file since so this section can be tested
                const jarPath = path.resolve('node_modules', '@openapitools', 'openapi-generator-cli', 'bin', 'openapi-generator.jar');
                let JAVA_OPTS;
                let command;
                if (generatorName === 'spring') {
                    this.log(chalk.green(`\n\nGenerating java client code for client ${cliName} (${inputSpec})`));
                    const cliPackage = `${this.packageName}.client.${_.snakeCase(cliName)}`;
                    const clientPackageLocation = path.resolve('src', 'main', 'java', ...cliPackage.split('.'));
                    if (shelljs.test('-d', clientPackageLocation)) {
                        this.log(`cleanup generated java code for client ${cliName} in directory ${clientPackageLocation}`);
                        shelljs.rm('-rf', clientPackageLocation);
                    }

                    JAVA_OPTS = ' -Dmodels -Dapis -DsupportingFiles=ApiKeyRequestInterceptor.java,ClientConfiguration.java ';

                    let params =
                        '  generate -g spring ' +
                        ` -t ${path.resolve(__dirname, 'templates/swagger-codegen/libraries/spring-cloud')} ` +
                        ' --library spring-cloud ' +
                        ` -i ${inputSpec} --artifact-id ${_.camelCase(cliName)} --api-package ${cliPackage}.api` +
                        ` --model-package ${cliPackage}.model` +
                        ' --type-mappings DateTime=OffsetDateTime,Date=LocalDate ' +
                        ' --import-mappings OffsetDateTime=java.time.OffsetDateTime,LocalDate=java.time.LocalDate' +
                        ` -DdateLibrary=custom,basePackage=${this.packageName}.client,configPackage=${cliPackage},` +
                        `title=${_.camelCase(cliName)}`;

                    if (this.clientsToGenerate[cliName].useServiceDiscovery) {
                        params += ' --additional-properties ribbon=true';
                    }

                    command = `java ${JAVA_OPTS} -jar ${jarPath} ${params}`;
                }
                this.log(`\n${command}`);

                const done = this.async();
                shelljs.exec(command, { silent: this.silent }, (code, msg, err) => {
                    if (code === 0) {
                        this.success(`Succesfully generated ${cliName} ${generatorName} client`);
                        done();
                    } else {
                        this.error(`Something went wrong while generating ${cliName} ${generatorName} client: ${msg} ${err}`);
                        done();
                    }
                });
            });
        },

        addBackendDependencies() {
            if (!_.map(this.clientsToGenerate, 'generatorName').includes('spring')) {
                return;
            }

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
        },

        enableFeignClients() {
            if (!_.map(this.clientsToGenerate, 'generatorName').includes('spring')) {
                return;
            }

            const mainClassFile = `${this.javaDir + this.getMainClassName()}.java`;

            if (this.applicationType !== 'microservice' || !['uaa', 'jwt'].includes(this.authenticationType)) {
                this.rewriteFile(
                    mainClassFile,
                    'import org.springframework.core.env.Environment;',
                    'import org.springframework.cloud.openfeign.EnableFeignClients;'
                );
                this.rewriteFile(mainClassFile, '@SpringBootApplication', '@EnableFeignClients');
            }
        },

        handleComponentScanExclusion() {
            if (!_.map(this.clientsToGenerate, 'generatorName').includes('spring')) {
                return;
            }

            const mainClassFile = `${this.javaDir + this.getMainClassName()}.java`;

            this.rewriteFile(
                mainClassFile,
                'import org.springframework.core.env.Environment;',
                'import org.springframework.context.annotation.ComponentScan;'
            );

            const componentScan =
                `${'@ComponentScan( excludeFilters = {\n    @ComponentScan.Filter('}${this.packageName}` +
                '.client.ExcludeFromComponentScan.class)\n})';
            this.rewriteFile(mainClassFile, '@SpringBootApplication', componentScan);

            this.template(
                'src/main/java/package/client/_ExcludeFromComponentScan.java',
                `${this.javaDir}/client/ExcludeFromComponentScan.java`
            );
        }
    };
}
