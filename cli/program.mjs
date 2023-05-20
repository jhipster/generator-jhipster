/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
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
import didYouMean from 'didyoumean';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import logo from './logo.mjs';
import EnvironmentBuilder from './environment-builder.mjs';
import SUB_GENERATORS from './commands.mjs';
import JHipsterCommand from './jhipster-command.mjs';
import { CLI_NAME, logger, getCommand, done } from './utils.mjs';
import { packageJson } from '../lib/index.mjs';
import { packageNameToNamespace } from '../generators/base/support/index.mjs';
import command from '../generators/base/command.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { version: JHIPSTER_VERSION } = packageJson;
const JHIPSTER_NS = CLI_NAME;

const moreInfo = `\n  For more info visit ${chalk.blue('https://www.jhipster.tech')}\n`;

export const printJHipsterLogo = () => {
  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(logo);
};

const buildAllDependencies = async (generatorNames, { env }) => {
  const allDependencies = {};
  const buildGeneratorDependencies = async dependencyName => {
    const meta = await env.getGeneratorMeta(dependencyName.includes(':') ? dependencyName : `${JHIPSTER_NS}:${dependencyName}`);
    if (!meta) {
      return;
    }
    allDependencies[dependencyName] = meta;
    const generatorModule = await meta.importModule();
    if (generatorModule.command) {
      for (const dependency of generatorModule.command.import ?? []) {
        if (!allDependencies[dependency]) {
          await buildGeneratorDependencies(dependency);
        }
      }
    }
  };
  for (const generatorName of generatorNames) {
    await buildGeneratorDependencies(generatorName);
  }
  return allDependencies;
};

const addCommandGeneratorOptions = async (command, generatorMeta, { root, blueprintOptionDescription, info } = {}) => {
  const generatorModule = await generatorMeta.importModule();
  if (generatorModule.command) {
    command.addJHipsterOptions(generatorModule.command.options, blueprintOptionDescription);
  }
  try {
    if (root || !generatorModule.command || generatorModule.command.loadGeneratorOptions) {
      const generator = await generatorMeta.instantiateHelp();
      // Add basic yeoman generator options
      command.addGeneratorOptions(generator._options, blueprintOptionDescription);
    }
  } catch (error) {
    if (!info) {
      throw error;
    }
    logger.verboseInfo(`${info}, error: ${error}`);
  }
};

const addCommandRootGeneratorOptions = async (command, generatorMeta, { usage = true } = {}) => {
  const generatorModule = await generatorMeta.importModule();
  if (generatorModule.command) {
    command.addJHipsterArguments(generatorModule.command.arguments);
  } else {
    const generator = await generatorMeta.instantiateHelp();
    command.addGeneratorArguments(generator._arguments);
  }
  if (usage) {
    const usagePath = path.resolve(path.dirname(generatorMeta.resolved), 'USAGE');
    if (fs.existsSync(usagePath)) {
      command.addHelpText('after', `\n${fs.readFileSync(usagePath, 'utf8')}`);
    }
  }
};

export const createProgram = ({ executableName = CLI_NAME, executableVersion } = {}) => {
  return (
    new JHipsterCommand()
      .name(executableName)
      .storeOptionsAsProperties(false)
      .version(executableVersion ? `${executableVersion} (generator-jhipster ${JHIPSTER_VERSION})` : JHIPSTER_VERSION)
      .addHelpText('after', moreInfo)
      // JHipster common options
      .option(
        '--blueprints <value>',
        'A comma separated list of one or more generator blueprints to use for the sub generators, e.g. --blueprints kotlin,vuejs'
      )
      .option('--force-insight', 'Force insight')
      .option('--no-insight', 'Disable insight')
      // Conflicter options
      .option('--force', 'Override every file', false)
      .option('--dry-run', 'Print conflicts', false)
      .option('--whitespace', 'Whitespace changes will not trigger conflicts', false)
      .option('--bail', 'Fail on first conflict', false)
      .option('--install-path', 'Show jhipster install path', false)
      .option('--skip-regenerate', "Don't regenerate identical files", false)
      .option('--skip-yo-resolve', 'Ignore .yo-resolve files', false)
      .addJHipsterOptions(command.options)
  );
};

const rejectExtraArgs = ({ program, command, extraArgs }) => {
  // if extraArgs exists: Unknown commands or unknown argument.
  const first = extraArgs[0];
  if (command.name() !== 'app') {
    logger.fatal(
      `${chalk.yellow(command.name())} command doesn't take ${chalk.yellow(first)} argument. See '${chalk.white(
        `${program.name()} ${command.name()} --help`
      )}'.`
    );
  }
  const availableCommands = program.commands.map(c => c._name);

  const suggestion = didYouMean(first, availableCommands);
  if (suggestion) {
    logger.verboseInfo(`Did you mean ${chalk.yellow(suggestion)}?`);
  }

  const message = `${chalk.yellow(first)} is not a known command. See '${chalk.white(`${CLI_NAME} --help`)}'.`;
  logger.fatal(message);
};

export const buildCommands = async ({
  program,
  commands = {},
  envBuilder,
  env,
  loadCommand,
  defaultCommand = 'app',
  printLogo = printJHipsterLogo,
  printBlueprintLogo = () => {},
  createEnvBuilder,
}) => {
  /* create commands */
  Object.entries(commands).forEach(([cmdName, opts]) => {
    const { desc, blueprint, argument, options: commandOptions, alias, help: commandHelp, cliOnly, useOptions = {} } = opts;
    program
      .command(cmdName, '', { isDefault: cmdName === defaultCommand })
      .description(desc + (blueprint ? chalk.yellow(` (blueprint: ${blueprint})`) : ''))
      .addCommandArguments(argument)
      .addCommandOptions(commandOptions)
      .addHelpText('after', commandHelp)
      .addAlias(alias)
      .excessArgumentsCallback(function (receivedArgs) {
        rejectExtraArgs({ program, command: this, extraArgs: receivedArgs });
      })
      .lazyBuildCommand(async function (operands) {
        logger.debug(`cmd: lazyBuildCommand ${cmdName} ${operands}`);
        const command = this;

        if (cmdName === 'run') {
          command.usage(`${operands} [options]`);
          operands = Array.isArray(operands) ? operands : [operands];
          command.generatorNamespaces = operands.map(
            namespace => `${namespace.startsWith(JHIPSTER_NS) ? '' : `${JHIPSTER_NS}-`}${namespace}`
          );
          envBuilder.lookupGenerators(command.generatorNamespaces.map(namespace => `generator-${namespace.split(':')[0]}`));
          await Promise.all(
            command.generatorNamespaces.map(async namespace => {
              const generatorMeta = env.getGeneratorMeta(namespace.includes(':') ? namespace : `${JHIPSTER_NS}:${namespace}`);
              if (!generatorMeta) {
                logger.fatal(chalk.red(`\nGenerator ${namespace} not found.\n`));
              }

              await addCommandRootGeneratorOptions(command, generatorMeta, { usage: command.generatorNamespaces.length === 1 });
              await addCommandGeneratorOptions(command, generatorMeta, { root: true });
            })
          );
          return;
        }

        if (!cliOnly) {
          const generator = blueprint ? `${packageNameToNamespace(blueprint)}:${cmdName}` : cmdName;
          const generatorMeta = env.getGeneratorMeta(generator.includes(':') ? generator : `${JHIPSTER_NS}:${generator}`);
          if (!generatorMeta) {
            return;
          }

          await addCommandRootGeneratorOptions(command, generatorMeta);

          // Add bootstrap options, may be dropped if every generator is migrated to new structure and correctly depends on bootstrap.
          const boostrapGen = ['bootstrap', generator];
          const allDependencies = await buildAllDependencies(boostrapGen, { env });
          for (const [metaName, generatorMeta] of Object.entries(allDependencies)) {
            await addCommandGeneratorOptions(command, generatorMeta, { root: metaName === generator });
          }

          if (!blueprint) {
            // Register blueprint specific options.
            for (const blueprintNamespace of envBuilder.getBlueprintsNamespaces() ?? []) {
              for (const generatorName of Object.keys(allDependencies).filter(ns => !ns.includes(':'))) {
                const generatorNamespace = `${blueprintNamespace}:${generatorName}`;
                const blueprintMeta = env.getGeneratorMeta(generatorNamespace);
                if (blueprintMeta) {
                  const blueprintOptionDescription = chalk.yellow(` (blueprint option: ${blueprintNamespace.replace(/^jhipster-/, '')})`);
                  await addCommandGeneratorOptions(command, blueprintMeta, {
                    blueprintOptionDescription,
                    info: `Error parsing options for generator ${generatorNamespace}`,
                  });
                }
              }
            }
          }
        }
        command.addHelpText('after', moreInfo);
      })
      .action(async (...everything) => {
        logger.debug('cmd: action');
        // [args, opts, command]
        const command = everything.pop();
        const cmdOptions = everything.pop();
        const args = everything;
        const options = {
          ...program.opts(),
          ...cmdOptions,
          ...useOptions,
          commandName: cmdName,
          blueprints: envBuilder.getBlueprintsOption(),
          positionalArguments: args,
        };
        if (options.installPath) {
          // eslint-disable-next-line no-console
          console.log(`Using jhipster at ${path.dirname(__dirname)}`);
          return Promise.resolve();
        }

        printLogo();
        printBlueprintLogo();

        if (cliOnly) {
          logger.debug('Executing CLI only script');
          const cliOnlyCommand = await loadCommand(cmdName);
          return cliOnlyCommand instanceof Function
            ? cliOnlyCommand(args, options, env, envBuilder, createEnvBuilder)
            : Promise.reject(new Error(`Command ${cmdName} is not a function.`));
        }

        if (cmdName === 'run') {
          return Promise.all(command.generatorNamespaces.map(generator => env.run(generator, options))).then(
            results => done(results.find(result => result)),
            errors => done(errors.find(error => error))
          );
        }
        const namespace = blueprint ? `${packageNameToNamespace(blueprint)}:${cmdName}` : `${JHIPSTER_NS}:${cmdName}`;
        const generatorCommand = getCommand(namespace, args, opts);
        return env.run(generatorCommand, options).then(done, done);
      });
  });
};

export const buildJHipster = async ({
  executableName,
  executableVersion,
  program = createProgram({ executableName, executableVersion }),
  blueprints,
  lookups,
  createEnvBuilder,
  envBuilder,
  commands,
  printLogo,
  printBlueprintLogo,
  env,
  /* eslint-disable-next-line global-require, import/no-dynamic-require */
  loadCommand = async key => {
    const { default: command } = await import(`./${key}.mjs`);
    return command;
  },
  defaultCommand,
} = {}) => {
  // eslint-disable-next-line chai-friendly/no-unused-expressions
  createEnvBuilder = createEnvBuilder ?? (async options => EnvironmentBuilder.create(options).prepare({ blueprints, lookups }));
  envBuilder = envBuilder ?? (await createEnvBuilder());
  env = env ?? envBuilder.getEnvironment();
  commands = commands ?? { ...SUB_GENERATORS, ...(await envBuilder.getBlueprintCommands()) };

  await buildCommands({ program, commands, envBuilder, env, loadCommand, defaultCommand, printLogo, printBlueprintLogo, createEnvBuilder });

  return program;
};

export const runJHipster = async (args = {}) => {
  const { argv = process.argv } = args;
  const jhipsterProgram = await buildJHipster(args);
  return jhipsterProgram.parseAsync(argv);
};

export { done };
