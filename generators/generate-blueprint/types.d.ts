/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import type { HandleCommandTypes } from '../../lib/command/types.ts';
import type {
  Application as BaseSimpleApplicationApplication,
  Config as BaseSimpleApplicationConfig,
  Options as BaseSimpleApplicationOptions,
} from '../base-simple-application/types.d.ts';
import type { Options as GitOptions } from '../git/types.d.ts';

import type command from './command.ts';

export type { Features } from '../base-simple-application/types.d.ts';

type Command = HandleCommandTypes<typeof command>;

export type Application = Command['Application'] &
  BaseSimpleApplicationApplication & {
    blueprintMjsExtension: string;
    commands: string[];
    blueprintsPath: string;
  };

export type Config = Command['Config'] & BaseSimpleApplicationConfig;

export type Options = Command['Options'] & BaseSimpleApplicationOptions & GitOptions;

export type TemplateData = Application & {
  skipWorkflows: boolean;
  ignoreExistingGenerators: boolean;
  application: Application;
  generator: string;
  customGenerator: boolean;
  jhipsterGenerator: string;
  generatorClass: string;
  priorities: {
    name: string;
    asTaskGroup: string;
    constant: string;
  }[];
};
