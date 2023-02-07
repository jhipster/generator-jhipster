/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import fs from 'fs';
import _ from 'lodash';
import path, { dirname, join } from 'path';
import pluralize from 'pluralize';
import { fileURLToPath } from 'url';
import { inspect } from 'util';

import EnvironmentBuilder from './environment-builder.mjs';
import { CLI_NAME, GENERATOR_NAME, logger, printSuccess } from './utils.mjs';
import { packageJson } from '../lib/index.mjs';
import statistics from '../generators/statistics.mjs';
import { JHIPSTER_CONFIG_DIR } from '../generators/generator-constants.mjs';
import { writeConfigFile } from './export-utils.mjs';

const jhipsterCli = join(dirname(fileURLToPath(import.meta.url)), 'cli.mjs');

const getDeploymentType = deployment => deployment && deployment[GENERATOR_NAME] && deployment[GENERATOR_NAME].deploymentType;

/**
 * Check if .yo-rc.json exists inside baseName folder.
 * @param {string} baseName
 * @return {boolean}
 */
const baseNameConfigExists = baseName => fs.existsSync(baseName === undefined ? '.yo-rc.json' : path.join(baseName, '.yo-rc.json'));

const numberOfApplications = processor => Object.values(processor.importState.exportedApplicationsWithEntities).length;

/**
 * Check if every application is new.
 * @param {JDLProcessor} processor
 * @return {boolean}
 */
const allNewApplications = processor => {
  const applications = Object.values(processor.importState.exportedApplicationsWithEntities);
  if (applications.length === 1) return !baseNameConfigExists();
  return !applications.find(application => baseNameConfigExists(application.config.baseName));
};

/**
 * Check if the generation should be forced.
 * @param {JDLProcessor} processor
 * @return {boolean}
 */
const shouldForce = processor => {
  return processor.options.force;
};

/**
 * When regenerating applications we should run interactively, so prompts will be shown by default.
 * @param {JDLProcessor} processor
 * @return {boolean} true if generation should be executed interactively
 */
const shouldRunInteractively = processor => {
  return processor.options.interactive;
};

/**
 * Write entity config to disk.
 * @param {any} entity
 * @param {string} basePath
 */
function writeEntityConfig(entity, basePath) {
  const entitiesPath = path.join(basePath, JHIPSTER_CONFIG_DIR);
  if (!fs.existsSync(entitiesPath)) {
    fs.mkdirSync(entitiesPath, { recursive: true });
  }
  const filePath = path.join(entitiesPath, `${_.upperFirst(entity.name)}.json`);
  fs.writeFileSync(filePath, JSON.stringify(entity, null, 2).concat('\n'));
}

/**
 * Write application config to disk.
 * @param {any} applicationWithEntities
 * @param {string} basePath
 */
function writeApplicationConfig(applicationWithEntities, basePath) {
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }
  writeConfigFile({ 'generator-jhipster': applicationWithEntities.config }, path.join(basePath, '.yo-rc.json'));
  applicationWithEntities.entities.forEach(entity => writeEntityConfig(entity, basePath));
}

/**
 * Run the generator.
 * @param {string} command
 * @param {Object} options
 * @param {string} options.cwd
 * @param {Environment} options.env
 * @param {Object} [generatorOptions]
 */
async function runGenerator(command, { cwd, env, createEnvBuilder }, generatorOptions = {}) {
  const { workspaces } = generatorOptions;
  generatorOptions = {
    ...generatorOptions,
    // Remove jdl command exclusive options
    interactive: undefined,
    jsonOnly: undefined,
    ignoreApplication: undefined,
    ignoreDeployments: undefined,
    inline: undefined,
    skipSampleRepository: undefined,
    workspaces: undefined,
    forceNoFiltering: undefined,
    unidirectionalRelationships: undefined,
    localConfigOnly: undefined,
    commandName: undefined,
    fromJdl: true,
  };
  if (workspaces) {
    generatorOptions.skipInstall = true;
  }
  if (!generatorOptions.blueprints) {
    delete generatorOptions.blueprints;
  }

  env = env ?? (await createEnvBuilder(undefined, { cwd })).getEnvironment();
  try {
    await env.run(`${CLI_NAME}:${command}`, generatorOptions);
  } catch (error) {
    logger.error(`Error running generator ${command}: ${error}`, error);
    throw error;
  }
  logger.info(`Generator ${command} succeed`);
}

/**
 * Imports the Applications and Entities defined in JDL
 * The app .yo-rc.json files and entity json files are written to disk
 */
function importJDL(jdlImporter) {
  logger.info('The JDL is being parsed.');

  try {
    const importState = jdlImporter.import();
    logger.debug(`importState exportedEntities: ${importState.exportedEntities.length}`);
    logger.debug(`importState exportedApplications: ${importState.exportedApplications.length}`);
    logger.debug(`importState exportedDeployments: ${importState.exportedDeployments.length}`);

    if (importState.exportedEntities.length > 0) {
      const entityNames = _.uniq(importState.exportedEntities.map(exportedEntity => exportedEntity.name)).join(', ');
      logger.info(`Found entities: ${chalk.yellow(entityNames)}.`);
    } else {
      logger.info(chalk.yellow('No change in entity configurations, no entities were updated.'));
    }
    logger.info('The JDL has been successfully parsed');
    return importState;
  } catch (error) {
    logger.debug('Error:', error);
    if (error) {
      const errorName = `${error.name}:` || '';
      const errorMessage = error.message || '';
      logger.log(chalk.red(`${errorName} ${errorMessage}`));
    }
    logger.error(`Error while parsing applications and entities from the JDL ${error}`, error);
    throw error;
  }
}

/**
 * Check if application needs to be generated
 * @param {any} processor
 */
const shouldGenerateApplications = processor =>
  !processor.options.ignoreApplication && !processor.options.jsonOnly && processor.importState.exportedApplications.length !== 0;

/**
 * Check if deployments needs to be generated
 * @param {any} processor
 */
const shouldGenerateDeployments = processor =>
  !processor.options.ignoreDeployments && !processor.options.jsonOnly && processor.importState.exportedDeployments.length !== 0;

/**
 * Generate application source code for JDL apps defined.
 * @param {any} config
 * @returns Promise
 */
const generateApplicationFiles = async ({ processor, applicationWithEntities }) => {
  logger.debug(`Generating application: ${JSON.stringify(applicationWithEntities.config, null, 2)}`);
  const { force, reproducible, createEnvBuilder, multiplesApplications } = processor;
  const baseName = applicationWithEntities.config.baseName;
  const cwd = multiplesApplications ? path.join(processor.pwd, baseName) : processor.pwd;
  if (processor.options.jsonOnly) {
    writeApplicationConfig(applicationWithEntities, cwd);
  } else {
    const withEntities = applicationWithEntities.entities.length > 0 ? true : undefined;
    const generatorOptions = { reproducible, force, withEntities, ...processor.options, applicationWithEntities };
    await runGenerator('app', { cwd, createEnvBuilder }, generatorOptions);
  }
};

/**
 * Generate entities for the applications
 * @param {any} processor
 * @param {any} exportedEntities
 * @param {any} env
 * @return Promise
 */
const generateEntityFiles = async (processor, exportedEntities, env) => {
  const { multiplesApplications, force, createEnvBuilder } = processor;

  const callGenerator = async ({ baseName, env, entitiesToImport = exportedEntities } = {}) => {
    const cwd = baseName ? path.join(processor.pwd, baseName) : processor.pwd;

    if (processor.options.jsonOnly) {
      entitiesToImport.forEach(entity => writeEntityConfig(entity, cwd));
      logger.info('Entity JSON files created. Entity generation skipped.');
      return;
    }

    const generatorOptions = {
      force,
      ...processor.options,
      entitiesToImport,
    };

    await runGenerator('entities', { cwd, env, createEnvBuilder }, generatorOptions);
  };

  if (multiplesApplications) {
    /* Generating entities inside multiple apps */
    const baseNames = [...new Set(exportedEntities.flatMap(entity => entity.applications))];
    const applicationsOptions = baseNames.map(baseName => ({
      baseName,
      entitiesToImport: exportedEntities.filter(entity => entity.applications.includes(baseName)),
    }));

    if (processor.interactive) {
      for (const options of applicationsOptions) {
        await callGenerator({ ...options, env });
      }
    } else {
      await Promise.all(applicationsOptions.map(options => callGenerator(options)));
    }
  } else {
    await callGenerator();
  }
};

class JDLProcessor {
  constructor(jdlFiles, jdlContent, options, createEnvBuilder) {
    logger.debug(
      `JDLProcessor started with ${jdlContent ? `content: ${jdlContent}` : `files: ${jdlFiles}`} and options: ${inspect(options)}`
    );
    this.jdlFiles = jdlFiles;
    this.jdlContent = jdlContent;
    this.options = options;
    this.pwd = process.cwd();
    this.createEnvBuilder = createEnvBuilder;
  }

  async importJDL() {
    const configuration = {
      applicationName: this.options.baseName,
      databaseType: this.options.db,
      applicationType: this.options.applicationType,
      skipUserManagement: this.options.skipUserManagement,
      unidirectionalRelationships: this.options.unidirectionalRelationships,
      forceNoFiltering: this.options.forceNoFiltering,
      generatorVersion: packageJson.version,
      skipFileGeneration: true,
    };

    let importer;
    // eslint-disable-next-line global-require
    const { createImporterFromContent, createImporterFromFiles } = await import('../jdl/jdl-importer.js');
    if (this.jdlContent) {
      importer = createImporterFromContent(this.jdlContent, configuration);
    } else {
      importer = createImporterFromFiles(this.jdlFiles, configuration);
    }
    this.importState = importJDL.call(this, importer);
  }

  config() {
    const nrApplications = numberOfApplications(this);
    const allNew = allNewApplications(this);
    const interactiveFallback = !allNew;

    this.interactive = shouldRunInteractively(this) ?? interactiveFallback;
    this.force = shouldForce(this) ?? (nrApplications > 0 && allNew) ? true : undefined;
    this.reproducible = allNew;
    this.multiplesApplications = nrApplications > 1;
    return this;
  }

  sendInsight() {
    statistics.sendSubGenEvent('generator', 'import-jdl');
  }

  async generateWorkspaces(options, generateJdl) {
    return (await this.createEnvBuilder())
      .getEnvironment()
      .run('jhipster:workspaces', { workspaces: false, ...options, importState: this.importState, generateJdl });
  }

  async generateApplications() {
    if (this.options.ignoreApplication) {
      logger.debug('Applications not generated');
      return;
    }

    const applicationsWithEntities = Object.values(this.importState.exportedApplicationsWithEntities);
    logger.info(`Generating ${applicationsWithEntities.length} ${pluralize('application', applicationsWithEntities.length)}.`);
    if (applicationsWithEntities.length === 0) {
      return;
    }

    const allApplications = Object.fromEntries(
      applicationsWithEntities.map((applicationWithEntities, applicationIndex) => {
        applicationWithEntities.config.applicationIndex = applicationIndex;
        return [applicationWithEntities.config.baseName, applicationWithEntities.config];
      })
    );

    applicationsWithEntities.forEach(applicationWithEntities => {
      const microfrontends = applicationWithEntities.config.microfrontends || [];

      const relatedApplications = Object.entries(allApplications).filter(
        ([baseName]) =>
          applicationWithEntities.config.baseName !== baseName &&
          (applicationWithEntities.entities.find(entity => entity.microserviceName === baseName) || microfrontends.includes(baseName))
      );
      const { serverPort: gatewayServerPort, clientFramework: gatewayClientFramework } = applicationWithEntities.config;
      if (relatedApplications.length > 0) {
        applicationWithEntities.config.applications = Object.fromEntries(
          relatedApplications.map(([baseName, config]) => {
            config.gatewayServerPort = config.gatewayServerPort || gatewayServerPort;
            const { clientFramework, serverPort, applicationIndex, devServerPort } = config;
            return [baseName, { clientFramework, serverPort, applicationIndex, devServerPort }];
          })
        );

        const differentClientFrameworks = relatedApplications.filter(
          ([_baseName, { clientFramework }]) => clientFramework && clientFramework !== 'no' && clientFramework !== gatewayClientFramework
        );

        if (differentClientFrameworks.length > 0) {
          throw Error(
            `Using different client frameworks in microfrontends is not supported. Tried to use: ${gatewayClientFramework} with ${differentClientFrameworks
              .map(([baseName, { clientFramework }]) => `${clientFramework} (${baseName})`)
              .join(', ')}`
          );
        }
      }
    });

    const callGenerator = async applicationWithEntities => {
      try {
        await generateApplicationFiles({
          processor: this,
          applicationWithEntities,
        });
      } catch (error) {
        logger.error(`Error while generating applications from the parsed JDL\n${error}`, error);
        throw error;
      }
    };

    if (this.interactive) {
      for (const applicationWithEntities of applicationsWithEntities) {
        await callGenerator(applicationWithEntities);
      }
    } else {
      await Promise.all(applicationsWithEntities.map(applicationWithEntities => callGenerator(applicationWithEntities)));
    }
  }

  async generateDeployments() {
    if (!shouldGenerateDeployments(this)) {
      logger.debug('Deployments not generated');
      return;
    }
    logger.info(
      `Generating ${this.importState.exportedDeployments.length} ` +
        `${pluralize('deployment', this.importState.exportedDeployments.length)}.`
    );

    for (const deployment of this.importState.exportedDeployments) {
      try {
        const deploymentType = getDeploymentType(deployment);
        logger.debug(`Generating deployment: ${JSON.stringify(deployment[GENERATOR_NAME], null, 2)}`);

        const { pwd, createEnvBuilder, options } = this;
        const cwd = path.join(pwd, deploymentType);

        await runGenerator(deploymentType, { cwd, createEnvBuilder }, { force: true, ...options, skipPrompts: true });
      } catch (error) {
        logger.error(`Error while generating deployments from the parsed JDL\n${error}`, error);
        throw error;
      }
    }
  }

  async generateEntities(env) {
    if (this.importState.exportedEntities.length === 0 || shouldGenerateApplications(this)) {
      logger.debug('Entities not generated');
      return;
    }
    try {
      logger.info(
        `Generating ${this.importState.exportedEntities.length} ${pluralize('entity', this.importState.exportedEntities.length)}.`
      );
      await generateEntityFiles(this, this.importState.exportedEntities, env);
    } catch (error) {
      logger.error(`Error while generating entities from the parsed JDL\n${error}`, error);
      throw error;
    }
  }
}

/**
 * Import-JDL sub generator
 * @param {any} jdlFiles jdl files
 * @param {any} [options] options passed from CLI
 * @param {any} [env] the yeoman environment
 * @param {any} [_envBuilder] the yeoman environment
 * @param {any} [createEnvBuilder] the yeoman environment
 */
const jdl = async (jdlFiles, options = {}, env, _envBuilder, createEnvBuilder = EnvironmentBuilder.createDefaultBuilder) => {
  logger.info(chalk.yellow(`Executing import-jdl ${options.inline ? 'with inline content' : jdlFiles.join(' ')}`));
  logger.debug(chalk.yellow(`Options: ${inspect({ ...options, inline: options.inline ? 'inline content' : '' })}`));
  try {
    const jdlImporter = new JDLProcessor(jdlFiles, options.inline, options, createEnvBuilder);
    await jdlImporter.importJDL();
    jdlImporter.sendInsight();
    jdlImporter.config();

    const generateJdl = async () => {
      await jdlImporter.generateApplications();
      await jdlImporter.generateEntities(env);
      await jdlImporter.generateDeployments();
    };

    if (!options.workspaces || !jdlImporter.multiplesApplications) {
      await generateJdl();
    } else {
      // Wrap generation inside workspaces root generation.
      // generate applications after git initialization and before root npm install
      await jdlImporter.generateWorkspaces(options, generateJdl);
    }

    printSuccess();
    return jdlFiles;
  } catch (e) {
    logger.error(`Error during import-jdl: ${e}`, e);
    throw new Error(`Error during import-jdl: ${e.message}`);
  }
};

export default jdl;
