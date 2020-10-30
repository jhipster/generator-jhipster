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
const chalk = require('chalk');
const didYouMean = require('didyoumean');
const { Option } = require('commander');

const JHipsterCommand = require('./jhipster-command');
const packageJson = require('../package.json');
const { CLI_NAME, initHelp, logger, toString, getCommand, getArgs, done } = require('./utils');
const EnvironmentBuilder = require('./environment-builder');
const SUB_GENERATORS = require('./commands');
const { packageNameToNamespace } = require('../generators/utils');

const version = packageJson.version;
const JHIPSTER_NS = CLI_NAME;

const envBuilder = EnvironmentBuilder.createDefaultBuilder();
const env = envBuilder.getEnvironment();

const program = new JHipsterCommand()
    .storeOptionsAsProperties(false)
    .passCommandToAction(false)
    .version(version)
    .usage('[command] [options]')
    // JHipster common options
    .option(
        '--blueprints <value>',
        'A comma separated list of one or more generator blueprints to use for the sub generators, e.g. --blueprints kotlin,vuejs'
    )
    .option('--no-insight', 'Disable insight')
    // Conflicter options
    .option('--force', 'Override every file', false)
    .option('--dry-run', 'Print conflicts', false)
    .option('--whitespace', 'Whitespace changes will not trigger conflicts', false)
    .option('--bail', 'Fail on first conflict', false)
    .option('--skip-regenerate', "Don't regenerate identical files", false)
    .option('--skip-yo-resolve', 'Ignore .yo-resolve files', false)
    .addOption(new Option('--from-jdl', 'Allow every option jdl forwards').default(false).hideHelp());

/* setup debugging */
logger.init(program);

/**
 *  Run a yeoman command
 */
const runYoCommand = (cmd, args, options, opts) => {
    logger.debug(`cmd: ${toString(cmd)}`);
    logger.debug(`args: ${toString(args)}`);
    logger.debug(`opts: ${toString(opts)}`);
    const command = getCommand(cmd, args, opts);
    logger.info(chalk.yellow(`Executing ${command}`));
    logger.debug(chalk.yellow(`Options: ${toString(options)}`));
    try {
        env.run(command, options).then(done, done);
    } catch (e) {
        logger.error(e.message, e);
    }
};

const allCommands = { ...SUB_GENERATORS, ...envBuilder.getBlueprintCommands() };

/* create commands */
Object.entries(allCommands).forEach(([key, opts]) => {
    const command = program.command(key, '', { isDefault: key === 'app' });
    if (opts.alias) {
        command.alias(opts.alias);
    }

    command.addCommandOptions(opts.options);

    if (opts.cliOnly) {
        command.arguments(getArgs(opts));
    }
    if (!opts.cliOnly || key === 'jdl') {
        if (opts.blueprint) {
            // Blueprint only command.
            command.prepareOptions(() => {
                const generator = env.create(`${packageNameToNamespace(opts.blueprint)}:${key}`, { options: { help: true } });
                command.addGeneratorArguments(generator._arguments).addGeneratorOptions(generator._options);
                opts.argument = generator._arguments.map(generatorArgument => generatorArgument.name);
            });
        } else {
            command.prepareOptions(() => {
                const generator = key === 'jdl' ? 'app' : key;
                // Register jhipster upstream options.
                if (key !== 'jdl') {
                    const generator = env.create(`${JHIPSTER_NS}:${key}`, { options: { help: true } });
                    if (generator._arguments) {
                        opts.argument = generator._arguments.map(generatorArgument => generatorArgument.name);
                    }
                    command.addGeneratorArguments(generator._arguments).addGeneratorOptions(generator._options);
                }
                if (key === 'jdl' || program.opts().fromJdl) {
                    const generator = env.create(`${JHIPSTER_NS}:app`, { options: { help: true } });
                    command.addGeneratorOptions(generator._options, chalk.gray(' (application)'));
                }

                // Register blueprint specific options.
                envBuilder.getBlueprintsNamespaces().forEach(blueprintNamespace => {
                    const generatorNamespace = `${blueprintNamespace}:${generator}`;
                    if (!env.get(generatorNamespace)) {
                        return;
                    }
                    const blueprintName = blueprintNamespace.replace(/^jhipster-/, '');
                    try {
                        command.addGeneratorOptions(
                            env.create(generatorNamespace, { options: { help: true } })._options,
                            chalk.yellow(` (blueprint option: ${blueprintName})`)
                        );
                    } catch (error) {
                        logger.info(
                            `Error parsing options for generator ${generatorNamespace}, unknown option will lead to error at jhipster 7`
                        );
                    }
                });
            });
        }
    }

    const additionalCommandDescription = opts.blueprint ? chalk.yellow(` (blueprint: ${opts.blueprint})`) : '';
    command
        .description(opts.desc + additionalCommandDescription)
        .action((...everything) => {
            // [args, opts, extraArgs]
            const cmdOptions = everything.pop();
            if (Array.isArray(cmdOptions)) {
                // if extraArgs exists: Unknown commands or unknown argument.
                const cmd = cmdOptions[0];
                if (key !== 'app') {
                    logger.fatal(
                        `${chalk.yellow(key)} command doesn't take ${chalk.yellow(cmd)} argument. See '${chalk.white(
                            `${CLI_NAME} ${key} --help`
                        )}'.`
                    );
                    return;
                }
                const availableCommands = program.commands.map(c => c._name);

                const suggestion = didYouMean(cmd, availableCommands);
                if (suggestion) {
                    logger.info(`Did you mean ${chalk.yellow(suggestion)}?`);
                }

                logger.fatal(`${chalk.yellow(cmd)} is not a known command. See '${chalk.white(`${CLI_NAME} --help`)}'.`);
                return;
            }
            const args = everything;

            // Get unknown options and parse.
            const options = {
                ...program.opts(),
                ...cmdOptions,
            };

            if (opts.cliOnly) {
                logger.debug('Executing CLI only script');
                if (args.length > 0 && Array.isArray(args[args.length - 1])) {
                    // Convert the variadic argument into a argument for backward compatibility.
                    // Remove for jhipster 7
                    args.push(...args.pop());
                }
                /* eslint-disable global-require, import/no-dynamic-require */
                require(`./${key}`)(args, options, env);
                /* eslint-enable */
            } else {
                const namespace = opts.blueprint ? `${packageNameToNamespace(opts.blueprint)}:${key}` : `${JHIPSTER_NS}:${key}`;
                runYoCommand(namespace, args, options, opts);
            }
        })
        .on('--help', () => {
            if (opts.help) {
                /* eslint-disable-next-line no-console */
                console.log(opts.help);
            }
        });
});

/* Generate useful help info during typos */
initHelp(program, CLI_NAME);

program.parse(process.argv);

process.on('unhandledRejection', up => {
    throw up;
});
