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
const commander = require('commander');
const chalk = require('chalk');
const didYouMean = require('didyoumean');

const packageJson = require('../package.json');
const { CLI_NAME, initHelp, logger, toString, getCommand, getCommandOptions, getArgs, done, buildCommanderOptions } = require('./utils');
const EnvironmentBuilder = require('./environment-builder');
const SUB_GENERATORS = require('./commands');
const { packageNameToNamespace } = require('../generators/utils');

const program = new commander.Command();
const version = packageJson.version;
const JHIPSTER_NS = CLI_NAME;

const envBuilder = EnvironmentBuilder.createDefaultBuilder();
const env = envBuilder.getEnvironment();

program
    .storeOptionsAsProperties(false)
    .passCommandToAction(false)
    .version(version)
    .usage('[command] [options]')
    .allowUnknownOption()
    // JHipster common options
    .option(
        '--blueprints <value>',
        'A comma separated list of one or more generator blueprints to use for the sub generators, e.g. --blueprints kotlin,vuejs'
    )
    .option('--no-insight', 'Disable insight', false)
    // Conflicter options
    .option('--force', 'Override every file', false)
    .option('--dry-run', 'Print conflicts', false)
    .option('--whitespace', 'Whitespace changes will not trigger conflicts', false)
    .option('--bail', 'Fail on first conflict', false)
    .option('--skip-regenerate', "Don't regenerate identical files", false)
    .option('--skip-yo-resolve', 'Ignore .yo-resolve files', false);

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
    const command = program.command(`${key} ${getArgs(opts)}`, '', { isDefault: key === 'app' });
    if (opts.alias) {
        command.alias(opts.alias);
    }

    (opts.options || []).forEach(opt => {
        const additionalDescription = opts.blueprint ? chalk.yellow(` (blueprint option: ${opts.blueprint})`) : '';
        command.option(opt.option, opt.desc + additionalDescription, opt.default);
    });

    if (!opts.cliOnly) {
        const registeredOptions = [];
        const registerGeneratorOptions = (generator, blueprintOptionDescription) => {
            Object.entries(generator._options).forEach(([key, value]) => {
                if (registeredOptions.includes(key)) {
                    return;
                }
                registeredOptions.push(key);
                buildCommanderOptions(key, value, blueprintOptionDescription).forEach(commanderOption => {
                    command.option(...commanderOption);
                });
            });
        };

        if (opts.blueprint) {
            // Blueprint only command.
            registerGeneratorOptions(env.create(`${packageNameToNamespace(opts.blueprint)}:${key}`, { options: { help: true } }));
        } else {
            // Register jhipster upstream options.
            registerGeneratorOptions(env.create(`${JHIPSTER_NS}:${key}`, { options: { help: true } }));

            // Register blueprint specific options.
            envBuilder.getBlueprintsNamespaces().forEach(blueprintNamespace => {
                const generatorNamespace = `${blueprintNamespace}:${key}`;
                if (!env.get(generatorNamespace)) {
                    return;
                }
                const blueprintName = blueprintNamespace.replace(/^jhipster-/, '');
                try {
                    registerGeneratorOptions(
                        env.create(generatorNamespace, { options: { help: true } }),
                        chalk.yellow(` (blueprint option: ${blueprintName})`)
                    );
                } catch (error) {
                    logger.info(
                        `Error parsing options for generator ${generatorNamespace}, unknown option will lead to error at jhipster 7`
                    );
                }
            });
        }
    }

    const additionalCommandDescription = opts.blueprint ? chalk.yellow(` (blueprint: ${opts.blueprint})`) : '';
    command
        .allowUnknownOption()
        .description(opts.desc + additionalCommandDescription)
        .action((...everything) => {
            let cmdOptions;
            let unknownArgs = [];
            const last = everything.pop();
            if (Array.isArray(last)) {
                unknownArgs = last || [];
                cmdOptions = everything.pop();
            } else {
                cmdOptions = last;
            }

            // Arguments processing merges unknown options with cmd args, move unknown options back
            // Unknown options should be disabled for jhipster 7
            const splitUnknown = argsToSplit => {
                const args = [];
                const unknown = [];
                argsToSplit.find((item, index) => {
                    if (item && item.startsWith('-')) {
                        unknown.push(...argsToSplit.slice(index));
                        return true;
                    }
                    args.push(item);
                    return false;
                });
                return [args, unknown];
            };
            const variadicArg = everything.pop();

            const splitted = splitUnknown(everything);
            const args = splitted[0];
            unknownArgs.unshift(...splitted[1]);

            if (variadicArg) {
                if (Array.isArray(variadicArg)) {
                    const splittedVariadic = splitUnknown(variadicArg);
                    if (splittedVariadic[0].length > 0) {
                        args.push(splittedVariadic[0]);
                    }
                    unknownArgs.unshift(...splittedVariadic[1]);
                } else {
                    args.push(variadicArg);
                }
            }

            const firstUnknownArg = Array.isArray(unknownArgs) && unknownArgs.length > 0 ? unknownArgs[0] : undefined;
            if (key === 'app' && firstUnknownArg !== undefined && !firstUnknownArg.startsWith('-')) {
                // Unknown commands.
                const cmd = Object.values(unknownArgs).join('');
                const availableCommands = program.commands.map(c => c._name);

                const suggestion = didYouMean(cmd, availableCommands);
                if (suggestion) {
                    logger.info(`Did you mean ${chalk.yellow(suggestion)}?`);
                }

                logger.fatal(`${chalk.yellow(firstUnknownArg)} is not a known command. See '${chalk.white(`${CLI_NAME} --help`)}'.`);
                return;
            }

            // Get unknown options and parse.
            const options = {
                ...getCommandOptions(packageJson, unknownArgs),
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
