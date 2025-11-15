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

import {
  type JHipsterArgumentsWithChoices,
  type JHipsterCommandOptions,
  type JHipsterConfigs,
  convertConfigToOption,
} from '../lib/command/index.ts';

import type { CliCommandOptions } from './types.ts';

export default class JHipsterCommand extends Command {
  configs = {};
  blueprintConfigs = {};
  generatorNamespaces: string[] = [];
  _lazyBuildCommandCallBack?: (this: JHipsterCommand, args?: string | string[]) => Promise<void>;
  private _excessArgumentsCallback?: (this: JHipsterCommand, receivedArgs: string[]) => void;

  createCommand(name?: string): JHipsterCommand {
    return new JHipsterCommand(name);
  }

  /**
   * Alternative for alias() accepting chaining with undefined value.
   */
  addAlias(alias: string): this {
    if (alias) {
      this.alias(alias);
    }
    return this;
  }

  /**
   * Register a callback to be executed before _parseCommand.
   * Used to lazy load options.
   * @param {} lazyBuildCommandCallBack
   * @return {JHipsterCommand} this;
   */
  lazyBuildCommand(lazyBuildCommandCallBack: (this: JHipsterCommand, args?: string | string[]) => Promise<void>): this {
    this._lazyBuildCommandCallBack = lazyBuildCommandCallBack;
    return this;
  }

  /**
   * Register callback to customize _excessArguments behavior.
   */
  excessArgumentsCallback(excessArgumentsCallback: (this: JHipsterCommand, receivedArgs: string[]) => void): this {
    this._excessArgumentsCallback = excessArgumentsCallback;
    return this;
  }

  /**
   * @private
   * Override _excessArguments to customize behavior.
   */
  _excessArguments(receivedArgs: string[]) {
    if (this._excessArgumentsCallback) {
      this._excessArgumentsCallback(receivedArgs);
    } else {
      // @ts-expect-error override _excessArguments to customize behavior.
      super._excessArguments(receivedArgs);
    }
  }

  /**
   * @private
   * Override _parseCommand to execute a callback before parsing.
   */
  async _parseCommand(operands: string[], unknown: string[]) {
    if (this._lazyBuildCommandCallBack) {
      await this._lazyBuildCommandCallBack(operands);
    }
    // @ts-expect-error override _parseCommand to execute a callback before parsing.
    return super._parseCommand(operands, unknown);
  }

  /**
   * Override addOption to register a negative alternative for every option.
   */
  addOption(option: Option): this {
    if (!option.long || option.required || option.optional) {
      return super.addOption(option);
    }
    if (option.negate) {
      // Add an affirmative option for negative boolean options.
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
   */
  addCommandArguments(args?: string[]): this {
    if (Array.isArray(args)) {
      args.forEach(arg => this.argument(arg));
    }
    return this;
  }

  /**
   * Register options using cli/commands.js structure.
   */
  addCommandOptions(opts: CliCommandOptions[] = []): this {
    opts.forEach(opt => this._addCommandOption(opt));
    return this;
  }

  _addCommandOption(opt: CliCommandOptions) {
    const additionalDescription = opt.blueprint ? chalk.yellow(` (blueprint option: ${opt.blueprint})`) : '';
    return this.addOption(new Option(opt.option, opt.desc + additionalDescription).default(opt.default));
  }

  addJHipsterArguments(jhipsterArguments?: JHipsterArgumentsWithChoices): this {
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

  addJHipsterConfigs(configs: JHipsterConfigs = {}, blueprintOptionDescription?: string): this {
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

  _addGeneratorOption(optionName: string, optionDefinition: JHipsterCommandOptions, additionalDescription = '') {
    if (optionName === 'help') {
      return undefined;
    }
    const longOption = `--${optionName}`;
    const existingOption = (this as any)._findOption(longOption);
    if (existingOption) {
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
      defaultDescription = ` (default: ${typeof optionDefinition.default === 'function' ? optionDefinition.default() : optionDefinition.default})`;
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
