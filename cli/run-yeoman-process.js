const chalk = require('chalk');

const packageJson = require('../package.json');
const {
    logger, createYeomanEnv, toString, getCommandOptions, done
} = require('./utils');

const env = createYeomanEnv();

const command = process.argv[2];
const options = getCommandOptions(packageJson, process.argv.slice(3));
logger.info(chalk.yellow(`Executing ${command} on ${process.cwd()}`));
logger.info(chalk.yellow(`Options: ${toString(options)}`));
try {
    env.run(command, options, done);
} catch (e) {
    logger.error(e.message, e);
}
