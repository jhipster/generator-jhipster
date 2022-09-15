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
const { replaceAngularTranslations } = require('../client/transform-angular.cjs');
const constants = require('../generator-constants');

/* Constants use throughout */
const { CLIENT_TEST_SRC_DIR, ANGULAR_DIR } = constants;

const angularFiles = {
  _: {
    transform: [replaceAngularTranslations],
  },
  client: [
    {
      path: ANGULAR_DIR,
      templates: [
        {
          file: 'entities/entity.model.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.model.ts`,
        },
        {
          file: 'entities/entity.test-samples.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.test-samples.ts`,
        },
      ],
    },
    {
      condition: generator => !generator.embedded,
      path: ANGULAR_DIR,
      templates: [
        {
          file: 'entities/list/entity-management.component.html',
          renameTo: generator => `entities/${generator.entityFolderName}/list/${generator.entityFileName}.component.html`,
        },
        {
          file: 'entities/detail/entity-management-detail.component.html',
          renameTo: generator => `entities/${generator.entityFolderName}/detail/${generator.entityFileName}-detail.component.html`,
        },
        {
          file: 'entities/entity-management.module.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.module.ts`,
        },
        {
          file: 'entities/route/entity-management-routing.module.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/route/${generator.entityFileName}-routing.module.ts`,
        },
        {
          file: 'entities/route/entity-management-routing-resolve.service.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/route/${generator.entityFileName}-routing-resolve.service.ts`,
        },
        {
          file: 'entities/list/entity-management.component.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/list/${generator.entityFileName}.component.ts`,
        },
        {
          file: 'entities/detail/entity-management-detail.component.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/detail/${generator.entityFileName}-detail.component.ts`,
        },
        {
          file: 'entities/service/entity.service.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/service/${generator.entityFileName}.service.ts`,
        },
      ],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      path: ANGULAR_DIR,
      templates: [
        {
          file: 'entities/update/entity-form.service.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/update/${generator.entityFileName}-form.service.ts`,
        },
        {
          file: 'entities/update/entity-form.service.spec.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/update/${generator.entityFileName}-form.service.spec.ts`,
        },
        {
          file: 'entities/update/entity-management-update.component.html',
          renameTo: generator => `entities/${generator.entityFolderName}/update/${generator.entityFileName}-update.component.html`,
        },
        {
          file: 'entities/delete/entity-management-delete-dialog.component.html',
          renameTo: generator => `entities/${generator.entityFolderName}/delete/${generator.entityFileName}-delete-dialog.component.html`,
        },
        {
          file: 'entities/update/entity-management-update.component.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/update/${generator.entityFileName}-update.component.ts`,
        },
        {
          file: 'entities/delete/entity-management-delete-dialog.component.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/delete/${generator.entityFileName}-delete-dialog.component.ts`,
        },
      ],
    },
  ],
  test: [
    {
      condition: generator => !generator.embedded,
      path: ANGULAR_DIR,
      templates: [
        {
          file: 'entities/detail/entity-management-detail.component.spec.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/detail/${generator.entityFileName}-detail.component.spec.ts`,
        },
        {
          file: 'entities/list/entity-management.component.spec.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/list/${generator.entityFileName}.component.spec.ts`,
        },
        {
          file: 'entities/route/entity-management-routing-resolve.service.spec.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/route/${generator.entityFileName}-routing-resolve.service.spec.ts`,
        },
        {
          file: 'entities/service/entity.service.spec.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/service/${generator.entityFileName}.service.spec.ts`,
        },
      ],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      path: ANGULAR_DIR,
      templates: [
        {
          file: 'entities/update/entity-management-update.component.spec.ts',
          renameTo: generator => `entities/${generator.entityFolderName}/update/${generator.entityFileName}-update.component.spec.ts`,
        },
        {
          file: 'entities/delete/entity-management-delete-dialog.component.spec.ts',
          renameTo: generator =>
            `entities/${generator.entityFolderName}/delete/${generator.entityFileName}-delete-dialog.component.spec.ts`,
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
      ],
    },
  ],
};

module.exports = {
  angularFiles,
};
