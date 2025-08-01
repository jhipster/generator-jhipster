/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import chalk from 'chalk';
import { Argument, Command, Option } from 'commander';
import { kebabCase } from 'lodash-es';
import { convertConfigToOption } from '../lib/command/index.js';

export default class JHipsterCommand extends Command {
  configs = {};
  blueprintConfigs = {};
  /** @type {string[]} */
  generatorNamespaces = [];

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
   * @param {(this: JHipsterCommand, args: string | string[]) => Promise<void>} lazyBuildCommandCallBack
   * @return {JHipsterCommand} this;
   */
  lazyBuildCommand(lazyBuildCommandCallBack) {
    this._lazyBuildCommandCallBack = lazyBuildCommandCallBack;
    return this;
  }

  /**
   * Register callback to customize _excessArguments behavior.
   * @param {(this: JHipsterCommand, receivedArgs: string[]) => void} excessArgumentsCallback
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
  async _parseCommand(operands, unknown) {
    if (this._lazyBuildCommandCallBack) {
      await this._lazyBuildCommandCallBack(operands, unknown);
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
      args.forEach(arg => this.argument(arg));
    }
    return this;
  }

  /**
   * Register options using cli/commands.js structure.
   * @param {object[]} [opts]
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
    generatorArgs.forEach(argument => {
      let argName = argument.type === Array ? `${argument.name}...` : argument.name;
      argName = argument.required ? `<${argName}>` : `[${argName}]`;
      this.argument(argName, argument.description);
    });
    return this;
  }

  /**
   * Register options using generator._options structure.
   * @param {object} options
   * @param {string} [blueprintOptionDescription] - description of the blueprint that adds the option
   * @return {JHipsterCommand} this;
   */
  addGeneratorOptions(options, blueprintOptionDescription) {
    Object.entries(options ?? {}).forEach(([key, value]) => {
      this._addGeneratorOption(key, value, blueprintOptionDescription);
    });
    return this;
  }

  addJHipsterArguments(jhipsterArguments) {
    Object.entries(jhipsterArguments ?? {}).forEach(([key, value]) => {
      let argName = value.type === Array ? `${key}...` : key;
      argName = value.required ? `<${argName}>` : `[${argName}]`;
      const argument = new Argument(argName, value.description);
      if (value.choices) {
        argument.choices(value.choices.map(choice => (typeof choice === 'string' ? choice : choice.value)));
      }
      this.addArgument(argument);
    });
    return this;
  }

  /**
   *
   * @param {import('../lib/command/types.js').JHipsterConfigs} configs
   * @param {string} [blueprintOptionDescription]
   * @returns
   */
  addJHipsterConfigs(configs = {}, blueprintOptionDescription) {
    Object.assign(blueprintOptionDescription ? this.blueprintConfigs : this.configs, configs);
    Object.entries(configs)
      .filter(([_name, config]) => config.cli)
      .forEach(([name, config]) => {
        const option = convertConfigToOption(name, config);
        if (option) {
          this._addGeneratorOption(kebabCase(option.name), option, blueprintOptionDescription);
        }
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
    if (optionDefinition.type === Array) {
      cmdString = optionDefinition.required !== false ? `${cmdString} <value...>` : `${cmdString} [value...]`;
    } else if (optionDefinition.type && optionDefinition.type !== Boolean) {
      cmdString = optionDefinition.required !== false ? `${cmdString} <value>` : `${cmdString} [value]`;
    }
    // Passing default to `commander` (`.default(optionDefinition.default)`), will set at options passed to initial generator, so it's used in entire generation process.
    // We want default value to be set on jhipster options parsing so ignore default at commander.
    let defaultDescription = '';
    if (optionDefinition.default !== undefined && (!Array.isArray(optionDefinition.default) || optionDefinition.default.length !== 0)) {
      defaultDescription = ` (default: ${optionDefinition.default})`;
    }
    const option = new Option(cmdString, optionDefinition.description + defaultDescription + additionalDescription).hideHelp(
      optionDefinition.hide ?? false,
    );
    if (optionDefinition.env) {
      option.env(optionDefinition.env);
    }
    if (optionDefinition.choices && optionDefinition.choices.length > 0) {
      option.choices(optionDefinition.choices);
    }
    if (optionDefinition.implies) {
      option.implies(optionDefinition.implies);
    }
    return this.addOption(option);
  }
}
