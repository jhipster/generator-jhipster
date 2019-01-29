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

    addDependencyManagement(scope, group, name, version) {
        const errorMessage = `${chalk.yellow('Reference to ') + group}:${name}:${version}${chalk.yellow(' not added.')}`;
        let dependency = `${group}:${name}`;
        if (version) {
            dependency += `:${version}`;
        }
        const rewriteFileModel = this.generateFileModel(
            buildGradlePath,
            'jhipster-needle-gradle-dependency-management',
            `${scope} "${dependency}"`
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
