/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
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
   * Alternative for alias() accepting chaining with undefined value.
   * @param {String} alias
   * @return {JHipsterCommand} this;
   */
  addAlias(alias) {
    if (alias) {
      this.alias(alias);
    }
    return this;
  }

  /**
   * Register a callback to be executed before _parseCommand.
   * Used to lazy load options.
   * @param {Function} lazyBuildCommandCallBack
   * @return {JHipsterCommand} this;
   */
  lazyBuildCommand(lazyBuildCommandCallBack) {
    this._lazyBuildCommandCallBack = lazyBuildCommandCallBack;
    return this;
  }

  /**
   * Register callback to customize _excessArguments behavior.
   * @param {Function} excessArgumentsCallback
   * @return {JHipsterCommand} this;
   */
  excessArgumentsCallback(excessArgumentsCallback) {
    this._excessArgumentsCallback = excessArgumentsCallback;
    return this;
  }

  /**
   * @private
   * Override _excessArguments to customize behavior.
   */
  _excessArguments(receivedArgs) {
    if (this._excessArgumentsCallback) {
      this._excessArgumentsCallback(receivedArgs);
    } else {
      super._excessArguments(receivedArgs);
    }
  }

  /**
   * @private
   * Override _parseCommand to execute a callback before parsing.
   */
  _parseCommand(operands, unknown) {
    if (this._lazyBuildCommandCallBack) {
      this._lazyBuildCommandCallBack(operands, unknown);
    }
    return super._parseCommand(operands, unknown);
  }

  /**
   * Override addOption to register a negative alternative for every option.
   * @param {Option} option
   * @return {JHipsterCommand} this;
   */
  addOption(option) {
    if (!option.long || option.required || option.optional) {
      return super.addOption(option);
    }
    if (option.negate) {
      // Add a affirmative option for negative boolean options.
      // Should be done before, because commander adds a non working affirmative by itself.
      super.addOption(new Option(option.long.replace(/^--no-/, '--')).hideHelp());
    }
    const result = super.addOption(option);
    if (!option.negate) {
      // Add a hidden negative option for affirmative boolean options.
      super.addOption(new Option(option.long.replace(/^--/, '--no-')).hideHelp());
    }
    return result;
  }

  /**
   * Register arguments using cli/commands.js structure.
   * @param {String[]} args
   * @return {JHipsterCommand} this;
   */
  addCommandArguments(args) {
    if (Array.isArray(args)) {
      this.arguments(`${args.join(' ')}`);
    }
    return this;
  }

  /**
   * Register options using cli/commands.js structure.
   * @param {object[]} lazyBuildCommandCallBack
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
      this._addGeneratorOption(key, value, blueprintOptionDescription);
    });
    return this;
  }

  _addGeneratorOption(optionName, optionDefinition, additionalDescription = '') {
    if (optionName === 'help') {
      return undefined;
    }
    const longOption = `--${optionName}`;
    const existingOption = this._findOption(longOption);
    if (this._findOption(longOption)) {
      return existingOption;
    }

    let cmdString = '';
    if (optionDefinition.alias) {
      cmdString = `-${optionDefinition.alias}, `;
    }
    cmdString = `${cmdString}${longOption}`;
    if (optionDefinition.type === String) {
      cmdString = optionDefinition.required !== false ? `${cmdString} <value>` : `${cmdString} [value]`;
    } else if (optionDefinition.type === Array) {
      cmdString = optionDefinition.required !== false ? `${cmdString} <value...>` : `${cmdString} [value...]`;
    }
    return this.addOption(
      new Option(cmdString, optionDefinition.description + additionalDescription)
        .default(optionDefinition.default)
        .hideHelp(optionDefinition.hide)
    );
  }

  /**
   * Override to reject errors instead of throwing and add command to error.
   * @return promise this
   */
  parseAsync(argv, parseOptions) {
    try {
      this.parse(argv, parseOptions);
    } catch (commanderError) {
      commanderError.command = this;
      return Promise.reject(commanderError);
    }
    return Promise.all(this._actionResults).then(() => this);
  }
}

module.exports = JHipsterCommand;
