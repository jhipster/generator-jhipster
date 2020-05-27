/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

const defaultCommands = {
    app: {
        desc: '[Default] Create a new JHipster application based on the selected options',
        help: `
Example:
    jhipster

This will compose jhipster:client, jhipster:server and jhipster:languages to scaffold a full application
`,
    },
    aws: {
        desc: 'Deploy the current application to Amazon Web Services',
    },
    'aws-containers': {
        desc: 'Deploy the current application to Amazon Web Services using ECS',
    },
    'azure-app-service': {
        desc: 'Deploy the current application to Azure App Service',
    },
    'azure-spring-cloud': {
        desc: 'Deploy the current application to Azure Spring Cloud',
    },
    'ci-cd': {
        desc: 'Create pipeline scripts for popular Continuous Integration/Continuous Deployment tools',
    },
    cloudfoundry: {
        desc: 'Generate a `deploy/cloudfoundry` folder with a specific manifest.yml to deploy to Cloud Foundry',
    },
    'docker-compose': {
        desc: 'Create all required Docker deployment configuration for the selected applications',
    },
    entity: {
        argument: ['name'],
        desc: 'Create a new JHipster entity: JPA entity, Spring server-side components and Angular client-side components',
    },
    'export-jdl': {
        argument: ['jdlFile'],
        desc: 'Create a JDL file from the existing entities',
    },
    gae: {
        desc: 'Deploy the current application to Google App Engine',
    },
    heroku: {
        desc: 'Deploy the current application to Heroku',
    },
    info: {
        desc: 'Display information about your current project and system',
    },
    jdl: {
        alias: 'import-jdl',
        argument: ['jdlFiles...'],
        cliOnly: true,
        options: [
            {
                option: '--skip-install',
                desc: 'Do not automatically install dependencies',
                default: false,
            },
            {
                option: '--interactive',
                desc: 'Run generation in series so that questions can be interacted with',
                default: false,
            },
            {
                option: '--db <value>',
                desc: 'Provide DB option for the application when using skip-server flag',
            },
            {
                option: '--json-only',
                desc: 'Generate only the JSON files and skip entity regeneration',
                default: false,
            },
            {
                option: '--ignore-application',
                desc: 'Ignores application generation',
                default: false,
            },
            {
                option: '--ignore-deployments',
                desc: 'Ignores deployments generation',
                default: false,
            },
            {
                option: '--skip-ui-grouping',
                desc: 'Disable the UI grouping behavior for entity client side code',
                default: false,
            },
            {
                option: '--skip-db-changelog',
                desc: 'Disable generation of database changelogs',
                default: false,
            },
            {
                option: '--skip-sample-repository',
                desc: 'Disable fetching sample files when the file is not a URL',
                default: false,
            },
            {
                option: '--inline <value>',
                desc: 'Pass JDL content inline. Argument can be skipped when passing this',
            },
        ],
        desc: `Create entities from the JDL file/content passed in argument.
  By default everything is run in parallel. If you like to interact with the console use '--interactive' flag.
Note: jhipster import-jdl is the same as 'jhipster jdl --skip-sample-repository'`,
        help: `
Arguments:
    jdlFiles # The JDL file names Type: String[] Required: true if --inline is not set

Example:
    jhipster jdl myfile.jdl
    jhipster jdl myfile.jdl --interactive
    jhipster jdl myfile1.jdl myfile2.jdl
    jhipster jdl --inline "application { config { baseName jhapp, testFrameworks [protractor] }}"
    jhipster jdl --inline \\
        "application {
            config {
                baseName jhapp,
                testFrameworks [protractor]
            }
        }"
        `,
    },
    kubernetes: {
        alias: 'k8s',
        desc: 'Deploy the current application to Kubernetes',
    },
    'kubernetes-helm': {
        alias: 'helm',
        desc: 'Deploy the current application to Kubernetes using Helm package manager',
    },
    'kubernetes-knative': {
        alias: 'knative',
        desc: 'Deploy the current application to Kubernetes using knative constructs',
    },
    languages: {
        argument: ['languages...'],
        desc: 'Select languages from a list of available languages. The i18n files will be copied to the /webapp/i18n folder',
    },
    openshift: {
        desc: 'Deploy the current application to OpenShift',
    },
    'spring-service': {
        alias: 'service',
        argument: ['name'],
        desc: 'Create a new Spring service bean',
    },
    'spring-controller': {
        argument: ['name'],
        desc: 'Create a new Spring controller',
    },
    'openapi-client': {
        desc: 'Generates java client code from an OpenAPI/Swagger definition',
    },
    upgrade: {
        desc: 'Upgrade the JHipster version, and upgrade the generated application',
    },
    'upgrade-config': {
        desc: 'Upgrade the JHipster configuration',
    },
};

module.exports = defaultCommands;
