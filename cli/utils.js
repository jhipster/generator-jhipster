/* eslint-disable no-console */
const chalk = require('chalk');
const didYouMean = require('didyoumean');
const meow = require('meow');

const packageJson = require('../package.json');

const CLI_NAME = 'jhipster';
const debug = function (msg) {
    if (this.debugEnabled) {
        console.log(`${chalk.blue('DEBUG!')}  ${msg}`);
    }
};

const info = function (msg) {
    console.info(msg);
};

const log = function (msg) {
    console.log(msg);
};

const error = function (msg) {
    console.error(`${chalk.red.bold('ERROR!')} ${chalk.red(msg)}`);
};

const init = function (program) {
    program.option('-d, --debug', 'enable debugger');

    const argv = program.normalize(process.argv);
    this.debugEnabled = program.debug = argv.indexOf('-d') > -1 || argv.indexOf('--debug') > -1; // Need this early

    if (this.debugEnabled) {
        debug('Debug logging is on');
    }
};

const logger = {
    init,
    debug,
    info,
    log,
    error
};

const toString = (item) => {
    if (typeof item == 'object') {
        if (Array.isArray(item)) {
            return item.map(it => toString(it)).join(', ');
        }
        return Object.keys(item).map(k => `${k}: ${
            typeof item[k] != 'function' && typeof item[k] != 'object' ? toString(item[k]) : 'Object'
        }`).join(', ');
    }
    return item;
};

const initHelp = (program, cliName) => {
    program.on('--help', () => {
        logger.debug('Adding additional help info');
        logger.info(`  For more info visit ${chalk.blue('https://jhipster.github.io')}`);
        logger.info('');
    });

    program.on('*', (name) => {
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
const getArgs = (opts) => {
    if (opts.argument) {
        return `[${opts.argument.join(' ')}]`;
    }
    return '';
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
            }
        }
    });
    return options;
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

const getCommandOptions = () => {
    const options = meow({ help: false, pkg: packageJson, argv: process.argv.slice(2) });
    const flags = options ? options.flags : null;
    if (flags) {
        // Add un-camelized options too, for legacy
        Object.keys(flags).forEach((key) => {
            const legacyKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
            flags[legacyKey] = flags[key];
        });
        return flags;
    }
    return undefined;
};

module.exports = {
    CLI_NAME,
    toString,
    logger,
    initHelp,
    getArgs,
    getOptionsFromArgs,
    getCommand,
    getCommandOptions
};
