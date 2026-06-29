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

import { join } from 'node:path';

import { merge } from 'lodash-es';

import BaseGenerator from '../../generators/base-core/index.ts';
import { getPackageRoot } from '../../lib/index.ts';
import { defaultSamplesFolder, promptSamplesFolder, samplesFolderConfig } from '../support.ts';

export default class extends BaseGenerator {
  samplePath?: string;

  get [BaseGenerator.PROMPTING]() {
    return this.asAnyTaskGroup({
      promptSamplesFolder,
    });
  }

  get [BaseGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async generateCodeWorkspace() {
        this.addSampleToCodeWorkspace(this.samplePath);
      },
    });
  }

  getCodeWorkspacePath() {
    return join(this._globalConfig.get(samplesFolderConfig) ?? defaultSamplesFolder, 'jhipster-samples.code-workspace');
  }

  /**
   * Merge value to an existing JSON and write to destination
   */
  addSampleToCodeWorkspace(samplePath?: string) {
    this.editFile(this.getCodeWorkspacePath(), { create: true }, content => {
      const data: { folders: { path: string }[]; settings: Record<string, unknown>; launch: Record<string, unknown> } =
        content ? JSON.parse(content) : {};
      merge(data, {
        folders: [
          {
            path: getPackageRoot(),
          },
        ],
        settings: {
          'debug.javascript.terminalOptions': {
            skipFiles: ['node_modules/**', 'dist/**'],
          },
        },
        launch: {
          version: '0.2.0',
          inputs: [],
          configurations: [],
        },
      });
      if (samplePath && !data.folders.some(folder => folder.path === samplePath)) {
        data.folders.push({
          path: samplePath,
        });
      }

      return JSON.stringify(data, null, 2);
    });
  }
}
