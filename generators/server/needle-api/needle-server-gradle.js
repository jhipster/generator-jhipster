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

const buildGradlePath = 'build.gradle';

module.exports = class extends needleServer {
    addProperty(name, value) {
        const gradlePropertiesPath = 'gradle.properties';
        const errorMessage = `${chalk.yellow('Reference to ')}gradle property (name: ${name}, value:${value})${chalk.yellow(
            ' not added.'
        )}`;
        const rewriteFileModel = this.generateFileModel(gradlePropertiesPath, 'jhipster-needle-gradle-property', `${name}=${value}`);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addPlugin(group, name, version) {
        const errorMessage = `${chalk.yellow('Reference to ')}classpath: ${group}:${name}:${version}${chalk.yellow(' not added.')}`;
        const rewriteFileModel = this.generateFileModel(
            buildGradlePath,
            'jhipster-needle-gradle-buildscript-dependency',
            `classpath "${group}:${name}:${version}"`
        );

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addPluginToPluginsBlock(id, version) {
        const errorMessage = `${chalk.yellow('Reference to ')}id ${id} version ${version}${chalk.yellow(' not added.')}`;
        const rewriteFileModel = this.generateFileModel(
            buildGradlePath,
            'jhipster-needle-gradle-plugins',
            `id "${id}" version "${version}"`
        );

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addDependencyInDirectory(directory, scope, group, name, version) {
        const errorMessage = `${chalk.yellow('Reference to ') + group}:${name}:${version}${chalk.yellow(' not added.')}`;
        let dependency = `${group}:${name}`;
        if (version) {
            dependency += `:${version}`;
        }
        const rewriteFileModel = this.generateFileModelWithPath(
            directory,
            buildGradlePath,
            'jhipster-needle-gradle-dependency',
            `${scope} "${dependency}"`
        );

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    applyFromScript(name) {
        const errorMessage = chalk.yellow(' or missing required jhipster-needle. Reference to ') + name + chalk.yellow(' not added.');
        const rewriteFileModel = this.generateFileModel(
            buildGradlePath,
            'jhipster-needle-gradle-apply-from',
            `apply from: '${name}.gradle'`
        );

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addMavenRepository(url, username, password) {
        const errorMessage = chalk.yellow('Reference to ') + url + chalk.yellow(' not added.');
        let repository = 'maven {\n';
        if (url) {
            repository += `        url "${url}"\n`;
        }
        if (username || password) {
            repository += '        credentials {\n';
            if (username) {
                repository += `            username = "${username}"\n`;
            }
            if (password) {
                repository += `            password = "${password}"\n`;
            }
            repository += '        }\n';
        }
        repository += '    }';
        const rewriteFileModel = this.generateFileModel(buildGradlePath, 'jhipster-needle-gradle-repositories', repository);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }
};
