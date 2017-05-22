/* eslint-disable no-console */
const chalk = require('chalk');
const didYouMean = require('didyoumean');

const debug = function (msg) {
    if (this.debugEnabled) {
        console.log(`${chalk.blue('DEBUG')}:  ${msg}`);
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

module.exports = {
    logger,
    initHelp
};
