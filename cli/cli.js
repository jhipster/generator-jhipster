/**
 * Copyright 2013-2017 the original author or authors.
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
const SUB_GENERATORS = require('./commands');

/* Enable loggers and help https://github.com/Hypercubed/autocmdr#logger */
require('autocmdr/lib/logger')(program, { name: 'jh' });
require('autocmdr/lib/help')(program, { name: 'jh' });

const version = packageJson.version;
const env = yeoman.createEnv();
const JHIPSTER_NS = 'jhipster';

/* Register yeoman generators */
Object.keys(SUB_GENERATORS).forEach((generator) => {
    env.register(require.resolve(`../generators/${generator}`), `${JHIPSTER_NS}:${generator}`);
});

const done = () => {
    console.log('Execution complete');
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

/* Get options for the command */
const getOptions = (args, opts) => {
    let options = [];
    if (opts.argument && opts.argument.length > 0) {
        program.log.debug('Arguments found');
        program.log.debug(getOptionsFromArgs(args).join(' '));
        options = getOptionsFromArgs(args);
    }
    if (args.length === 1) {
        program.log.debug('No Arguments found looking for flags');
        options = getFlagsFromArg(args[0]);
    }
    return options.join(' ').trim();
};

/* Run a yeoman command */
const runYoCommand = (cmd, args, opts) => {
    const options = getOptions(args, opts);
    const command = `${JHIPSTER_NS}:${cmd}${options ? ` ${options}` : ''}`;
    console.log(chalk.yellow(`Executing ${command}`));
    env.run(command, done);
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
            program.log.debug('Options passed:');
            program.log.debug(opts);
            runYoCommand(key, program.args, opts);
        })
        .on('--help', () => {
            program.log.debug('Adding additional help info');
            env.run(`${JHIPSTER_NS}:${key} --help`, done);
        });
});

program.on('--help', () => {
    program.log.debug('Adding additional help info');
    console.log(`  For more info visit ${chalk.blue('https://jhipster.github.io')}`);
    console.log('');
});

/* Enable autocompletion https://github.com/Hypercubed/autocmdr#completion */
require('autocmdr/lib/completion')(program, { name: 'jh' });

program.parse(process.argv);

/* Run default when no commands are specified */
if (program.args.length < 1) {
    program.log.debug('No command specified. Running default');
    console.log(chalk.yellow('Running default command'));
    runYoCommand('app', [{ parent: { rawArgs: program.rawArgs } }], {});
}
