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

const pomPath = 'pom.xml';

module.exports = class extends needleServer {
    addDependencyManagement(groupId, artifactId, version, type, scope, other) {
        const errorMessage = `${chalk.yellow('Reference to maven dependency ')}
            (groupId: ${groupId}, artifactId:${artifactId}, version:${version})${chalk.yellow(' not added.\n')}`;
        // prettier-ignore
        let dependency = `${'<dependency>\n'
            + '                <groupId>'}${groupId}</groupId>\n`
            + `                <artifactId>${artifactId}</artifactId>\n`;
        if (version) {
            dependency += `                <version>${version}</version>\n`;
        }
        if (type) {
            dependency += `                <type>${type}</type>\n`;
        }
        if (scope) {
            dependency += `                <scope>${version}</scope>\n`;
        }
        if (other) {
            dependency += `${other}\n`;
        }
        dependency += '             </dependency>';
        const rewriteFileModel = this.generateFileModel(pomPath, 'jhipster-needle-maven-add-dependency-management', dependency);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addRepository(id, url) {
        const errorMessage = `${chalk.yellow(' Reference to ')}maven repository (id: ${id}, url:${url})${chalk.yellow(' not added.\n')}`;
        // prettier-ignore
        const repository = `${'<repository>\n'
            + '            <id>'}${id}</id>\n`
            + `            <url>${url}</url>\n`
            + '        </repository>';
        const rewriteFileModel = this.generateFileModel(pomPath, 'jhipster-needle-maven-repository', repository);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addPluginRepository(id, url) {
        const errorMessage = `${chalk.yellow(' Reference to ')}maven plugin repository (id: ${id}, url:${url})
            ${chalk.yellow(' not added.\n')}`;
        // prettier-ignore
        const repository = `${'<pluginRepository>\n'
            + '            <id>'}${id}</id>\n`
            + `            <url>${url}</url>\n`
            + '        </pluginRepository>';
        const rewriteFileModel = this.generateFileModel(pomPath, 'jhipster-needle-maven-plugin-repository', repository);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addDistributionManagement(snapshotsId, snapshotsUrl, releasesId, releasesUrl) {
        const errorMessage = `${chalk.yellow('Reference to maven distribution management ')}
            (id: ${snapshotsId}, url:${snapshotsId}), (id: ${releasesId}, url:${releasesUrl})${chalk.yellow(' not added.\n')}`;
        // prettier-ignore
        const repository = `${'<distributionManagement>\n'
            + '        <snapshotRepository>\n'
            + '            <id>'}${snapshotsId}</id>\n`
            + `            <url>${snapshotsUrl}</url>\n`
            + '        </snapshotRepository>\n'
            + '        <repository>\n'
            + `            <id>${releasesId}</id>\n`
            + `            <url>${releasesUrl}</url>\n`
            + '        </repository>\n'
            + '    </distributionManagement>';
        const rewriteFileModel = this.generateFileModel(pomPath, 'jhipster-needle-distribution-management', repository);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addProperty(name, value) {
        const errorMessage = `${chalk.yellow('Reference to maven property name ')}
            (name: ${name}, value:${value})${chalk.yellow(' not added.\n')}`;
        const property = `<${name}>${value}</${name}>`;
        const rewriteFileModel = this.generateFileModel(pomPath, 'jhipster-needle-maven-property', property);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addDependencyInDirectory(directory, groupId, artifactId, version, other) {
        const errorMessage = `${chalk.yellow('Reference to maven dependency ')}
            (groupId: ${groupId}, artifactId:${artifactId}, version:${version})${chalk.yellow(' not added.\n')}`;
        // prettier-ignore
        let dependency = `${'<dependency>\n'
            + '            <groupId>'}${groupId}</groupId>\n`
            + `            <artifactId>${artifactId}</artifactId>\n`;
        if (version) {
            dependency += `            <version>${version}</version>\n`;
        }
        if (other) {
            dependency += `${other}\n`;
        }
        dependency += '        </dependency>';
        const rewriteFileModel = this.generateFileModelWithPath(directory, pomPath, 'jhipster-needle-maven-add-dependency', dependency);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addPlugin(groupId, artifactId, version, other) {
        const errorMessage = `${chalk.yellow('Reference to maven plugin ')}
            (groupId: ${groupId}, artifactId:${artifactId}, version:${version})${chalk.yellow(' not added.\n')}`;
        // prettier-ignore
        let plugin = `${'<plugin>\n'
            + '                <groupId>'}${groupId}</groupId>\n`
            + `                <artifactId>${artifactId}</artifactId>\n`;
        if (version) {
            plugin += `                <version>${version}</version>\n`;
        }
        if (other) {
            plugin += `${other}\n`;
        }
        plugin += '            </plugin>';
        const rewriteFileModel = this.generateFileModel(pomPath, 'jhipster-needle-maven-add-plugin', plugin);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addProfile(profileId, other) {
        const errorMessage = `${chalk.yellow('Reference to maven profile ')}
            (id: ${profileId})${chalk.yellow(' not added.\n')}`;
        // prettier-ignore
        let profile = '<profile>\n'
            + `            <id>${profileId}</id>\n`;
        if (other) {
            profile += `${other}\n`;
        }
        profile += '        </profile>';
        const rewriteFileModel = this.generateFileModel(pomPath, 'jhipster-needle-maven-add-profile', profile);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }
};
