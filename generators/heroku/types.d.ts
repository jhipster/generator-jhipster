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
import type { HandleCommandTypes } from '../../lib/command/types.js';
import type {
  Application as BaseApplicationApplication,
  Config as BaseApplicationConfig,
  Entity as BaseApplicationEntity,
  Options as BaseApplicationOptions,
  Source as BaseApplicationSource,
} from '../base-application/types.js';
import type command from './command.ts';

type Command = HandleCommandTypes<typeof command>;

type HerokuOptions = {
  skipBuild: boolean;
  skipDeploy: boolean;
  herokuAppName?: string;
  herokuDeployType?: 'git' | 'jar';
  herokuJavaVersion?: string;
};

export type Config = Command['Config'] & BaseApplicationConfig & HerokuOptions;

export type Options = Command['Options'] & BaseApplicationOptions & HerokuOptions;

export { BaseApplicationSource as Source, BaseApplicationEntity as Entity };

export type Application<E extends BaseApplicationEntity = BaseApplicationEntity> = Command['Application'] & BaseApplicationApplication<E>;
