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
const jhipsterUtils = require('../generators/utils');

const customCommands = loadBlueprintCommands();

function loadBlueprintCommands() {
    const blueprintNames = [];
    const indexOfBlueprintArgv = process.argv.indexOf('--blueprint');
    if (indexOfBlueprintArgv > -1) {
        blueprintNames.push(process.argv[indexOfBlueprintArgv + 1]);
    }
    const indexOfBlueprintsArgv = process.argv.indexOf('--blueprints');
    if (indexOfBlueprintsArgv > -1) {
        blueprintNames.push(...process.argv[indexOfBlueprintsArgv + 1].split(','));
    }
    let result = {};
    if (blueprintNames.length > 0) {
        blueprintNames
            .filter((v, i, a) => a.indexOf(v) === i)
            .map(v => jhipsterUtils.normalizeBlueprintName(v))
            .forEach(blueprint => {
                /* eslint-disable import/no-dynamic-require */
                /* eslint-disable global-require */
                try {
                    const blueprintCommands = require(`${blueprint}/cli/commands`);
                    result = { ...result, ...blueprintCommands };
                } catch (e) {
                    const msg = `No custom commands found within blueprint: ${blueprint}`;
                    /* eslint-disable no-console */
                    console.info(`${chalk.green.bold('INFO!')} ${msg}`);
                }
            });
    }
    return result;
}

const defaultCommands = {
    app: {
        default: true,
        desc: '[Default] Create a new JHipster application based on the selected options'
    },
    aws: {
        desc: 'Deploy the current application to Amazon Web Services'
    },
    'aws-containers': {
        desc: 'Deploy the current application to Amazon Web Services using ECS'
    },
    'azure-app-service': {
        desc: 'Deploy the current application to Azure App Service'
    },
    'azure-spring-cloud': {
        desc: 'Deploy the current application to Azure Spring Cloud'
    },
    'ci-cd': {
        desc: 'Create pipeline scripts for popular Continuous Integration/Continuous Deployment tools'
    },
    cloudfoundry: {
        desc: 'Generate a `deploy/cloudfoundry` folder with a specific manifest.yml to deploy to Cloud Foundry'
    },
    'docker-compose': {
        desc: 'Create all required Docker deployment configuration for the selected applications'
    },
    entity: {
        argument: ['name'],
        desc: 'Create a new JHipster entity: JPA entity, Spring server-side components and Angular client-side components'
    },
    'export-jdl': {
        argument: ['jdlFile'],
        desc: 'Create a JDL file from the existing entities'
    },
    gae: {
        desc: 'Deploy the current application to Google App Engine'
    },
    heroku: {
        desc: 'Deploy the current application to Heroku'
    },
    'import-jdl': {
        argument: ['jdlFiles...'],
        cliOnly: true,
        desc: `Create entities from the JDL file/content passed in argument.
  By default everything is run in parallel. If you like to interact with the console use '--interactive' flag.`,
        help: `
    --skip-install        # Do not automatically install dependencies                              Default: false
    --interactive         # Run generation in series so that questions can be interacted with      Default: false
    --db                  # Provide DB option for the application when using skip-server flag
    --json-only           # Generate only the JSON files and skip entity regeneration              Default: false
    --ignore-application  # Ignores application generation                                         Default: false
    --ignore-deployments  # Ignores deployments generation                                         Default: false
    --skip-ui-grouping    # Disable the UI grouping behavior for entity client side code           Default: false
    --skip-db-changelog   # Disable generation of database changelogs                              Default: false
    --inline              # Pass JDL content inline. Argument can be skipped when passing this

Arguments:
    jdlFiles # The JDL file names Type: String[] Required: true if --inline is not set

Example:
    jhipster import-jdl myfile.jdl
    jhipster import-jdl myfile.jdl --interactive
    jhipster import-jdl myfile1.jdl myfile2.jdl
    jhipster import-jdl --inline "application { config { baseName jhapp, testFrameworks [protractor] }}"
    jhipster import-jdl --inline \\
        "application {
            config {
                baseName jhapp,
                testFrameworks [protractor]
            }
        }"
        `
    },
    info: {
        desc: 'Display information about your current project and system'
    },
    kubernetes: {
        desc: 'Deploy the current application to Kubernetes'
    },
    'kubernetes-helm': {
        alias: 'k8s-helm',
        desc: 'Deploy the current application to Kubernetes using Helm package manager'
    },
    languages: {
        argument: ['languages...'],
        desc: 'Select languages from a list of available languages. The i18n files will be copied to the /webapp/i18n folder'
    },
    openshift: {
        desc: 'Deploy the current application to OpenShift'
    },
    'spring-service': {
        alias: 'service',
        argument: ['name'],
        desc: 'Create a new Spring service bean'
    },
    'spring-controller': {
        argument: ['name'],
        desc: 'Create a new Spring controller'
    },
    'openapi-client': {
        desc: 'Generates java client code from an OpenAPI/Swagger definition'
    },
    upgrade: {
        desc: 'Upgrade the JHipster version, and upgrade the generated application'
    }
};

module.exports = {
    ...defaultCommands,
    ...customCommands
};
