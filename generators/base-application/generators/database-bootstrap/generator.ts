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
import { databaseTypes } from '../../../../lib/jhipster/index.ts';
import { mutateData } from '../../../../lib/utils/index.ts';
import BaseApplicationGenerator from '../../index.ts';
import type { Application as BaseApplicationApplication, Entity as BaseApplicationEntity } from '../../types.d.ts';

import {
  databaseData,
  getDatabaseTypeData,
  hibernateSnakeCase,
  prepareFieldColumnForDatabase,
  prepareFieldForDatabase,
  prepareRelationshipForDatabase,
} from './support/index.ts';
import type { Application as DatabaseApplication, DatabaseEntity } from './types.d.ts';

/**
 * Prepares the application and its entities for the database it uses, whichever it is: the properties a generator writing
 * a backend needs of the database, and the ones a relational database adds, which a generator of another technology would
 * otherwise read from the generators of a Java backend.
 */
export default class DatabaseGenerator extends BaseApplicationGenerator<
  BaseApplicationEntity,
  BaseApplicationApplication<BaseApplicationEntity> & DatabaseApplication
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('base-application');
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      prepareDatabase({ applicationDefaults }) {
        applicationDefaults({
          jhiTablePrefix: ({ jhiPrefix }) => hibernateSnakeCase(jhiPrefix),
          // The port of a relational database depends on its vendor, the one of another database on its type.
          prodDatabasePort: (data, { undefinedMarker }) =>
            (data.databaseType === databaseTypes.SQL ?
              databaseData[data.prodDatabaseType]?.defaultPort
            : getDatabaseTypeData(data.databaseType).defaultPort) ?? undefinedMarker,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntityForDatabase({ entity }) {
        // The table of the entity, which every generator writing its database reads.
        mutateData(entity as DatabaseEntity, {
          __override__: false,
          entityTableName: ({ entityNameCapitalized }) => hibernateSnakeCase(entityNameCapitalized),
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareFieldForDatabase({ application, entity, field }) {
        // The column of every field, a transient one too, as the generator of the server has it.
        if ((application as any).databaseTypeAny) {
          prepareFieldColumnForDatabase({ application, entity: entity as any, field, log: this.log });
        }
        // A transient field is stored in no column, as the generator of the changelog has it.
        if (!field.transient) {
          prepareFieldForDatabase({ field });
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelationshipForDatabase({ application, entity, relationship }) {
        prepareRelationshipForDatabase({ application: application as any, entity: entity as any, relationship });
      },
    });
  }
}
