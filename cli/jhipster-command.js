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
const { Command, Option } = require('commander');

class JHipsterCommand extends Command {
    createCommand(name) {
        return new JHipsterCommand(name);
    }

    prepareOptions(prepareOptionsCallBack) {
        this._prepareOptionsCallBack = prepareOptionsCallBack;
    }

    _parseCommand(operands, unknown) {
        if (this._prepareOptionsCallBack) {
            this._prepareOptionsCallBack();
        }
        return super._parseCommand(operands, unknown);
    }

    addOption(option) {
        const result = super.addOption(option);
        // Add a hidden `--no` option for boolean options
        if (option.long && !option.required && !option.negate && !option.optional) {
            super.addOption(new Option(option.long.replace(/^--/, '--no-')).hideHelp());
        }
        return result;
    }

    addCommandOptions(opts = []) {
        opts.forEach(opt => this.addCommandOption(opt));
        return this;
    }

    addCommandOption(opt) {
        const additionalDescription = opt.blueprint ? chalk.yellow(` (blueprint option: ${opt.blueprint})`) : '';
        return this.addOption(new Option(opt.option, opt.desc + additionalDescription).default(opt.default));
    }

    addGeneratorArguments(generatorArgs = []) {
        if (!generatorArgs) return this;
        const args = generatorArgs
            .map(argument => {
                const argName = argument.type === Array ? `${argument.name}...` : argument.name;
                return argument.required ? `<${argName}>` : `[${argName}]`;
            })
            .join(' ');
        this.arguments(args);
        return this;
    }

    addGeneratorOptions(options = {}, blueprintOptionDescription) {
        Object.entries(options).forEach(([key, value]) => {
            if (this._findOption(key)) {
                return;
            }
            this.addGeneratorOption(key, value, blueprintOptionDescription);
        });
        return this;
    }

    addGeneratorOption(optionName, optionDefinition, additionalDescription = '') {
        if (optionName === 'help') {
            return;
        }
        let cmdString = '';
        if (optionDefinition.alias) {
            cmdString = `-${optionDefinition.alias}, `;
        }
        cmdString = `${cmdString}--${optionName}`;
        if (optionDefinition.type === String) {
            cmdString = `${cmdString} <value>`;
        } else if (optionDefinition.type === Array) {
            cmdString = `${cmdString} <value...>`;
        }
        return this.addOption(
            new Option(cmdString, optionDefinition.description + additionalDescription)
                .default(optionDefinition.default)
                .hideHelp(optionDefinition.hide)
        );
    }
}

module.exports = JHipsterCommand;
