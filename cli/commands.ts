/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import chalk from 'chalk';

import type { CliCommand } from './types.ts';

const removedV8 = chalk.yellow(`

This sub-generator is no longer maintained and has been removed from JHipster starting from v8.
If you are interested in maintaining this sub-generator fill a feature request on the JHipster bug tracker.
`);

const defaultCommands = {
  add: {
    desc: 'Add a feature to current project',
    removed: removedV8,
  },
  app: {
    desc: '[Default] Create a new JHipster application based on the selected options',
  },
  aws: {
    desc: 'Deploy the current application to Amazon Web Services',
    removed: removedV8,
  },
  'azure-app-service': {
    desc: 'Deploy the current application to Azure App Service',
    removed: removedV8,
  },
  'azure-spring-cloud': {
    desc: 'Deploy the current application to Azure Spring Cloud',
    removed: removedV8,
  },
  'ci-cd': {
    desc: 'Create pipeline scripts for popular Continuous Integration/Continuous Deployment tools',
  },
  cloudfoundry: {
    desc: 'Generate a `deploy/cloudfoundry` folder with a specific manifest.yml to deploy to Cloud Foundry',
    removed: removedV8,
  },
  'docker-compose': {
    desc: 'Create all required Docker deployment configuration for the selected applications',
  },
  download: {
    desc: 'Download jdl file from template repository',
    cliOnly: true,
    argument: ['<jdlFiles...>'],
  },
  entity: {
    desc: 'Create a new JHipster entity: JPA entity, Spring server-side components and Angular client-side components',
  },
  entities: {
    desc: 'Regenerate entities',
  },
  'export-jdl': {
    desc: 'Create a JDL file from the existing entities',
  },
  gae: {
    desc: 'Deploy the current application to Google App Engine',
    removed: removedV8,
  },
  'generate-blueprint': {
    desc: 'Generate a blueprint',
  },
  gradle: {
    desc: 'Create Gradle project (alpha)',
  },
  heroku: {
    desc: 'Deploy the current application to Heroku',
  },
  info: {
    desc: 'Display information about your current project and system',
  },
  init: {
    desc: 'Init project (alpha)',
  },
  java: {
    desc: 'Run java generator (alpha)',
  },
  jdl: {
    alias: 'import-jdl',
    desc: `Create entities from the JDL file/URL/content passed in argument.
    Use the '--interactive' flag to generate multiple applications in series.`,
    help: `
    Arguments:
    jdlFiles # The JDL file names or URL Type: String[] Required: true if --inline is not set

    Example:
    jhipster jdl myfile.jdl
    jhipster jdl myfile1.jdl myfile2.jdl
    jhipster jdl https://gist.githubusercontent.com/user/path/app.jdl
    jhipster jdl jdl-name-from-jdl-samples-repo.jdl (just pass any file name from https://github.com/jhipster/jdl-samples)
    jhipster jdl --inline "application { config { baseName jhapp, testFrameworks [cypress] }}"
    jhipster jdl --inline \\
        "application {
            config {
                baseName jhapp,
                testFrameworks [cypress]
            }
        }"
    `,
  },
  kubernetes: {
    alias: 'k8s',
    desc: 'Deploy the current application to Kubernetes',
  },
  'kubernetes:helm': {
    alias: 'helm',
    desc: 'Deploy the current application to Kubernetes using Helm package manager',
  },
  'kubernetes:knative': {
    alias: 'knative',
    desc: 'Deploy the current application to Kubernetes using knative constructs',
  },
  languages: {
    desc: 'Select languages from a list of available languages. The i18n files will be copied to the /webapp/i18n folder',
  },
  maven: {
    desc: 'Create Maven project (alpha)',
  },
  openshift: {
    desc: 'Deploy the current application to OpenShift',
    removed: removedV8,
  },
  page: {
    desc: 'Create a new page. (Supports vue clients)',
    removed: removedV8,
  },
  'project-name': {
    desc: 'Configure project name (alpha)',
  },
  run: {
    desc: 'Run a module or custom generator',
    argument: ['[generator]'],
  },
  'spring-service': {
    alias: 'service',
    desc: 'Create a new Spring service bean',
    removed: removedV8,
  },
  'spring-controller': {
    desc: 'Create a new Spring controller',
    removed: removedV8,
  },
  'openapi-client': {
    desc: 'Generates java client code from an OpenAPI/Swagger definition',
    removed: removedV8,
  },
  upgrade: {
    desc: 'Upgrade the JHipster version, and upgrade the generated application',
  },
  workspaces: {
    desc: 'Add workspaces configuration',
  },
} as const satisfies Record<string, CliCommand>;

export default defaultCommands;
