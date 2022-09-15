/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const { replaceVueTranslations } = require('../client/transform-vue.cjs');
const { CLIENT_TEST_SRC_DIR, VUE_DIR } = require('../generator-constants');

const vueFiles = {
  _: {
    transform: [replaceVueTranslations],
  },
  client: [
    {
      path: VUE_DIR,
      templates: [
        {
          file: 'entities/entity.model.ts',
          // using entityModelFileName so that there is no conflict when generating microservice entities
          renameTo: generator => `shared/model/${generator.entityModelFileName}.model.ts`,
        },
      ],
    },
    {
      condition: generator => !generator.embedded,
      path: VUE_DIR,
      templates: [
        {
          file: 'entities/entity-details.vue',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-details.vue`,
        },
        {
          file: 'entities/entity-details.component.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-details.component.ts`,
        },
        {
          file: 'entities/entity.vue',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.vue`,
        },
        {
          file: 'entities/entity.component.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.component.ts`,
        },
        {
          file: 'entities/entity.service.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.service.ts`,
        },
      ],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      path: VUE_DIR,
      templates: [
        {
          file: 'entities/entity-update.vue',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-update.vue`,
        },
        {
          file: 'entities/entity-update.component.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-update.component.ts`,
        },
      ],
    },
  ],
  test: [
    {
      condition: generator => !generator.embedded,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        {
          file: 'spec/app/entities/entity.component.spec.ts',
          renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}.component.spec.ts`,
        },
        {
          file: 'spec/app/entities/entity-details.component.spec.ts',
          renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}-details.component.spec.ts`,
        },
        {
          file: 'spec/app/entities/entity.service.spec.ts',
          renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}.service.spec.ts`,
        },
      ],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        {
          file: 'spec/app/entities/entity-update.component.spec.ts',
          renameTo: generator => `spec/app/entities/${generator.entityFolderName}/${generator.entityFileName}-update.component.spec.ts`,
        },
      ],
    },
    {
      condition: generator => generator.protractorTests && !generator.embedded,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        {
          file: 'e2e/entities/entity-page-object.ts',
          renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}.page-object.ts`,
        },
        {
          file: 'e2e/entities/entity.spec.ts',
          renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}.spec.ts`,
        },
        {
          file: 'e2e/entities/entity-details-page-object.ts',
          renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}-details.page-object.ts`,
        },
      ],
    },
    {
      condition: generator => generator.protractorTests && !generator.readOnly && !generator.embedded,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        {
          file: 'e2e/entities/entity-update-page-object.ts',
          renameTo: generator => `e2e/entities/${generator.entityFolderName}/${generator.entityFileName}-update.page-object.ts`,
        },
      ],
    },
  ],
};

module.exports = {
  vueFiles,
};
