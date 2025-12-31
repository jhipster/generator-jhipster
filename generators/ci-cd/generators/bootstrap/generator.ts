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
import { parse as parseYaml } from 'yaml';

import BaseSimpleApplicationGenerator from '../../../base-simple-application/index.ts';
import type { Application as CiCdApplication } from '../../types.ts';

export default class BootstrapGenerator extends BaseSimpleApplicationGenerator<CiCdApplication> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('base-simple-application');
    }
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadDependabotVersions({ application }) {
        const dependabotConfig = parseYaml(this.readJHipsterResource('dependabot/action.yml')!);
        application.githubActions = Object.fromEntries(
          dependabotConfig.runs.steps
            .map(({ uses }: { uses: string }) => uses.split('@'))
            .map(([name, version]: [string, string]) => [name, `${name}@${this.useVersionPlaceholders ? 'VERSION' : version}`]),
        ) as typeof application.githubActions;
      },
    });
  }

  get [BaseSimpleApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }
}
