/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import assert from 'node:assert';
import { existsSync, readFileSync, statSync } from 'fs';
import { rm } from 'fs/promises';
import { isAbsolute, join, relative } from 'path';
import { lt as semverLessThan } from 'semver';
import { defaults } from 'lodash-es';
import type { MemFsEditor } from 'mem-fs-editor';
import { create } from 'mem-fs-editor';
import { type BaseApplication } from '../base-application/types.js';
import { GENERATOR_JHIPSTER } from '../generator-constants.js';
import type { CleanupArgumentType, Control } from './types.js';

export default class SharedData<ApplicationType extends BaseApplication = BaseApplication> {
  _storage: any;
  _editor: MemFsEditor;
  _log: any;
  _logCwd: string;

  constructor(storage, { memFs, destinationPath, log, logCwd }, initialControl: Partial<Control> = {}) {
    if (!storage) {
      throw new Error('Storage is required for SharedData');
    }

    this._editor = create(memFs);
    this._log = log;
    this._logCwd = logCwd;

    let jhipsterOldVersion;
    if (existsSync(join(destinationPath, '.yo-rc.json'))) {
      jhipsterOldVersion = JSON.parse(readFileSync(join(destinationPath, '.yo-rc.json'), 'utf-8').toString())[GENERATOR_JHIPSTER]
        ?.jhipsterVersion;
    }

    // Backward compatibility sharedData
    this._storage = storage;

    defaults(this._storage, {
      sharedDeployment: {},
      sharedWorkspaces: {},
      sharedEntities: {},
      sharedApplication: {},
      sharedSource: {},
      control: initialControl,
      props: {},
    });

    defaults(this._storage.sharedApplication, {
      nodeDependencies: {},
      customizeTemplatePaths: [],
    });

    let customizeRemoveFiles: ((file: string) => string | undefined)[] = [];
    const removeFiles = async (assertions: { oldVersion?: string; removedInVersion?: string } | string, ...files: string[]) => {
      if (typeof assertions === 'string') {
        files = [assertions, ...files];
        assertions = {};
      }

      for (const customize of customizeRemoveFiles) {
        files = files.map(customize).filter(file => file) as string[];
      }

      const { removedInVersion, oldVersion = jhipsterOldVersion } = assertions;
      if (removedInVersion && oldVersion && !semverLessThan(oldVersion, removedInVersion)) {
        return;
      }

      const absolutePaths = files.map(file => (isAbsolute(file) ? file : join(destinationPath, file)));
      // Delete from memory fs to keep updated.
      this._editor.delete(absolutePaths);
      await Promise.all(
        absolutePaths.map(async file => {
          const relativePath = relative(logCwd, file);
          try {
            if (statSync(file).isFile()) {
              this._log.info(`Removing legacy file ${relativePath}`);
              await rm(file, { force: true });
            }
          } catch {
            this._log.info(`Could not remove legacy file ${relativePath}`);
          }
        }),
      );
    };

    defaults(this._storage.control, {
      jhipsterOldVersion,
      removeFiles,
      customizeRemoveFiles: [],
      cleanupFiles: async (oldVersionOrCleanup: string | CleanupArgumentType, cleanup?: CleanupArgumentType) => {
        if (!jhipsterOldVersion) return;
        let oldVersion: string;
        if (typeof oldVersionOrCleanup === 'string') {
          oldVersion = oldVersionOrCleanup;
          assert(cleanup, 'cleanupFiles requires cleanup object');
        } else {
          cleanup = oldVersionOrCleanup;
          oldVersion = jhipsterOldVersion;
        }
        await Promise.all(
          Object.entries(cleanup).map(async ([version, files]) => {
            const stringFiles: string[] = [];
            for (const file of files) {
              if (Array.isArray(file)) {
                const [condition, ...fileParts] = file;
                if (condition) {
                  stringFiles.push(join(...fileParts));
                }
              } else {
                stringFiles.push(file);
              }
            }
            await removeFiles({ oldVersion, removedInVersion: version }, ...stringFiles);
          }),
        );
      },
    });

    customizeRemoveFiles = this._storage.control.customizeRemoveFiles;
  }

  getSource() {
    return this._storage.sharedSource;
  }

  getControl(): Control {
    return this._storage.control;
  }

  getApplication(): ApplicationType {
    if (!this._storage.sharedApplication) throw new Error('Shared application not loaded');
    return this._storage.sharedApplication;
  }

  setEntity(entityName: string, entity) {
    this._storage.sharedEntities[entityName] = entity;
  }

  hasEntity(entityName) {
    return Boolean(this._storage.sharedEntities[entityName]);
  }

  getEntity(entityName) {
    const entity = this._storage.sharedEntities[entityName];
    if (!entity) {
      throw new Error(`Entity definition not loaded for ${entityName}`);
    }
    return entity;
  }

  getEntities(entityNames = Object.keys(this._storage.sharedEntities)) {
    return entityNames.map(entityName => ({ entityName, entity: this.getEntity(entityName) }));
  }

  getEntitiesMap() {
    return this._storage.sharedEntities;
  }
}
