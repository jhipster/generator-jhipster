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
import { asWriteFilesSection } from '../base-application/support/task-type-inference.ts';
import type { BaseChangelog } from '../base-entity-changes/types.js';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';

import type { Application as TemplateData, Entity as LiquibaseEntity } from './types.js';

export const addEntityFiles = asWriteFilesSection<TemplateData<LiquibaseEntity> & BaseChangelog<LiquibaseEntity>>({
  dbChangelog: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/changelog/added_entity.xml',
          renameTo: generator => `config/liquibase/changelog/${generator.changelogDate}_added_entity_${generator.entity.entityClass}.xml`,
        },
      ],
    },
    {
      condition: generator => generator.entity.anyRelationshipIsOwnerSide,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/changelog/added_entity_constraints.xml',
          renameTo: generator =>
            `config/liquibase/changelog/${generator.changelogDate}_added_entity_constraints_${generator.entity.entityClass}.xml`,
        },
      ],
    },
  ],
});

export const updateEntityFiles = asWriteFilesSection<any>({
  dbChangelog: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/changelog/updated_entity.xml',
          renameTo: generator =>
            `config/liquibase/changelog/${generator.databaseChangelog.changelogDate}_updated_entity_${generator.entity.entityClass}.xml`,
        },
      ],
    },
  ],
});

export const updateConstraintsFiles = asWriteFilesSection<any>({
  dbChangelog: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/changelog/updated_entity_constraints.xml',
          renameTo: generator =>
            `config/liquibase/changelog/${generator.databaseChangelog.changelogDate}_updated_entity_constraints_${generator.entity.entityClass}.xml`,
        },
      ],
    },
  ],
});

export const updateMigrateFiles = asWriteFilesSection<any>({
  dbChangelog: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/changelog/updated_entity_migrate.xml',
          renameTo: generator =>
            `config/liquibase/changelog/${generator.databaseChangelog.changelogDate}_updated_entity_migrate_${generator.entity.entityClass}.xml`,
        },
      ],
    },
  ],
});

export const fakeFiles = asWriteFilesSection<any>({
  fakeData: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/fake-data/table_entity.csv',
          renameTo: generator => {
            if (!generator.incrementalChangelog || generator.recreateInitialChangelog) {
              return `config/liquibase/fake-data/${generator.entity.entityTableName}.csv`;
            }

            return `config/liquibase/fake-data/${generator.databaseChangelog.changelogDate}_entity_${generator.entity.entityTableName}.csv`;
          },
        },
      ],
    },
    {
      condition: generator => generator.entity.anyFieldHasImageContentType || generator.entity.anyFieldIsBlobDerived,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/fake-data/blob/hipster.png',
          transform: false,
        },
      ],
    },
    {
      condition: generator => generator.entity.anyFieldHasTextContentType,
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/liquibase/fake-data/blob/hipster.txt'],
    },
  ],
});
