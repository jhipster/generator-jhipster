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
const fs = require('fs');
const path = require('path');

const JHipsterCommand = require('./jhipster-command');
const packageJson = require('../package.json');
const { CLI_NAME, logger, toString, getCommand, done } = require('./utils');
const EnvironmentBuilder = require('./environment-builder');
const SUB_GENERATORS = require('./commands');
const { packageNameToNamespace } = require('../generators/utils');

const version = packageJson.version;
const JHIPSTER_NS = CLI_NAME;

const envBuilder = EnvironmentBuilder.createDefaultBuilder();
const env = envBuilder.getEnvironment();
const moreInfo = `\n  For more info visit ${chalk.blue('https://www.jhipster.tech')}\n`;

const program = new JHipsterCommand()
    .storeOptionsAsProperties(false)
    .passCommandToAction(false)
    .version(version)
    .addHelpText('after', moreInfo)
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
                    command.addHelpText('after', moreInfo);
                }
            }
        });

    command.action((...everything) => {
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
        const options = {
            ...program.opts(),
            ...cmdOptions,
        };

        if (opts.cliOnly) {
            logger.debug('Executing CLI only script');
            /* eslint-disable-next-line global-require, import/no-dynamic-require */
            require(`./${key}`)(args, options, env);
        } else {
            const namespace = opts.blueprint ? `${packageNameToNamespace(opts.blueprint)}:${key}` : `${JHIPSTER_NS}:${key}`;
            runYoCommand(namespace, args, options, opts);
        }
    });
});

program.parse(process.argv);

process.on('unhandledRejection', up => {
    throw up;
});
