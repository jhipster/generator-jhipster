/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

/* Constants use throughout */
const INTERPOLATE_REGEX = /<%:([\s\S]+?)%>/g;
const SERVER_MAIN_RES_DIR = 'src/main/resources/';

const addEntityFiles = {
  dbChangelog: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/changelog/added_entity.xml',
          options: { interpolate: INTERPOLATE_REGEX },
          renameTo: generator => `config/liquibase/changelog/${generator.changelogDate}_added_entity_${generator.entity.entityClass}.xml`,
        },
      ],
    },
    {
      condition: generator =>
        generator.entity.fieldsContainOwnerManyToMany ||
        generator.entity.fieldsContainOwnerOneToOne ||
        generator.entity.fieldsContainManyToOne,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/changelog/added_entity_constraints.xml',
          options: { interpolate: INTERPOLATE_REGEX },
          renameTo: generator =>
            `config/liquibase/changelog/${generator.changelogDate}_added_entity_constraints_${generator.entity.entityClass}.xml`,
        },
      ],
    },
  ],
};

const updateEntityFiles = {
  dbChangelog: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/changelog/updated_entity.xml',
          options: { interpolate: INTERPOLATE_REGEX },
          renameTo: generator =>
            `config/liquibase/changelog/${generator.databaseChangelog.changelogDate}_updated_entity_${generator.entity.entityClass}.xml`,
        },
      ],
    },
  ],
};

const updateConstraintsFiles = {
  dbChangelog: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/changelog/updated_entity_constraints.xml',
          options: { interpolate: INTERPOLATE_REGEX },
          renameTo: generator =>
            `config/liquibase/changelog/${generator.databaseChangelog.changelogDate}_updated_entity_constraints_${generator.entity.entityClass}.xml`,
        },
      ],
    },
  ],
};

const updateMigrateFiles = {
  dbChangelog: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/changelog/updated_entity_migrate.xml',
          options: { interpolate: INTERPOLATE_REGEX },
          renameTo: generator =>
            `config/liquibase/changelog/${generator.databaseChangelog.changelogDate}_updated_entity_migrate_${generator.entity.entityClass}.xml`,
        },
      ],
    },
  ],
};

const fakeFiles = {
  fakeData: [
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/fake-data/table_entity.csv',
          options: {
            interpolate: INTERPOLATE_REGEX,
          },
          renameTo: generator => {
            if (!generator.jhipsterConfig.incrementalChangelog) {
              return `config/liquibase/fake-data/${generator.entity.entityTableName}.csv`;
            }

            return `config/liquibase/fake-data/${generator.databaseChangelog.changelogDate}_entity_${generator.entity.entityTableName}.csv`;
          },
        },
      ],
    },
    {
      condition: generator => generator.entity.fieldsContainImageBlob === true || generator.entity.fieldsContainBlob === true,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/liquibase/fake-data/blob/hipster.png',
          method: 'copy',
          noEjs: true,
        },
      ],
    },
    {
      condition: generator => generator.entity.fieldsContainTextBlob === true,
      path: SERVER_MAIN_RES_DIR,
      templates: [{ file: 'config/liquibase/fake-data/blob/hipster.txt', method: 'copy' }],
    },
  ],
};

module.exports = {
  addEntityFiles,
  updateEntityFiles,
  updateConstraintsFiles,
  updateMigrateFiles,
  fakeFiles,
};
