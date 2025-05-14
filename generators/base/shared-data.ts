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
import assert from 'node:assert';
import { existsSync, readFileSync, statSync } from 'fs';
import { rm } from 'fs/promises';
import { isAbsolute, join, relative } from 'path';
import { execaCommandSync } from 'execa';
import { lt as semverLessThan } from 'semver';
import { defaults } from 'lodash-es';
import type { MemFsEditor } from 'mem-fs-editor';
import { create } from 'mem-fs-editor';
import { GENERATOR_JHIPSTER } from '../generator-constants.js';
import type { ApplicationType, BaseApplicationSource } from '../../lib/types/application/application.js';
import type { Entity } from '../../lib/types/application/entity.js';
import type { Entity as BaseEntity } from '../../lib/types/base/entity.js';
import type { CleanupArgumentType, Control } from './types.js';

export default class SharedData<EntityType extends BaseEntity = Entity, Application = ApplicationType> {
  _storage: any;
  _editor: MemFsEditor;
  _log: any;
  _logCwd: string;

  constructor(storage: any, { memFs, destinationPath, log, logCwd }, initialControl: Partial<Control> = {}) {
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
      sharedEntities: {},
      sharedApplication: {},
      sharedSource: {},
      control: initialControl,
      props: {},
    });

    defaults(this._storage.sharedApplication, {
      nodeDependencies: {},
      customizeTemplatePaths: [],
      user: undefined,
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

    const control = this._storage.control;
    defaults(control, {
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

    if (!('enviromentHasDockerCompose' in control)) {
      Object.defineProperty(control, 'enviromentHasDockerCompose', {
        get: () => {
          if (control._enviromentHasDockerCompose === undefined) {
            const { exitCode } = execaCommandSync('docker compose version', { reject: false, stdio: 'pipe' });
            control._enviromentHasDockerCompose = exitCode === 0;
          }
          return control._enviromentHasDockerCompose;
        },
      });
    }

    customizeRemoveFiles = this._storage.control.customizeRemoveFiles;
  }

  getSource(): BaseApplicationSource {
    return this._storage.sharedSource;
  }

  getControl(): Control {
    return this._storage.control;
  }

  getApplication(): Application {
    if (!this._storage.sharedApplication) throw new Error('Shared application not loaded');
    return this._storage.sharedApplication;
  }

  setEntity(entityName: string, entity: { name: string } & Partial<EntityType>): void {
    this._storage.sharedEntities[entityName] = entity;
  }

  hasEntity(entityName: string): boolean {
    return Boolean(this._storage.sharedEntities[entityName]);
  }

  getEntity(entityName: string): EntityType {
    const entity = this._storage.sharedEntities[entityName];
    if (!entity) {
      throw new Error(`Entity definition not loaded for ${entityName}`);
    }
    return entity;
  }

  getEntities(entityNames = Object.keys(this._storage.sharedEntities)): { entityName: string; entity: EntityType }[] {
    return entityNames.map(entityName => ({ entityName, entity: this.getEntity(entityName) }));
  }

  getEntitiesMap(): Record<string, EntityType> {
    return this._storage.sharedEntities;
  }
}
