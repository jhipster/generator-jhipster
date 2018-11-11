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
module.exports = {
    app: {
        default: true,
        desc: 'Create a new JHipster application based on the selected options'
    },
    aws: {
        desc: 'Deploy the current application to Amazon Web Services'
    },
    'aws-containers': {
        desc: 'Deploy the current application to Amazon Web Services using ECS'
    },
    'ci-cd': {
        desc: 'Create pipeline scripts for popular Continuous Integration/Continuous Deployment tools'
    },
    client: {
        desc:
            'DEPRECATED: Create a new JHipster client-side application based on the selected options -  Use jhipster --skip-server instead'
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
        desc: `Create entities from the JDL file passed in argument.
  By default everything is run in parallel. If you like to interact with the console use '--interactive' flag.`,
        help: `
    --skip-install        # Do not automatically install dependencies                              Default: false
    --interactive         # Run generation in series so that questions can be interacted with      Default: false
    --db                  # Provide DB option for the application when using skip-server flag
    --json-only           # Generate only the JSON files and skip entity regeneration              Default: false
    --ignore-application  # Ignores application generation                                         Default: false
    --ignore-deployments  # Ignores deployments generation                                         Default: false
    --skip-ui-grouping    # Disable the UI grouping behavior for entity client side code           Default: false

Arguments:
    jdlFiles  # The JDL file names  Type: String[]  Required: true

Example:
    jhipster import-jdl myfile.jdl
    jhipster import-jdl myfile.jdl --interactive
    jhipster import-jdl myfile1.jdl myfile2.jdl
        `
    },
    info: {
        desc: 'Display information about your current project and system'
    },
    kubernetes: {
        desc: 'Deploy the current application to Kubernetes'
    },
    languages: {
        argument: ['languages...'],
        desc: 'Select languages from a list of available languages. The i18n files will be copied to the /webapp/i18n folder'
    },
    // login: {
    //     desc: 'Link the installed JHipster CLI to your JHipster Online account'
    // },
    // logout: {
    //     desc: 'Unlink the installed JHipster CLI from your JHipster Online account'
    // },
    openshift: {
        desc: 'Deploy the current application to OpenShift'
    },
    'rancher-compose': {
        desc: 'Deploy the current application to Rancher'
    },
    server: {
        desc: 'DEPRECATED: Create a new JHipster server-side application - Use jhipster --skip-client instead'
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
    upgrade: {
        desc: 'Upgrade the JHipster version, and upgrade the generated application'
    }
};
