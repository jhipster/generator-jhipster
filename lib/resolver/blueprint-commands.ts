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
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { cloneDeep } from 'lodash-es';

import type { CliCommand } from '../../cli/types.ts';

/** A blueprint package: its name and the path of its folder. */
export type BlueprintPackagePath = [packageName: string, packagePath: string | undefined];

export type LoadBlueprintCommandsOptions = {
  /** Logs a blueprint without commands, or with commands that cannot be loaded. Silent by default. */
  log?: (message: string) => void;
};

/**
 * Load the commands the blueprints add to the cli: the default export of the `cli/commands` module of each blueprint,
 * each command marked with the `blueprint` providing it. A later blueprint overrides a command of a previous one.
 */
export const loadBlueprintCommands = async (
  blueprintPackagePaths: BlueprintPackagePath[] | undefined,
  { log }: LoadBlueprintCommandsOptions = {},
): Promise<Record<string, CliCommand> | undefined> => {
  if (!blueprintPackagePaths?.length) {
    return undefined;
  }
  let result: Record<string, CliCommand> = {};
  for (const [blueprint, packagePath] of blueprintPackagePaths) {
    const blueprintCommandFile = `${packagePath}/cli/commands`;
    const blueprintCommandExtension = ['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts'].find(extension =>
      existsSync(`${blueprintCommandFile}${extension}`),
    );
    if (blueprintCommandExtension) {
      const blueprintCommandsUrl = pathToFileURL(resolve(`${blueprintCommandFile}${blueprintCommandExtension}`));
      try {
        const blueprintCommands: Record<string, CliCommand> = cloneDeep((await import(blueprintCommandsUrl.href)).default);
        Object.entries(blueprintCommands).forEach(([_command, commandSpec]) => {
          commandSpec.blueprint ??= blueprint;
        });
        result = { ...result, ...blueprintCommands };
      } catch {
        log?.(`Error parsing custom commands found within blueprint: ${blueprint} at ${blueprintCommandsUrl}`);
      }
    } else {
      log?.(`No custom commands found within blueprint: ${blueprint} at ${packagePath}`);
    }
  }
  return result;
};
