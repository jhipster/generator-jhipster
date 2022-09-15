/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const chalk = require('chalk');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const pluralize = require('pluralize');
const { fork: forkProcess } = require('child_process');

const EnvironmentBuilder = require('./environment-builder');
const { CLI_NAME, GENERATOR_NAME, logger, toString, printSuccess, getOptionAsArgs } = require('./utils');
const { createImporterFromContent, createImporterFromFiles } = require('../jdl/jdl-importer');

const packagejs = require('../package.json');
const statistics = require('../generators/statistics');
const { JHIPSTER_CONFIG_DIR } = require('../generators/generator-constants');

const jhipsterCli = require.resolve('./cli.js');
const { writeConfigFile } = require('../jdl/exporters/export-utils');
const { createFolderIfItDoesNotExist } = require('../jdl/utils/file-utils');

const getDeploymentType = deployment => deployment && deployment[GENERATOR_NAME] && deployment[GENERATOR_NAME].deploymentType;

/**
 * Check if .yo-rc.json exists inside baseName folder.
 * @param {string} baseName
 * @return {boolean}
 */
const baseNameConfigExists = baseName => fs.existsSync(baseName === undefined ? '.yo-rc.json' : path.join(baseName, '.yo-rc.json'));

const multiplesApplications = processor => {
  return Object.values(processor.importState.exportedApplicationsWithEntities).length > 1;
};

/**
 * When importing multiples applications, we should import each of them at it's own baseName folder.
 * @param {JDLProcessor} processor
 * @return {boolean}
 */
const shouldRunInFolder = processor => {
  return multiplesApplications(processor);
};

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
  if (processor.options.force !== undefined) {
    return processor.options.force;
  }
  if (Object.values(processor.importState.exportedApplicationsWithEntities).length === 0) {
    return undefined;
  }
  return allNewApplications(processor) ? true : undefined;
};

/**
 * JHipster will use fork by default only when generating new applications, otherwise it can conflict with incremental changelog.
 * @param {JDLProcessor} processor
 * @return {boolean}
 */
const shouldFork = processor => {
  if (processor.options.fork !== undefined) {
    return processor.options.fork;
  }
  if (Object.values(processor.importState.exportedApplicationsWithEntities).length > 1 && allNewApplications(processor)) {
    return true;
  }
  return undefined;
};

/**
 * When regenerating applications we should run interactively, so prompts will be shown by default.
 * @param {JDLProcessor} processor
 * @return {boolean} true if generation should be executed interactively
 */
const shouldRunInteractively = processor => {
  if (processor.options.interactive !== undefined) {
    return processor.options.interactive;
  }
  return !shouldFork(processor);
};

/**
 * Write entity config to disk.
 * @param {any} entity
 * @param {string} basePath
 */
function writeEntityConfig(entity, basePath) {
  const entitiesPath = path.join(basePath, JHIPSTER_CONFIG_DIR);
  createFolderIfItDoesNotExist(entitiesPath);
  const filePath = path.join(entitiesPath, `${_.upperFirst(entity.name)}.json`);
  fs.writeFileSync(filePath, JSON.stringify(entity, null, 2).concat('\n'));
}

/**
 * Write application config to disk.
 * @param {any} applicationWithEntities
 * @param {string} basePath
 */
function writeApplicationConfig(applicationWithEntities, basePath) {
  createFolderIfItDoesNotExist(basePath);
  writeConfigFile({ 'generator-jhipster': applicationWithEntities.config }, path.join(basePath, '.yo-rc.json'));
  applicationWithEntities.entities.forEach(entity => writeEntityConfig(entity, basePath));
}

/**
 * Run the generator.
 * @param {string} command
 * @param {Object} options
 * @param {string} options.cwd
 * @param {boolean} options.fork
 * @param {Environment} options.env
 * @param {Object} [generatorOptions]
 */
function runGenerator(command, { cwd, fork, env, createEnvBuilder }, generatorOptions = {}) {
  const { workspaces } = generatorOptions;
  generatorOptions = {
    ...generatorOptions,
    // Remove jdl command exclusive options
    fork: undefined,
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

  if (!fork) {
    const oldCwd = process.cwd();
    process.chdir(cwd);
    env = env || createEnvBuilder(undefined, { cwd }).getEnvironment();
    return env
      .run(`${CLI_NAME}:${command}`, generatorOptions)
      .then(
        () => {
          logger.info(`Generator ${command} succeed`);
        },
        error => {
          logger.error(`Error running generator ${command}: ${error}`, error);
          return Promise.reject(error);
        }
      )
      .finally(() => {
        process.chdir(oldCwd);
      });
  }
  logger.debug(`Child process will be triggered for ${command} with cwd: ${cwd}`);
  const args = [command, ...getOptionAsArgs(generatorOptions)];
  const childProc = forkProcess(jhipsterCli, args, {
    cwd,
  });
  return new Promise((resolve, reject) => {
    childProc.on('exit', code => {
      logger.debug(`Process ${args} exited with code ${code}`);
      logger.info(`Generator ${command} child process exited with code ${code}`);
      if (code !== 0) {
        process.exitCode = code;
        reject(new Error(`Error executing ${args.join(' ')}`));
        return;
      }
      resolve();
    });
  });
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
 * Generate deployment source code for JDL deployments defined.
 * @param {any} config
 * @returns Promise
 */
const generateDeploymentFiles = ({ processor, deployment }) => {
  const deploymentType = getDeploymentType(deployment);
  logger.info(`Generating deployment ${deploymentType} in a new parallel process`);
  logger.debug(`Generating deployment: ${JSON.stringify(deployment[GENERATOR_NAME], null, 2)}`);

  const { pwd, createEnvBuilder } = processor;
  const cwd = path.join(pwd, deploymentType);
  logger.debug(`Child process will be triggered for ${jhipsterCli} with cwd: ${cwd}`);

  return runGenerator(deploymentType, { cwd, fork: false, createEnvBuilder }, { force: true, ...processor.options, skipPrompts: true });
};

/**
 * Generate application source code for JDL apps defined.
 * @param {any} config
 * @returns Promise
 */
const generateApplicationFiles = ({ processor, applicationWithEntities }) => {
  logger.debug(`Generating application: ${JSON.stringify(applicationWithEntities.config, null, 2)}`);
  const { inFolder, fork, force, reproducible, createEnvBuilder } = processor;
  const baseName = applicationWithEntities.config.baseName;
  const cwd = inFolder ? path.join(processor.pwd, baseName) : processor.pwd;
  if (processor.options.jsonOnly) {
    writeApplicationConfig(applicationWithEntities, cwd);
    return Promise.resolve();
  }
  if (fork) {
    writeApplicationConfig(applicationWithEntities, cwd);
  }

  const withEntities = applicationWithEntities.entities.length > 0 ? true : undefined;
  const generatorOptions = { reproducible, force, withEntities, ...processor.options };
  if (!fork) {
    generatorOptions.applicationWithEntities = applicationWithEntities;
  }

  return runGenerator('app', { cwd, fork, createEnvBuilder }, generatorOptions);
};

/**
 * Generate entities for the applications
 * @param {any} processor
 * @param {any} exportedEntities
 * @param {any} env
 * @return Promise
 */
const generateEntityFiles = (processor, exportedEntities, env) => {
  const { fork, inFolder, force, createEnvBuilder } = processor;
  const generatorOptions = {
    force,
    ...processor.options,
  };

  const callGenerator = baseName => {
    const cwd = inFolder && baseName ? path.join(processor.pwd, baseName) : processor.pwd;

    if (processor.options.jsonOnly || baseName) {
      exportedEntities
        .filter(entity => !baseName || entity.applications.includes(baseName))
        .forEach(entity => writeEntityConfig(entity, cwd));
      if (processor.options.jsonOnly) {
        logger.info('Entity JSON files created. Entity generation skipped.');
        return Promise.resolve();
      }
    } else {
      generatorOptions.entitiesToImport = exportedEntities;
    }

    logger.info(`Generating entities for application ${baseName} in a new parallel process`);

    logger.debug(`Child process will be triggered for ${jhipsterCli} with cwd: ${cwd}`);
    return runGenerator('entities', { cwd, env, fork, createEnvBuilder }, generatorOptions);
  };

  if (fork) {
    /* Generating entities inside multiple apps */
    const baseNames = [...new Set(exportedEntities.flatMap(entity => entity.applications))];
    if (processor.interactive) {
      return baseNames.reduce((promise, baseName) => {
        return promise.then(() => callGenerator(baseName));
      }, Promise.resolve());
    }
    return Promise.all(baseNames.map(baseName => callGenerator(baseName)));
  }

  return callGenerator();
};

class JDLProcessor {
  constructor(jdlFiles, jdlContent, options, createEnvBuilder) {
    logger.debug(
      `JDLProcessor started with ${jdlContent ? `content: ${jdlContent}` : `files: ${jdlFiles}`} and options: ${toString(options)}`
    );
    this.jdlFiles = jdlFiles;
    this.jdlContent = jdlContent;
    this.options = options;
    this.pwd = process.cwd();
    this.createEnvBuilder = createEnvBuilder;
  }

  importJDL() {
    const configuration = {
      applicationName: this.options.baseName,
      databaseType: this.options.db,
      applicationType: this.options.applicationType,
      skipUserManagement: this.options.skipUserManagement,
      unidirectionalRelationships: this.options.unidirectionalRelationships,
      forceNoFiltering: this.options.forceNoFiltering,
      generatorVersion: packagejs.version,
      skipFileGeneration: true,
    };

    let importer;
    if (this.jdlContent) {
      importer = createImporterFromContent(this.jdlContent, configuration);
    } else {
      importer = createImporterFromFiles(this.jdlFiles, configuration);
    }
    this.importState = importJDL.call(this, importer);
  }

  config() {
    this.interactive = shouldRunInteractively(this);
    this.fork = shouldFork(this);
    this.reproducible = allNewApplications(this);
    this.inFolder = shouldRunInFolder(this);
    this.force = shouldForce(this);
    return this;
  }

  sendInsight() {
    statistics.sendSubGenEvent('generator', 'import-jdl');
  }

  generateWorkspaces(options, generateJdl) {
    return this.createEnvBuilder()
      .getEnvironment()
      .run('jhipster:workspaces', { workspaces: false, ...options, importState: this.importState, generateJdl });
  }

  generateApplications() {
    if (this.options.ignoreApplication) {
      logger.debug('Applications not generated');
      return Promise.resolve();
    }
    const callGenerator = applicationWithEntities => {
      try {
        return generateApplicationFiles({
          processor: this,
          applicationWithEntities,
        });
      } catch (error) {
        logger.error(`Error while generating applications from the parsed JDL\n${error}`, error);
        throw error;
      }
    };
    const applicationsWithEntities = Object.values(this.importState.exportedApplicationsWithEntities);
    logger.info(`Generating ${applicationsWithEntities.length} ${pluralize('application', applicationsWithEntities.length)}.`);
    if (applicationsWithEntities.length === 0) {
      return Promise.resolve();
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

    if (this.interactive) {
      return applicationsWithEntities.reduce((promise, applicationWithEntities) => {
        return promise.then(() => callGenerator(applicationWithEntities));
      }, Promise.resolve());
    }
    return Promise.all(applicationsWithEntities.map(applicationWithEntities => callGenerator(applicationWithEntities)));
  }

  generateDeployments() {
    if (!shouldGenerateDeployments(this)) {
      logger.debug('Deployments not generated');
      return Promise.resolve();
    }
    logger.info(
      `Generating ${this.importState.exportedDeployments.length} ` +
        `${pluralize('deployment', this.importState.exportedDeployments.length)}.`
    );

    const callDeploymentGenerator = () => {
      const callGenerator = deployment => {
        try {
          return generateDeploymentFiles({
            processor: this,
            deployment,
          });
        } catch (error) {
          logger.error(`Error while generating deployments from the parsed JDL\n${error}`, error);
          throw error;
        }
      };
      // Queue callGenerator in chain
      return this.importState.exportedDeployments.reduce((promise, deployment) => {
        return promise.then(() => callGenerator(deployment));
      }, Promise.resolve());
    };

    return callDeploymentGenerator();
  }

  generateEntities(env) {
    if (this.importState.exportedEntities.length === 0 || shouldGenerateApplications(this)) {
      logger.debug('Entities not generated');
      return Promise.resolve();
    }
    try {
      logger.info(
        `Generating ${this.importState.exportedEntities.length} ${pluralize('entity', this.importState.exportedEntities.length)}.`
      );
      return generateEntityFiles(this, this.importState.exportedEntities, env);
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
 */
module.exports = (jdlFiles, options = {}, env, _envBuilder, createEnvBuilder = EnvironmentBuilder.createDefaultBuilder) => {
  logger.info(chalk.yellow(`Executing import-jdl ${options.inline ? 'with inline content' : jdlFiles.join(' ')}`));
  logger.debug(chalk.yellow(`Options: ${toString({ ...options, inline: options.inline ? 'inline content' : '' })}`));
  try {
    const jdlImporter = new JDLProcessor(jdlFiles, options.inline, options, createEnvBuilder);
    jdlImporter.importJDL();
    jdlImporter.sendInsight();
    jdlImporter.config();

    const generateJdl = () =>
      jdlImporter
        .generateApplications()
        .then(() => jdlImporter.generateEntities(env))
        .then(() => jdlImporter.generateDeployments());

    let generation;
    if (!options.workspaces || !multiplesApplications(jdlImporter)) {
      generation = generateJdl();
    } else {
      // Wrap generation inside workspaces root generation.
      // generate applications after git initialization and before root npm install
      generation = jdlImporter.generateWorkspaces(options, generateJdl);
    }

    return generation.then(() => {
      printSuccess();
      return jdlFiles;
    });
  } catch (e) {
    logger.error(`Error during import-jdl: ${e}`, e);
    return Promise.reject(new Error(`Error during import-jdl: ${e.message}`));
  }
};
