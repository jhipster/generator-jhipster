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
const {
    CLI_NAME,
    initHelp,
    logger,
    createYeomanEnv,
    toString,
    getCommand,
    getCommandOptions,
    addKebabCase,
    getArgs,
    done,
    loadAllBlueprintsWithVersion,
    getBlueprintPackagePaths,
    loadBlueprintCommands,
    loadSharedOptions,
} = require('./utils');
const initAutoCompletion = require('./completion').init;
const SUB_GENERATORS = require('./commands');
const { packageNameToNamespace } = require('../generators/utils');

const program = new commander.Command();
const version = packageJson.version;
const JHIPSTER_NS = CLI_NAME;

const blueprintsWithVersion = loadAllBlueprintsWithVersion();
const allBlueprints = Object.keys(blueprintsWithVersion);

const env = createYeomanEnv(allBlueprints);
const blueprintsPackagePath = getBlueprintPackagePaths(env, blueprintsWithVersion);
const sharedOptions = loadSharedOptions(blueprintsPackagePath) || {};
// Env will forward sharedOptions to every generator
Object.assign(env.sharedOptions, sharedOptions);

program.storeOptionsAsProperties(false).passCommandToAction(false).version(version).usage('[command] [options]').allowUnknownOption();

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
    logger.info(chalk.yellow(`Options: ${toString(options)}`));
    try {
        env.run(command, options, done);
    } catch (e) {
        logger.error(e.message, e);
    }
};

const blueprintCommands = loadBlueprintCommands(blueprintsPackagePath);
const allCommands = { ...SUB_GENERATORS, ...blueprintCommands };

/* create commands */
Object.entries(allCommands).forEach(([key, opts]) => {
    const command = program.command(`${key} ${getArgs(opts)}`, '', { isDefault: key === 'app' });
    if (opts.alias) {
        command.alias(opts.alias);
    }

    (opts.options || []).forEach(opt => {
        command.option(opt.option, opt.desc, opt.default);
    });

    if (!opts.cliOnly) {
        const namespace = opts.blueprint ? `${packageNameToNamespace(opts.blueprint)}:${key}` : `${JHIPSTER_NS}:${key}`;
        const generator = env.create(namespace, { options: { help: true } });
        Object.entries(generator._options).forEach(([key, value]) => {
            if (value.hide || key === 'help') {
                return;
            }
            let cmdString = '';
            if (value.alias) {
                cmdString = `-${value.alias}, `;
            }
            cmdString = `${cmdString}--${key}`;
            if (value.type === String) {
                cmdString = `${cmdString} <value>`;
            }
            command.option(cmdString, value.description, value.default);
        });
    }

    command
        .allowUnknownOption()
        .description(opts.desc)
        .action((first, second, third) => {
            let args;
            let cmdOptions;
            let unknownArgs;
            logger.debug(`first command arg: ${toString(first)}`);
            logger.debug(`second command arg: ${toString(second)}`);
            logger.debug(`third command arg: ${toString(third)}`);

            if (opts.argument) {
                // Option that contains arguments
                // first=arguments second=cmdOptions third=unknownArgs
                if (Array.isArray(first)) {
                    // Var args unknown options are concatenated.
                    // consider valid args before first unknown option (starts with -).
                    args = [];
                    unknownArgs = [];
                    let unknown = false;
                    first.forEach(item => {
                        if (item.startsWith('-')) {
                            unknown = true;
                        }
                        if (unknown) {
                            unknownArgs.push(item);
                        } else {
                            args.push(item);
                        }
                    });
                } else if (first !== undefined) {
                    args = [first];
                }
                cmdOptions = second;
                if (third) {
                    unknownArgs = (unknownArgs || []).concat(third);
                }
            } else {
                // Option that doesn't contain arguments
                // first=cmdOptions second=unknownArgs
                args = [];
                cmdOptions = first;
                unknownArgs = second || [];
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

            const customOptions = {};
            if (key === 'jdl' && (program.args[0] === 'import-jdl' || process.env.CI === 'true')) {
                // When running inside CI environment we should use skipSampleRepository by default.
                customOptions.skipSampleRepository = true;
            }

            // Get unknown options and parse.
            const options = {
                ...getCommandOptions(packageJson, unknownArgs),
                ...addKebabCase(program.opts()),
                ...addKebabCase(cmdOptions),
                ...addKebabCase(customOptions),
            };

            if (opts.cliOnly) {
                logger.debug('Executing CLI only script');
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

/* Enable autocompletion: This needs to right before parsing argv */
initAutoCompletion(program, CLI_NAME);

program.parse(process.argv);
