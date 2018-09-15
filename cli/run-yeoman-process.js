const chalk = require('chalk');

const packageJson = require('../package.json');
const {
    CLI_NAME, logger, createYeomanEnv, toString, getCommand, getCommandOptions, done
} = require('./utils');

const env = createYeomanEnv();

// logger.debug(`cmd: ${toString(cmd)}`);
// logger.debug(`args: ${toString(args)}`);
// logger.debug(`opts: ${toString(opts)}`);
// const command = getCommand(cmd, args, opts);
const command = `${CLI_NAME}:app`;

const options = getCommandOptions(packageJson, process.argv.slice(2));
logger.info(chalk.yellow(`Executing ${command}`));
logger.info(chalk.yellow(`Options: ${toString(options)}`));
try {
    env.run(command, options, done);
} catch (e) {
    logger.error(e.message, e);
}
