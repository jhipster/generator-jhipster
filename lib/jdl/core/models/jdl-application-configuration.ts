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

import ApplicationOptions from '../../../jhipster/application-options.ts';
import type JDLApplicationConfigurationOption from './jdl-application-configuration-option.js';

const { OptionNames } = ApplicationOptions;

export default class JDLApplicationConfiguration {
  options: Record<string, JDLApplicationConfigurationOption<any>>;
  namespace?: string;

  constructor(namespace?: string) {
    this.options = {};
    this.namespace = namespace;
  }

  hasOption(optionName: string): boolean {
    if (!optionName) {
      return false;
    }
    return optionName in this.options;
  }

  getOption(optionName: string): JDLApplicationConfigurationOption<any> | undefined {
    if (!optionName) {
      throw new Error('An option name has to be passed to get the option.');
    }
    if (!(optionName in this.options)) {
      return undefined;
    }
    return this.options[optionName];
  }

  setOption(option: JDLApplicationConfigurationOption<any>): void {
    if (!option) {
      throw new Error('An option has to be passed to set an option.');
    }
    this.options[option.name] = option;
  }

  forEachOption(passedFunction: (option: JDLApplicationConfigurationOption<any>) => void): void {
    if (!passedFunction) {
      return;
    }
    Object.values(this.options).forEach(option => {
      passedFunction(option);
    });
  }

  toString(indent = 0): string {
    const spaceBeforeConfigKeyword = ' '.repeat(indent);
    const namespace = this.namespace ? `:${this.namespace}` : '';
    if (Object.keys(this.options).length === 0) {
      return `${spaceBeforeConfigKeyword}config${namespace} {}`;
    }
    const spaceBeforeOption = ' '.repeat(2 * indent);
    const config = getFormattedConfigOptionsString(this.options, spaceBeforeOption);
    return `${spaceBeforeConfigKeyword}config${namespace} {
${config}
${spaceBeforeConfigKeyword}}`;
  }
}

function getFormattedConfigOptionsString(options: Record<string, JDLApplicationConfigurationOption<any>>, indent: string): string {
  const filteredOptions = filterOutUnwantedOptions(options);
  return Object.keys(filteredOptions)
    .sort()
    .map(optionName => {
      const option = options[optionName];
      return `${indent}${option}`;
    })
    .join('\n');
}

function filterOutUnwantedOptions(
  options: Record<string, JDLApplicationConfigurationOption<any>>,
): Record<string, JDLApplicationConfigurationOption<any>> {
  return filterOutOptionsThatShouldNotBeExported(filterOutOptionsWithoutValues(options));
}

function filterOutOptionsWithoutValues(
  options: Record<string, JDLApplicationConfigurationOption<any>>,
): Record<string, JDLApplicationConfigurationOption<any>> {
  const filteredOptions = { ...options };
  if (!(OptionNames.ENTITY_SUFFIX in options) || !options[OptionNames.ENTITY_SUFFIX].getValue()) {
    delete filteredOptions[OptionNames.ENTITY_SUFFIX];
  }
  if (!(OptionNames.DTO_SUFFIX in options) || !options[OptionNames.DTO_SUFFIX].getValue()) {
    delete filteredOptions[OptionNames.DTO_SUFFIX];
  }
  if (!(OptionNames.CLIENT_THEME_VARIANT in options) || !options[OptionNames.CLIENT_THEME_VARIANT].getValue()) {
    delete filteredOptions[OptionNames.CLIENT_THEME_VARIANT];
  }
  return filteredOptions;
}

function filterOutOptionsThatShouldNotBeExported(
  options: Record<string, JDLApplicationConfigurationOption<any>>,
): Record<string, JDLApplicationConfigurationOption<any>> {
  const filteredOptions = { ...options };
  delete filteredOptions[OptionNames.PACKAGE_FOLDER];
  return filteredOptions;
}
