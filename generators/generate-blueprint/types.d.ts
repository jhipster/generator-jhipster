import type { ExportGeneratorOptionsFromCommand } from '../../lib/command/index.js';
import type { BaseSimpleApplication, BaseSimpleConfig, BaseSimpleOptions } from '../base-simple-application/index.js';
import type { JavascriptBootstrapOptions } from '../javascript/generators/bootstrap/types.js';

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
export type BlueprintConfig = BaseSimpleConfig & {
  sampleWritten?: boolean;
  githubRepository?: string;
  cli?: boolean;
  cliName?: string;
  blueprintMjsExtension: string;
  generators: Record<string, any>;
  js: boolean;
  caret: boolean;
  dynamic: boolean;
  localBlueprint: boolean;
  subGenerators: string[];
  additionalSubGenerators: string;
};

export type BlueprintApplication = BlueprintConfig & { commands: string[]; blueprintsPath?: string; js?: boolean } & BaseSimpleApplication;

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type BlueprintOptions = ExportGeneratorOptionsFromCommand<typeof import('./command.js').default> &
  BaseSimpleOptions &
  JavascriptBootstrapOptions & {
    skipGit: boolean;
    existed: boolean;
    defaults: boolean;
  };
