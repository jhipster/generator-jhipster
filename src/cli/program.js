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
const { Option } = require('commander');
const didYouMean = require('didyoumean');
const fs = require('fs');
const path = require('path');

const EnvironmentBuilder = require('./environment-builder');
const SUB_GENERATORS = require('./commands');
const JHipsterCommand = require('./jhipster-command');
const { CLI_NAME, logger, getCommand, done } = require('./utils');
const { version: JHIPSTER_VERSION } = require('../package.json');
const { packageNameToNamespace } = require('../generators/utils');
const { logo } = require('../lib/constants/logo.cjs');

const JHIPSTER_NS = CLI_NAME;

const moreInfo = `\n  For more info visit ${chalk.blue('https://www.jhipster.tech')}\n`;

const printJHipsterLogo = () => {
  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(logo);
};

const createProgram = ({ executableName = CLI_NAME, executableVersion } = {}) => {
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
      .addOption(new Option('--from-jdl', 'Allow every option jdl forwards').default(false).hideHelp())
      .addOption(new Option('--bundled', 'Use JHipster generators bundled with current cli'))
      .addOption(new Option('--prefer-global', 'Alias for --blundled').hideHelp())
      .addOption(new Option('--prefer-local', 'Prefer JHipster generators installed in current folder node repository.').hideHelp())
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
    logger.info(`Did you mean ${chalk.yellow(suggestion)}?`);
  }

  const message = `${chalk.yellow(first)} is not a known command. See '${chalk.white(`${CLI_NAME} --help`)}'.`;
  logger.fatal(message);
};

const buildCommands = ({
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
              if (!(await env.getPackagePath(namespace))) {
                logger.fatal(chalk.red(`\nGenerator ${namespace} not found.\n`));
              }
              const generator = await env.create(namespace, { options: { help: true } });
              this.addGeneratorArguments(generator._arguments).addGeneratorOptions(generator._options);
            })
          );
          return;
        }
        if (!cliOnly || cmdName === 'jdl') {
          if (blueprint) {
            // Blueprint only command.
            const generator = await env.create(`${packageNameToNamespace(blueprint)}:${cmdName}`, { options: { help: true } });
            command.addGeneratorArguments(generator._arguments).addGeneratorOptions(generator._options);
          } else {
            const generatorName = cmdName === 'jdl' ? 'app' : cmdName;
            const dependencies = [];
            // Register jhipster upstream options.
            if (cmdName !== 'jdl') {
              const helpOptions = { options: { help: true } };
              const generator = await env.create(`${JHIPSTER_NS}:${cmdName}`, helpOptions);
              command.addGeneratorArguments(generator._arguments).addGeneratorOptions(generator._options);

              const addDependenciesOptions = newDependencies =>
                Promise.all(
                  newDependencies.map(async dependency => {
                    if (dependencies.includes(dependency)) return undefined;
                    dependencies.push(dependency);
                    const dependecyGenerator = await env.create(`${JHIPSTER_NS}:${dependency}`, helpOptions);
                    command.addGeneratorOptions(dependecyGenerator._options);
                    return addDependenciesOptions(await dependecyGenerator.getPossibleDependencies());
                  })
                );
              await addDependenciesOptions(await generator.getPossibleDependencies());

              const usagePath = path.resolve(generator.sourceRoot(), '../USAGE');
              if (fs.existsSync(usagePath)) {
                command.addHelpText('after', `\n${fs.readFileSync(usagePath, 'utf8')}`);
              }
            }
            if (cmdName === 'jdl' || program.opts().fromJdl) {
              const appGenerator = await env.create(`${JHIPSTER_NS}:app`, { options: { help: true } });
              command.addGeneratorOptions(appGenerator._options, chalk.gray(' (application)'));

              const workspacesGenerator = await env.create(`${JHIPSTER_NS}:workspaces`, { options: { help: true } });
              command.addGeneratorOptions(workspacesGenerator._options, chalk.gray(' (workspaces)'));
            }

            // Register blueprint specific options.
            await Promise.all(
              envBuilder
                .getBlueprintsNamespaces()
                .map(blueprintNamespace =>
                  [generatorName, ...dependencies].map(async dependency => {
                    const generatorNamespace = `${blueprintNamespace}:${generatorName}`;
                    if (!(await env.get(generatorNamespace))) {
                      return;
                    }
                    const blueprintName = blueprintNamespace.replace(/^jhipster-/, '');
                    const blueprintGenerator = await env.create(generatorNamespace, { options: { help: true } });
                    try {
                      command.addGeneratorOptions(blueprintGenerator._options, chalk.yellow(` (blueprint option: ${blueprintName})`));
                    } catch (error) {
                      logger.info(`Error parsing options for generator ${generatorNamespace}, error: ${error}`);
                    }
                  })
                )
                .flat()
            );
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
        };
        if (options.installPath) {
          // eslint-disable-next-line no-console
          console.log(`Using jhipster at ${path.dirname(__dirname)}`);
          return undefined;
        }

        printLogo();
        printBlueprintLogo();

        if (cliOnly) {
          logger.debug('Executing CLI only script');
          return loadCommand(cmdName)(args, options, env, envBuilder, createEnvBuilder);
        }
        await env.composeWith('jhipster:bootstrap', options);

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

const buildJHipster = ({
  executableName,
  executableVersion,
  program = createProgram({ executableName, executableVersion }),
  blueprints,
  lookups,
  createEnvBuilder = (args, options) => EnvironmentBuilder.create(args, options).prepare({ blueprints, lookups }),
  envBuilder = createEnvBuilder(),
  commands = { ...SUB_GENERATORS, ...envBuilder.getBlueprintCommands() },
  printLogo,
  printBlueprintLogo,
  env = envBuilder.getEnvironment(),
  /* eslint-disable-next-line global-require, import/no-dynamic-require */
  loadCommand = key => require(`./${key}`),
  defaultCommand,
} = {}) => {
  /* setup debugging */
  logger.init(program);

  buildCommands({ program, commands, envBuilder, env, loadCommand, defaultCommand, printLogo, printBlueprintLogo, createEnvBuilder });

  return program;
};

const runJHipster = (args = {}) => {
  const { argv = process.argv } = args;
  return buildJHipster(args).parseAsync(argv);
};

module.exports = {
  createProgram,
  buildCommands,
  buildJHipster,
  runJHipster,
  printJHipsterLogo,
  done,
  logger,
};
