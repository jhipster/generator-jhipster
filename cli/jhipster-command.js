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

    /**
     * Register a callback to be executed before _parseCommand.
     * Used to lazy load options.
     * @param {Function} prepareOptionsCallBack
     * @return {JHipsterCommand} this;
     */
    prepareOptions(prepareOptionsCallBack) {
        this._prepareOptionsCallBack = prepareOptionsCallBack;
        return this;
    }

    _parseCommand(operands, unknown) {
        if (this._prepareOptionsCallBack) {
            this._prepareOptionsCallBack();
        }
        return super._parseCommand(operands, unknown);
    }

    /**
     * Override addOption to register a negative alternative for every option.
     * @param {Option} option
     * @return {JHipsterCommand} this;
     */
    addOption(option) {
        const result = super.addOption(option);
        // Add a hidden negate option for boolean options
        if (option.long && !option.required && !option.optional) {
            if (option.negate) {
                option.default(undefined);
                super.addOption(new Option(option.long.replace(/^--no-/, '--')).hideHelp());
            } else {
                super.addOption(new Option(option.long.replace(/^--/, '--no-')).hideHelp());
            }
        }
        return result;
    }

    /**
     * Register options using cli/commands.js structure.
     * @param {object[]} prepareOptionsCallBack
     * @return {JHipsterCommand} this;
     */
    addCommandOptions(opts = []) {
        opts.forEach(opt => this._addCommandOption(opt));
        return this;
    }

    _addCommandOption(opt) {
        const additionalDescription = opt.blueprint ? chalk.yellow(` (blueprint option: ${opt.blueprint})`) : '';
        return this.addOption(new Option(opt.option, opt.desc + additionalDescription).default(opt.default));
    }

    /**
     * Register arguments using generator._arguments structure.
     * @param {object[]} generatorArgs
     * @return {JHipsterCommand} this;
     */
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

    /**
     * Register options using generator._options structure.
     * @param {object} options
     * @param {string} blueprintOptionDescription - description of the blueprint that adds the option
     * @return {JHipsterCommand} this;
     */
    addGeneratorOptions(options = {}, blueprintOptionDescription) {
        Object.entries(options).forEach(([key, value]) => {
            if (this._findOption(key)) {
                return;
            }
            this._addGeneratorOption(key, value, blueprintOptionDescription);
        });
        return this;
    }

    _addGeneratorOption(optionName, optionDefinition, additionalDescription = '') {
        if (optionName === 'help') {
            return undefined;
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
