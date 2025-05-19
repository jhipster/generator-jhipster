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
import { defaults } from 'lodash-es';
import type { MemFsEditor } from 'mem-fs-editor';
import { create } from 'mem-fs-editor';
import type { BaseApplicationSource } from '../../lib/types/application/application.js';

export default class SharedData {
  _storage: any;
  _editor: MemFsEditor;
  _log: any;
  _logCwd: string;

  constructor(storage: any, { memFs, log, logCwd }) {
    if (!storage) {
      throw new Error('Storage is required for SharedData');
    }

    this._editor = create(memFs);
    this._log = log;
    this._logCwd = logCwd;

    // Backward compatibility sharedData
    this._storage = storage;

    defaults(this._storage, {
      sharedSource: {},
      props: {},
    });
  }

  getSource(): BaseApplicationSource {
    return this._storage.sharedSource;
  }
}
