/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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
/* eslint-disable no-console */
const program = require('commander');
const yeoman = require('yeoman-environment');
const chalk = require('chalk');
const packageJson = require('../package.json');
const logger = require('./utils').logger;
const initHelp = require('./utils').initHelp;
const initAutoCompletion = require('./completion').init;
const SUB_GENERATORS = require('./commands');

const version = packageJson.version;
const env = yeoman.createEnv();
const CLI_NAME = 'jhipster';
const JHIPSTER_NS = CLI_NAME;

/* setup debugging */
logger.init(program);

/* Register yeoman generators */
Object.keys(SUB_GENERATORS).forEach((generator) => {
    env.register(require.resolve(`../generators/${generator}`), `${JHIPSTER_NS}:${generator}`);
});

const done = () => {
    logger.info('Execution complete');
};

/**
 * Get arguments
*/
const getArgs = (opts) => {
    if (opts.argument) {
        return `[${opts.argument.join(' ')}]`;
    }
    return '';
};

/**
 * Get flags for command from an argument
*/
const getFlagsFromArg = (arg) => {
    const rawArgs = arg.parent && arg.parent.rawArgs ? arg.parent.rawArgs : [];
    return rawArgs.filter(item => item.startsWith('--'));
};

/**
 * Get options from arguments
*/
const getOptionsFromArgs = (args) => {
    const options = [];
    args.forEach((item) => {
        if (typeof item == 'string') {
            options.push(item);
        } else if (typeof item == 'object') {
            if (Array.isArray(item)) {
                options.push(...item);
            } else {
                options.push(getFlagsFromArg(item));
            }
        }
    });
    return options;
};

/**
 *  Get options for the command
 */
const getOptions = (args, opts) => {
    let options = [];
    if (opts.argument && opts.argument.length > 0) {
        logger.debug('Arguments found');
        logger.debug(getOptionsFromArgs(args).join(' '));
        options = getOptionsFromArgs(args);
    }
    if (args.length === 1) {
        logger.debug('No Arguments found looking for flags');
        options = getFlagsFromArg(args[0]);
    }
    return options.join(' ').trim();
};

/**
 *  Run a yeoman command
 */
const runYoCommand = (cmd, args, opts) => {
    const options = getOptions(args, opts);
    const command = `${JHIPSTER_NS}:${cmd}${options ? ` ${options}` : ''}`;
    logger.info(chalk.yellow(`Executing ${command}`));
    try {
        env.run(command, done);
    } catch (e) {
        logger.error(e.message);
        logger.log(e);
        process.exit(1);
    }
};

program.version(version).usage('[command] [options]').allowUnknownOption();

/* create commands */
Object.keys(SUB_GENERATORS).forEach((key) => {
    const opts = SUB_GENERATORS[key];
    const command = program.command(`${key} ${getArgs(opts)}`, '', { isDefault: opts.default });
    if (opts.alias) {
        command.alias(opts.alias);
    }
    command.allowUnknownOption()
        .description(opts.desc)
        .action((args) => {
            logger.debug('Options passed:');
            logger.debug(opts);
            runYoCommand(key, program.args, opts);
        })
        .on('--help', () => {
            logger.debug('Adding additional help info');
            env.run(`${JHIPSTER_NS}:${key} --help`, done);
        });
});

/* Generate useful help info during typos */
initHelp(program, CLI_NAME);

/* Enable autocompletion: This needs to right before parsing argv */
initAutoCompletion(program, CLI_NAME);

program.parse(process.argv);

/* Run default when no commands are specified */
if (program.args.length < 1) {
    logger.debug('No command specified. Running default');
    logger.info(chalk.yellow('Running default command'));
    runYoCommand('app', [{ parent: { rawArgs: program.rawArgs } }], {});
}
