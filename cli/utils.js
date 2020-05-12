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
/* eslint-disable no-console */
const assert = require('assert');
const chalk = require('chalk');
const meow = require('meow');
const yeoman = require('yeoman-environment');
const _ = require('lodash');
const path = require('path');

const { normalizeBlueprintName, packageNameToNamespace, loadYoRc, loadBlueprintsFromConfiguration } = require('../generators/utils');

const CLI_NAME = 'jhipster';
const GENERATOR_NAME = 'generator-jhipster';

const SUCCESS_MESSAGE = 'Congratulations, JHipster execution is complete!';

const debug = function (msg) {
    if (this.debugEnabled) {
        console.log(`${chalk.blue('DEBUG!')}  ${msg}`);
    }
};

const info = function (msg) {
    console.info(`${chalk.green.bold('INFO!')} ${msg}`);
};

const log = function (msg) {
    console.log(msg);
};

const error = function (msg, trace) {
    console.error(`${chalk.red(msg)}`);
    if (trace) {
        console.log(trace);
    }
    process.exitCode = 1;
};

/**
 *  Use with carefull.
 *  process.exit is not recommended by Node.js.
 *  Refer to https://nodejs.org/api/process.html#process_process_exit_code.
 */
const fatal = function (msg, trace) {
    console.error(`${chalk.red(msg)}`);
    if (trace) {
        console.log(trace);
    }
    process.exit(1);
};

const init = function (program) {
    program.option('-d, --debug', 'enable debugger');

    this.debugEnabled = process.argv.includes('-d') || process.argv.includes('--debug'); // Need this early

    const self = this;
    // Option event fallback.
    program.on('option:debug', function () {
        if (self.debugEnabled) {
            return;
        }
        self.debugEnabled = this.debug;
        if (self.debugEnabled) {
            info('Debug logging is on');
        }
    });
};

const logger = {
    init,
    debug,
    info,
    log,
    error,
    fatal,
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
const getOptionsFromArgs = (args = []) => {
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
    return `${cmd}${cmdArgs ? ` ${cmdArgs}` : ''}`;
};

const addKebabCase = (options = {}) => {
    const kebabCase = Object.keys(options).reduce((acc, key) => {
        acc[_.kebabCase(key)] = options[key];
        return acc;
    }, {});
    return { ...kebabCase, ...options };
};

const getCommandOptions = (pkg, argv = []) => {
    const options = meow({ help: false, pkg, argv });
    const flags = options ? options.flags : undefined;
    return addKebabCase({ fromCli: true, ...flags });
};

const doneFactory = successMsg => {
    return errorOrMsg => {
        if (errorOrMsg instanceof Error) {
            logger.error(`ERROR! ${errorOrMsg.message}`, errorOrMsg);
        } else if (errorOrMsg) {
            logger.error(`ERROR! ${errorOrMsg}`);
        } else if (successMsg) {
            logger.info(chalk.green.bold(successMsg));
        }
    };
};

const printSuccess = () => {
    if (process.exitCode === undefined || process.exitCode === 0) {
        logger.info(chalk.green.bold(SUCCESS_MESSAGE));
    } else {
        logger.error(`ERROR! JHipster finished with code ${process.exitCode}`);
    }
};

const createYeomanEnv = packagePatterns => {
    const env = yeoman.createEnv();
    // Register jhipster generators.
    const registeredGenerators = env.lookup({ packagePaths: [path.join(__dirname, '..')] });
    registeredGenerators.forEach(generator => {
        assert(
            generator.namespace.startsWith(`${CLI_NAME}:`),
            `Error on the registered namespace ${generator.namespace}, make sure your folder is called generator-jhipster.`
        );
    });
    if (packagePatterns && packagePatterns.length > 0) {
        // Lookup for blueprints.
        env.lookup({ filterPaths: true, packagePatterns });
    }
    return env;
};

const loadBlueprints = () => {
    const blueprintNames = [];
    const indexOfBlueprintArgv = process.argv.indexOf('--blueprint');
    if (indexOfBlueprintArgv > -1) {
        blueprintNames.push(process.argv[indexOfBlueprintArgv + 1]);
    }
    const indexOfBlueprintsArgv = process.argv.indexOf('--blueprints');
    if (indexOfBlueprintsArgv > -1) {
        blueprintNames.push(...process.argv[indexOfBlueprintsArgv + 1].split(','));
    }
    if (!blueprintNames.length) {
        return [];
    }
    return blueprintNames.filter((v, i, a) => a.indexOf(v) === i).map(v => normalizeBlueprintName(v));
};

const loadBlueprintsFromYoRc = () => {
    const yoRc = loadYoRc();
    if (!yoRc || !yoRc['generator-jhipster']) {
        return [];
    }
    return loadBlueprintsFromConfiguration(yoRc['generator-jhipster']);
};

/**
 * Creates a 'blueprintName: blueprintVersion' object.
 */
const loadAllBlueprintsWithVersion = () => {
    const blueprintsWithVersion = loadBlueprints().reduce((acc, blueprint) => {
        acc[blueprint] = undefined;
        return acc;
    }, {});

    loadBlueprintsFromYoRc().reduce((acc, blueprint) => {
        acc[blueprint.name] = blueprint.version;
        return acc;
    }, blueprintsWithVersion);
    return blueprintsWithVersion;
};

const getBlueprintPackagePaths = (env, blueprints) => {
    if (!blueprints) {
        return undefined;
    }

    const blueprintsToInstall = Object.entries(blueprints)
        .filter(([blueprint, _version]) => {
            const namespace = packageNameToNamespace(blueprint);
            if (!env.getPackagePath(namespace)) {
                env.lookupLocalPackages(blueprint);
            }
            return !env.getPackagePath(namespace);
        })
        .reduce((acc, [blueprint, version]) => {
            acc[blueprint] = version;
            return acc;
        }, {});

    if (Object.keys(blueprintsToInstall).length > 0) {
        env.installLocalGenerators(blueprintsToInstall);
    }

    return Object.entries(blueprints).map(([blueprint, _version]) => {
        const namespace = packageNameToNamespace(blueprint);
        const packagePath = env.getPackagePath(namespace);
        if (!packagePath) {
            logger.fatal(
                `The ${chalk.yellow(blueprint)} blueprint provided is not installed. Please install it using command ${chalk.yellow(
                    `npm i -g ${blueprint}`
                )}`
            );
        }
        return [blueprint, packagePath];
    });
};

const loadBlueprintCommands = blueprintPackagePaths => {
    if (!blueprintPackagePaths) {
        return undefined;
    }
    let result;
    blueprintPackagePaths.forEach(([blueprint, packagePath]) => {
        /* eslint-disable import/no-dynamic-require */
        /* eslint-disable global-require */
        try {
            const blueprintCommands = require(`${packagePath}/cli/commands`);
            result = { ...result, ...blueprintCommands };
        } catch (e) {
            const msg = `No custom commands found within blueprint: ${blueprint} at ${packagePath}`;
            /* eslint-disable no-console */
            console.info(`${chalk.green.bold('INFO!')} ${msg}`);
        }
    });
    return result;
};

const loadSharedOptions = blueprintPackagePaths => {
    function joiner(objValue, srcValue) {
        if (objValue === undefined) {
            return srcValue;
        }
        if (Array.isArray(objValue) && Array.isArray(srcValue)) {
            return objValue.concat(srcValue);
        }
        if (Array.isArray(objValue)) {
            return [...objValue, srcValue];
        }
        if (Array.isArray(srcValue)) {
            return [objValue, ...srcValue];
        }
        return [objValue, srcValue];
    }

    function loadSharedOptionsFromFile(sharedOptionsFile, msg, errorMsg) {
        /* eslint-disable import/no-dynamic-require */
        /* eslint-disable global-require */
        try {
            const opts = require(sharedOptionsFile);
            /* eslint-disable no-console */
            if (msg) {
                console.info(`${chalk.green.bold('INFO!')} ${msg}`);
            }
            return opts;
        } catch (e) {
            if (errorMsg) {
                console.info(`${chalk.green.bold('INFO!')} ${errorMsg}`);
            }
        }
        return {};
    }

    const localPath = './.jhipster/sharedOptions';
    let result = loadSharedOptionsFromFile(path.resolve(localPath), `SharedOptions found at local config ${localPath}`);

    if (!blueprintPackagePaths) {
        return undefined;
    }

    blueprintPackagePaths.forEach(([blueprint, packagePath]) => {
        const errorMsg = `No custom sharedOptions found within blueprint: ${blueprint} at ${packagePath}`;
        const opts = loadSharedOptionsFromFile(`${packagePath}/cli/sharedOptions`, undefined, errorMsg);
        result = _.mergeWith(result, opts, joiner);
    });
    return result;
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
    addKebabCase,
    doneFactory,
    done: doneFactory(SUCCESS_MESSAGE),
    printSuccess,
    createYeomanEnv,
    loadBlueprints,
    loadBlueprintsFromYoRc,
    loadAllBlueprintsWithVersion,
    getBlueprintPackagePaths,
    loadBlueprintCommands,
    loadSharedOptions,
    getOptionAsArgs,
};
