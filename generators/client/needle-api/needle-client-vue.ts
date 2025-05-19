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
import chalk from 'chalk';
import { startCase } from 'lodash-es';

import { stripMargin } from '../../base-core/support/index.js';
import { createNeedleCallback } from '../../base/support/needles.js';
import needleClientBase from './needle-client.js';

export default class extends needleClientBase {
  addEntityToMenu(
    routerName: string,
    enableTranslation: boolean,
    entityTranslationKeyMenu: string,
    entityTranslationValue: string = startCase(routerName),
  ) {
    const ignoreNonExisting =
      this.generator.sharedData.getControl().ignoreNeedlesError &&
      `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`;
    const filePath = `${this.clientSrcDir}/app/entities/entities-menu.vue`;

    const menuI18nTitle = enableTranslation ? ` v-text="$t('global.menu.entities.${entityTranslationKeyMenu}')"` : '';
    const entityEntry =
      // prettier-ignore
      stripMargin(
              `|<b-dropdown-item to="/${routerName}">
|            <font-awesome-icon icon="asterisk" />
|            <span${menuI18nTitle}>${entityTranslationValue}</span>
|          </b-dropdown-item>`);

    this.generator.editFile(
      filePath,
      { ignoreNonExisting },
      createNeedleCallback({
        needle: 'jhipster-needle-add-entity-to-menu',
        contentToAdd: entityEntry,
        ignoreWhitespaces: true,
        contentToCheck: `<b-dropdown-item to="/${routerName}">`,
        autoIndent: false,
      }),
    );
  }

  addEntityToRouterImport(entityName: string, fileName: string, folderName: string, readOnly?: string) {
    const ignoreNonExisting =
      this.generator.sharedData.getControl().ignoreNeedlesError &&
      `${chalk.yellow('Reference to entity ') + entityName} ${chalk.yellow('not added to router entities import.\n')}`;
    const filePath = `${this.clientSrcDir}/app/router/entities.ts`;

    let entityEntry;
    if (!readOnly) {
      // prettier-ignore
      entityEntry = stripMargin(
                `|// prettier-ignore
                |const ${entityName} = () => import('@/entities/${folderName}/${fileName}.vue');
                |// prettier-ignore
                |const ${entityName}Update = () => import('@/entities/${folderName}/${fileName}-update.vue');
                |// prettier-ignore
                |const ${entityName}Details = () => import('@/entities/${folderName}/${fileName}-details.vue');`
            );
    } else {
      // prettier-ignore
      entityEntry = stripMargin(
                `|// prettier-ignore
                |const ${entityName} = () => import('@/entities/${folderName}/${fileName}.vue');
                |// prettier-ignore
                |const ${entityName}Details = () => import('@/entities/${folderName}/${fileName}-details.vue');`
            );
    }

    this.generator.editFile(
      filePath,
      { ignoreNonExisting },
      createNeedleCallback({
        needle: 'jhipster-needle-add-entity-to-router-import',
        contentToAdd: entityEntry,
        ignoreWhitespaces: true,
        contentToCheck: `import('@/entities/${folderName}/${fileName}.vue');`,
        autoIndent: false,
      }),
    );
  }

  addEntityToRouter(entityInstance: string, entityName: string, entityFileName: string, readOnly?: boolean) {
    const ignoreNonExisting =
      this.generator.sharedData.getControl().ignoreNeedlesError &&
      `${chalk.yellow('Reference to entity ') + entityName} ${chalk.yellow('not added to router entities.\n')}`;
    const filePath = `${this.clientSrcDir}/app/router/entities.ts`;

    let entityEntry;
    if (!readOnly) {
      // prettier-ignore
      entityEntry = stripMargin(
                `|{
                |    path: '${entityFileName}',
                |    name: '${entityName}',
                |    component: ${entityName},
                |    meta: { authorities: [Authority.USER] }
                |  },
                |  {
                |    path: '${entityFileName}/new',
                |    name: '${entityName}Create',
                |    component: ${entityName}Update,
                |    meta: { authorities: [Authority.USER] }
                |  },
                |  {
                |    path: '${entityFileName}/:${entityInstance}Id/edit',
                |    name: '${entityName}Edit',
                |    component: ${entityName}Update,
                |    meta: { authorities: [Authority.USER] }
                |  },
                |  {
                |    path: '${entityFileName}/:${entityInstance}Id/view',
                |    name: '${entityName}View',
                |    component: ${entityName}Details,
                |    meta: { authorities: [Authority.USER] }
                |  },`
            );
    } else {
      // prettier-ignore
      entityEntry = stripMargin(
                `|{
                |    path: '/${entityFileName}',
                |    name: '${entityName}',
                |    component: ${entityName},
                |    meta: { authorities: [Authority.USER] }
                |  },
                |  {
                |    path: '/${entityFileName}/:${entityInstance}Id/view',
                |    name: '${entityName}View',
                |    component: ${entityName}Details,
                |    meta: { authorities: [Authority.USER] }
                |  },`
            );
    }

    this.generator.editFile(
      filePath,
      { ignoreNonExisting },
      createNeedleCallback({
        needle: 'jhipster-needle-add-entity-to-router',
        contentToAdd: entityEntry,
        ignoreWhitespaces: true,
        contentToCheck: `path: '${entityFileName}'`,
        autoIndent: false,
      }),
    );
  }

  addEntityServiceToMainImport(entityName: string, entityClass: string, entityFileName: string, entityFolderName: string) {
    const errorMessage = `${chalk.yellow('Reference to entity ') + entityClass} ${chalk.yellow('not added to import in main.\n')}`;
    const filePath = `${this.clientSrcDir}/app/main.ts`;

    // prettier-ignore
    const entityEntry = stripMargin(
            `import ${entityName}Service from '@/entities/${entityFolderName}/${entityFileName}.service';`
        );

    const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-add-entity-service-to-main-import', entityEntry);
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addEntityServiceToMain(entityInstance: string, entityName: string) {
    const errorMessage = `${chalk.yellow('Reference to entity ') + entityName} ${chalk.yellow('not added to service in main.\n')}`;
    const filePath = `${this.clientSrcDir}/app/main.ts`;

    // prettier-ignore
    const entityEntry = stripMargin(
            `${entityInstance}Service: () => new ${entityName}Service(),`
        );

    const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-add-entity-service-to-main', entityEntry);
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addEntityServiceToEntitiesComponentImport(entityName: string, entityClass: string, entityFileName: string, entityFolderName: string) {
    const errorMessage = `${chalk.yellow('Reference to entity ') + entityClass} ${chalk.yellow(
      'not added to import in entities component.\n',
    )}`;
    const filePath = `${this.clientSrcDir}/app/entities/entities.component.ts`;

    // prettier-ignore
    const entityEntry = `import ${entityName}Service from './${entityFolderName}/${entityFileName}.service';`;

    const rewriteFileModel = this.generateFileModel(
      filePath,
      'jhipster-needle-add-entity-service-to-entities-component-import',
      entityEntry,
    );
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addEntityServiceToEntitiesComponent(entityInstance: string, entityName: string) {
    const errorMessage = `${chalk.yellow('Reference to entity ') + entityName} ${chalk.yellow(
      'not added to service in entities component.\n',
    )}`;
    const filePath = `${this.clientSrcDir}/app/entities/entities.component.ts`;

    // prettier-ignore
    const entityEntry = `provide('${entityInstance}Service', () => new ${entityName}Service());`;

    const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-add-entity-service-to-entities-component', entityEntry);
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }
}
