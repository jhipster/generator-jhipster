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
const constants = require('../generator-constants');
const { replaceAngularTranslations } = require('../client/transform-angular.cjs');
const { addEnumerationFiles } = require('./files');

/* Constants use throughout */
const { CLIENT_TEST_SRC_DIR, ANGULAR_DIR } = constants;

const angularFiles = {
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

/**
 * @this {import('./index.js')}
 * @returns
 */
async function writeAngularFiles() {
  const { entity, application } = this;
  if (!application.clientFrameworkAngular) return;
  if (entity.skipClient) return;

  await addEnumerationFiles.call(this, { application, entity }, ANGULAR_DIR);

  await this.writeFiles({
    sections: angularFiles,
    rootTemplatesPath: 'angular',
    transform: !application.enableTranslation ? [replaceAngularTranslations] : undefined,
    context: { ...application, ...entity },
  });

  if (!entity.embedded) {
    const { clientFramework, enableTranslation } = application;
    const {
      entityInstance,
      entityClass,
      entityAngularName,
      entityFolderName,
      entityFileName,
      entityUrl,
      microserviceName,
      readOnly,
      entityClassPlural,
      i18nKeyPrefix,
      pageTitle = enableTranslation ? `${i18nKeyPrefix}.home.title` : entityClassPlural,
    } = entity;

    this.addEntityToModule(
      entityInstance,
      entityClass,
      entityAngularName,
      entityFolderName,
      entityFileName,
      entityUrl,
      clientFramework,
      microserviceName,
      readOnly,
      pageTitle
    );
    this.addEntityToMenu(
      entity.entityPage,
      application.enableTranslation,
      application.clientFramework,
      entity.entityTranslationKeyMenu,
      entity.entityClassHumanized,
      application.jhiPrefix
    );
  }
}

function cleanupAngular() {
  const { entity, application } = this;
  const { entityFolderName, entityFileName } = entity;
  if (!application.clientFrameworkAngular) return;

  if (this.isJhipsterVersionLessThan('7.0.0-beta.0')) {
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}.route.ts`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}.component.ts`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}.component.html`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}-detail.component.ts`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}-detail.component.html`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}-delete-dialog.component.ts`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}-delete-dialog.component.html`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}-update.component.ts`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}-update.component.html`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/shared/model/${this.entityModelFileName}.model.ts`);
    entity.fields.forEach(field => {
      if (field.fieldIsEnum === true) {
        const { enumFileName } = field;
        this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/shared/model/enumerations/${enumFileName}.model.ts`);
      }
    });
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}-routing-resolve.service.ts`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}-routing.module.ts`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}.service.ts`);
    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${entityFolderName}/${entityFileName}.service.spec.ts`);
    this.removeFile(`${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${entityFolderName}/${entityFileName}.component.spec.ts`);
    this.removeFile(`${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${entityFolderName}/${entityFileName}-detail.component.spec.ts`);
    this.removeFile(`${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${entityFolderName}/${entityFileName}-delete-dialog.component.spec.ts`);
    this.removeFile(`${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${entityFolderName}/${entityFileName}-update.component.spec.ts`);
    this.removeFile(`${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${entityFolderName}/${entityFileName}.service.spec.ts`);
  }
}

module.exports = {
  angularFiles,
  writeAngularFiles,
  cleanupAngular,
};
