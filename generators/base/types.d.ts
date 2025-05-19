import type { CoreApplication, CoreControl, CoreEntity, CoreSources } from '../base-core/types.js';
import type BaseGenerator from './generator.js';

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

export type CleanupArgumentType = Record<string, (string | [boolean, ...string[]])[]>;
export type BaseEntity = CoreEntity & {};
export type BaseApplication<Entity extends BaseEntity> = CoreApplication<Entity> & {};
export type BaseSources<Entity extends BaseEntity, DataType extends BaseApplication<Entity>> = CoreSources<
  Entity,
  DataType,
  BaseGenerator<any, Entity, DataType, any, any, any, any, any>
> & {};
<<<<<<< HEAD
export type BaseControl = CoreControl & {
  readonly existingProject: boolean;
};
=======
export type BaseControl = CoreControl & {};

export type TemporaryControlToMoveToDownstream = BaseControl &
  BaseApplicationControlProperties & {
    supportedLanguages: any;
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
    getWebappTranslation?: GetWebappTranslationCallback;
    translations: any;
  };
>>>>>>> 843e76094b (rework most of the type regressions)
