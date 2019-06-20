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
const s = require('underscore.string');
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

            Object.keys(this.clientsToGenerate).forEach(cliName => {
                const inputSpec = this.clientsToGenerate[cliName].spec;
                const generatorName = this.clientsToGenerate[cliName].generatorName;

                const jarPath = path.resolve(
                    __dirname,
                    '../../',
                    'node_modules',
                    '@openapitools',
                    'openapi-generator-cli',
                    'bin',
                    'openapi-generator.jar'
                );
                const JAVA_OPTS = process.env.JAVA_OPTS || '';
                let command = `java ${JAVA_OPTS} -jar "${jarPath}"`;

                if (generatorName === 'spring') {
                    const cliPackage = `${this.packageName}.client.${s.underscored(cliName)}`;
                    this.log(chalk.green(`Generating java client code for ${cliName} (${inputSpec})`));

                    command +=
                        ' generate -g spring -Dmodels -Dapis ' +
                        '-DsupportingFiles ' +
                        ` -t ${path.resolve(__dirname, 'templates/swagger-codegen/libraries/spring-cloud')} --library spring-cloud ` +
                        ` -i ${inputSpec} --artifact-id ${s.camelize(cliName)} --api-package ${cliPackage}.api` +
                        ` --model-package ${cliPackage}.model` +
                        ' --type-mappings DateTime=OffsetDateTime,Date=LocalDate --import-mappings OffsetDateTime=java.time.OffsetDateTime,LocalDate=java.time.LocalDate' +
                        ` -DdateLibrary=custom,basePackage=${this.packageName}.client,configPackage=${cliPackage},` +
                        `title=${s.camelize(cliName)}`;
                    if (this.clientsToGenerate[cliName].useServiceDiscovery) {
                        command += ' --additional-properties ribbon=true';
                    }
                }
                this.log(command);

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
