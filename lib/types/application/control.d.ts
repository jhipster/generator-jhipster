import type { CleanupArgumentType } from '../../../generators/base-core/types.js';
import type { BaseControl } from '../../../generators/base/types.js';
import type { Entity } from './entity.js';

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
export type TemporaryControlToMoveToDownstream = BaseControl & {
  supportedLanguages: any;

  isJhipsterVersionLessThan: (gen: string) => boolean;
  existingProject: boolean;
  ignoreNeedlesError: boolean;
  useVersionPlaceholders?: boolean;
  reproducibleLiquibaseTimestamp?: Date;
  filterEntitiesForClient?: (entity: Entity[]) => Entity[];
  filterEntitiesAndPropertiesForClient?: (entity: Entity[]) => Entity[];
  filterEntityPropertiesForClient?: (entity: Entity) => Entity;
  /**
   * Cleanup files conditionally based on version and condition.
   * @example
   * cleanupFiles({ '6.0.0': ['file1', 'file2', [application.shouldRemove, 'file3']] })
   * @example
   * cleanupFiles('4.0.0', { '6.0.0': ['file1', 'file2', [application.shouldRemove, 'file3']] })
   */
  cleanupFiles: (cleanup: CleanupArgumentType) => Promise<void> | ((oldVersion: string, cleanup: CleanupArgumentType) => Promise<void>);
};
