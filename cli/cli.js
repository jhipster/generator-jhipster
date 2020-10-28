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
const fs = require('fs');
const path = require('path');

const { createProgram, moreInfo } = require('./program');
const { CLI_NAME, logger, toString, getCommand, done } = require('./utils');
const EnvironmentBuilder = require('./environment-builder');
const SUB_GENERATORS = require('./commands');
const { packageNameToNamespace } = require('../generators/utils');

const JHIPSTER_NS = CLI_NAME;

const envBuilder = EnvironmentBuilder.createDefaultBuilder();
const env = envBuilder.getEnvironment();

const program = createProgram();
/* setup debugging */
logger.init(program);

/**
 *  Run a yeoman command
 */
const runYoCommand = (cmd, args, options, opts) => {
    logger.debug(`cmd: ${toString(cmd)}`);
    logger.debug(`args: ${toString(args)}`);
    logger.debug(`opts: ${toString(opts)}`);
    // Let the generator parse arguments by name. Revert to simple 'command arg1 arg2 ...'.
    const command = getCommand(cmd, args, opts);
    logger.info(chalk.yellow(`Executing ${command}`));
    logger.debug(chalk.yellow(`Options: ${toString(options)}`));
    try {
        env.run(command, options).then(done, done);
    } catch (e) {
        logger.error(e.message, e);
    }
};

const rejectExtraArgs = (cmd, extraArgs) => {
    // if extraArgs exists: Unknown commands or unknown argument.
    const first = extraArgs[0];
    if (cmd !== 'app') {
        return Promise.reject(
            new Error(
                `${chalk.yellow(cmd)} command doesn't take ${chalk.yellow(first)} argument. See '${chalk.white(
                    `${CLI_NAME} ${cmd} --help`
                )}'.`
            )
        );
    }
    const availableCommands = program.commands.map(c => c._name);

    const suggestion = didYouMean(first, availableCommands);
    if (suggestion) {
        logger.info(`Did you mean ${chalk.yellow(suggestion)}?`);
    }

    return Promise.reject(new Error(`${chalk.yellow(first)} is not a known command. See '${chalk.white(`${CLI_NAME} --help`)}'.`));
};
const allCommands = { ...SUB_GENERATORS, ...envBuilder.getBlueprintCommands() };

/* create commands */
Object.entries(allCommands).forEach(([key, opts]) => {
    const command = program
        .command(key, '', { isDefault: key === 'app' })
        .description(opts.desc + (opts.blueprint ? chalk.yellow(` (blueprint: ${opts.blueprint})`) : ''))
        .addCommandArguments(opts.argument)
        .addCommandOptions(opts.options)
        .addHelpText('after', opts.help)
        .addAlias(opts.alias)
        .lazyBuildCommand(() => {
            if (!opts.cliOnly || key === 'jdl') {
                if (opts.blueprint) {
                    // Blueprint only command.
                    const generator = env.create(`${packageNameToNamespace(opts.blueprint)}:${key}`, { options: { help: true } });
                    command.addGeneratorArguments(generator._arguments).addGeneratorOptions(generator._options);
                } else {
                    const generatorName = key === 'jdl' ? 'app' : key;
                    // Register jhipster upstream options.
                    if (key !== 'jdl') {
                        const generator = env.create(`${JHIPSTER_NS}:${key}`, { options: { help: true } });
                        command.addGeneratorArguments(generator._arguments).addGeneratorOptions(generator._options);

                        const usagePath = path.resolve(generator.sourceRoot(), '../USAGE');
                        if (fs.existsSync(usagePath)) {
                            command.addHelpText('after', `\n${fs.readFileSync(usagePath, 'utf8')}`);
                        }
                    }
                    if (key === 'jdl' || program.opts().fromJdl) {
                        const generator = env.create(`${JHIPSTER_NS}:app`, { options: { help: true } });
                        command.addGeneratorOptions(generator._options, chalk.gray(' (application)'));
                    }

                    // Register blueprint specific options.
                    envBuilder.getBlueprintsNamespaces().forEach(blueprintNamespace => {
                        const generatorNamespace = `${blueprintNamespace}:${generatorName}`;
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
                }
            }
            command.addHelpText('after', moreInfo);
        })
        .action((...everything) => {
            // [args, opts, extraArgs]
            const cmdOptions = everything.pop();
            if (Array.isArray(cmdOptions)) {
                return rejectExtraArgs(key, cmdOptions);
            }
            const args = everything;
            const options = {
                ...program.opts(),
                ...cmdOptions,
            };

            if (opts.cliOnly) {
                logger.debug('Executing CLI only script');
                /* eslint-disable-next-line global-require, import/no-dynamic-require */
                return require(`./${key}`)(args, options, env);
            }
            const namespace = opts.blueprint ? `${packageNameToNamespace(opts.blueprint)}:${key}` : `${JHIPSTER_NS}:${key}`;
            return runYoCommand(namespace, args, options, opts);
        });
});

module.exports = program.parseAsync(process.argv).catch(error => logger.fatal(error.message));

process.on('unhandledRejection', up => {
    throw up;
});

