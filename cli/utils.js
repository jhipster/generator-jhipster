/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
/* eslint-disable no-console */
const chalk = require('chalk');
const didYouMean = require('didyoumean');
const meow = require('meow');
const yeoman = require('yeoman-environment');
const _ = require('lodash');

const SUB_GENERATORS = require('./commands');

const CLI_NAME = 'jhipster';
const GENERATOR_NAME = 'generator-jhipster';
const debug = function(msg) {
    if (this.debugEnabled) {
        console.log(`${chalk.blue('DEBUG!')}  ${msg}`);
    }
};

const info = function(msg) {
    console.info(`${chalk.green.bold('INFO!')} ${msg}`);
};

const log = function(msg) {
    console.log(msg);
};

const error = function(msg, trace) {
    console.error(`${chalk.red.bold('ERROR!')} ${chalk.red(msg)}`);
    if (trace) {
        console.log(trace);
    }
    process.exit(1);
};

const init = function(program) {
    program.option('-d, --debug', 'enable debugger');

    const argv = program.normalize(process.argv);
    this.debugEnabled = program.debug = argv.includes('-d') || argv.includes('--debug'); // Need this early

    if (this.debugEnabled) {
        info('Debug logging is on');
    }
};

const logger = {
    init,
    debug,
    info,
    log,
    error
};

const toString = item => {
    if (typeof item == 'object') {
        if (Array.isArray(item)) {
            return item.map(it => toString(it)).join(', ');
        }
        return Object.keys(item)
            .map(k => `${k}: ${typeof item[k] != 'function' && typeof item[k] != 'object' ? toString(item[k]) : 'Object'}`)
            .join(', ');
    }
    return item ? item.toString() : item;
};

const initHelp = (program, cliName) => {
    program.on('--help', () => {
        logger.debug('Adding additional help info');
        logger.info(`  For more info visit ${chalk.blue('https://www.jhipster.tech')}`);
        logger.info('');
    });

    program.on('command:*', name => {
        logger.error(`${chalk.yellow(name)} is not a known command. See '${chalk.white(`${cliName} --help`)}'.`);

        const d = didYouMean(name.toString(), program.commands, '_name');

        if (d) {
            logger.info(`Did you mean: ${chalk.yellow(d)}?`);
        }

        process.exit(1);
    });
};

/**
 * Get arguments
 */
const getArgs = opts => {
    if (opts.argument) {
        return `[${opts.argument.join(' ')}]`;
    }
    return '';
};

/**
 * Get options from arguments
 */
const getOptionsFromArgs = args => {
    const options = [];
    args.forEach(item => {
        if (typeof item == 'string') {
            options.push(item);
        } else if (typeof item == 'object') {
            if (Array.isArray(item)) {
                options.push(...item);
            }
        }
    });
    return options;
};

/* Convert option objects to command line args */
const getOptionAsArgs = (options, withEntities, force) => {
    const args = Object.entries(options).map(([key, value]) => {
        const prefix = key.length === 1 ? '-' : '--';
        if (value === true) {
            return `${prefix}${_.kebabCase(key)}`;
        }
        if (value === false) {
            return `${prefix}no-${_.kebabCase(key)}`;
        }
        return value ? `${prefix}${_.kebabCase(key)} ${value}` : '';
    });
    if (withEntities) args.push('--with-entities');
    if (force) args.push('--force');
    args.push('--from-cli');
    logger.debug(`converted options: ${args}`);
    return _.uniq(args.join(' ').split(' ')).filter(it => it !== '');
};

/**
 *  Get options for the command
 */
const getCommand = (cmd, args, opts) => {
    let options = [];
    if (opts && opts.argument && opts.argument.length > 0) {
        logger.debug('Arguments found');
        options = getOptionsFromArgs(args);
    }
    if (args && args.length === 1) {
        logger.debug('No Arguments found.');
    }
    const cmdArgs = options.join(' ').trim();
    logger.debug(`cmdArgs: ${cmdArgs}`);
    return `${CLI_NAME}:${cmd}${cmdArgs ? ` ${cmdArgs}` : ''}`;
};

const getCommandOptions = (pkg, argv) => {
    const options = meow({ help: false, pkg, argv });
    const flags = options ? options.flags : null;
    if (flags) {
        flags['from-cli'] = true;
        // Add un-camelized options too, for legacy
        Object.keys(flags).forEach(key => {
            const legacyKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
            flags[legacyKey] = flags[key];
        });
        return flags;
    }
    return { 'from-cli': true };
};

const done = () => {
    logger.info(chalk.green.bold('Congratulations, JHipster execution is complete!'));
};

const createYeomanEnv = () => {
    const env = yeoman.createEnv();
    /* Register yeoman generators */
    Object.keys(SUB_GENERATORS).forEach(generator => {
        env.register(require.resolve(`../generators/${generator}`), `${CLI_NAME}:${generator}`);
    });
    return env;
};

module.exports = {
    CLI_NAME,
    GENERATOR_NAME,
    toString,
    logger,
    initHelp,
    getArgs,
    getOptionsFromArgs,
    getCommand,
    getCommandOptions,
    done,
    createYeomanEnv,
    getOptionAsArgs
};
