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
import type { ExportApplicationPropertiesFromCommand } from '../../lib/command/types.js';
import type { Config as BaseSimpleApplicationConfig, Application as SimpleApplication } from '../base-simple-application/index.js';
import type { Application as DockerApplication } from '../docker/index.js';
import type { ApplicationClientProperties } from '../client/types.js';
import type command from './command.js';

type Config = ExportApplicationPropertiesFromCommand<typeof command> &
  BaseSimpleApplicationConfig & {
    gitLabIndent?: string;
    indent?: string;
    testFrameworks?: string[];
    cypressTests?: boolean;
    javaVersion?: string;
    ciCd: string[];
  };

export type Application = SimpleApplication &
  DockerApplication &
  Config &
  ApplicationClientProperties & {
    frontTestCommand: string;
    ciCdIntegrations: string[];
  };
