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
import type { ITokenConfig } from 'chevrotain';

export type JDLTokenConfig = Pick<ITokenConfig, 'name' | 'pattern'>;

export type JDLValidatorOptionType = 'BOOLEAN' | 'INTEGER' | 'list' | 'NAME' | 'qualifiedName' | 'STRING' | 'quotedList';

export type JDLValidatorOption = {
  type: JDLValidatorOptionType;
  pattern?: RegExp;
  msg?: string;
};

export type JDLApplicationOptionValue = string | number | boolean | undefined | never[] | Record<string, string>;
export type JDLApplicationOptionTypeValue = 'string' | 'integer' | 'boolean' | 'list' | 'quotedList';
export type JDLApplicationOptionType = { type: JDLApplicationOptionTypeValue };

export type JDLApplicationConfig = {
  tokenConfigs: JDLTokenConfig[];
  validatorConfig: Record<string, JDLValidatorOption>;
  optionsValues: Record<string, JDLApplicationOptionValue>;
  optionsTypes: Record<string, JDLApplicationOptionType>;
  quotedOptionNames: string[];
};

export type JHipsterOptionDefinition = {
  name: string;
  type: JDLApplicationOptionTypeValue;
  tokenType: JDLValidatorOptionType;
  tokenValuePattern?: RegExp;
  knownChoices?: string[];
};
