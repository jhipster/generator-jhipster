/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import _ from 'lodash';
import { checkStringInFile } from '../../utils.mjs';
import needleClientBase from './needle-client.mjs';

export default class extends needleClientBase {
  addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue = _.startCase(routerName)) {
    const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`;
    const filePath = `${this.clientSrcDir}/app/entities/entities-menu.vue`;

    const isSpecificEntityAlreadyGenerated = checkStringInFile(filePath, `<b-dropdown-item to="/${routerName}">`, this.generator);
    if (isSpecificEntityAlreadyGenerated) {
      return;
    }

    const menuI18nTitle = enableTranslation ? ` v-text="$t('global.menu.entities.${entityTranslationKeyMenu}')"` : '';
    const entityEntry =
      // prettier-ignore
      this.generator.stripMargin(
                `|<b-dropdown-item to="/${routerName}">
|            <font-awesome-icon icon="asterisk" />
|            <span${menuI18nTitle}>${entityTranslationValue}</span>
|          </b-dropdown-item>`);

    const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-add-entity-to-menu', entityEntry);
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addEntityToRouterImport(entityName, fileName, folderName, readOnly) {
    const errorMessage = `${chalk.yellow('Reference to entity ') + entityName} ${chalk.yellow('not added to router entities import.\n')}`;
    const filePath = `${this.clientSrcDir}/app/router/entities.ts`;

    const isSpecificEntityAlreadyGenerated = checkStringInFile(
      filePath,
      `import('@/entities/${folderName}/${fileName}.vue');`,
      this.generator
    );
    if (isSpecificEntityAlreadyGenerated) {
      return;
    }

    let entityEntry;
    if (!readOnly) {
      // prettier-ignore
      entityEntry = this.generator.stripMargin(
                `|// prettier-ignore
                |const ${entityName} = () => import('@/entities/${folderName}/${fileName}.vue');
                |// prettier-ignore
                |const ${entityName}Update = () => import('@/entities/${folderName}/${fileName}-update.vue');
                |// prettier-ignore
                |const ${entityName}Details = () => import('@/entities/${folderName}/${fileName}-details.vue');`
            );
    } else {
      // prettier-ignore
      entityEntry = this.generator.stripMargin(
                `|// prettier-ignore
                |const ${entityName} = () => import('@/entities/${folderName}/${fileName}.vue');
                |// prettier-ignore
                |const ${entityName}Details = () => import('@/entities/${folderName}/${fileName}-details.vue');`
            );
    }

    const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-add-entity-to-router-import', entityEntry);
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addEntityToRouter(entityInstance, entityName, entityFileName, readOnly) {
    const errorMessage = `${chalk.yellow('Reference to entity ') + entityName} ${chalk.yellow('not added to router entities.\n')}`;
    const filePath = `${this.clientSrcDir}/app/router/entities.ts`;

    const isSpecificEntityAlreadyGenerated = checkStringInFile(filePath, `path: '${entityFileName}'`, this.generator);
    if (isSpecificEntityAlreadyGenerated) {
      return;
    }

    let entityEntry;
    if (!readOnly) {
      // prettier-ignore
      entityEntry = this.generator.stripMargin(
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
      entityEntry = this.generator.stripMargin(
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

    const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-add-entity-to-router', entityEntry);
    rewriteFileModel.prettierAware = true;
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addEntityServiceToMainImport(entityName, entityClass, entityFileName, entityFolderName) {
    const errorMessage = `${chalk.yellow('Reference to entity ') + entityClass} ${chalk.yellow('not added to import in main.\n')}`;
    const filePath = `${this.clientSrcDir}/app/main.ts`;

    // prettier-ignore
    const entityEntry = this.generator.stripMargin(
            `import ${entityName}Service from '@/entities/${entityFolderName}/${entityFileName}.service';`
        );

    const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-add-entity-service-to-main-import', entityEntry);
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addEntityServiceToMain(entityInstance, entityName) {
    const errorMessage = `${chalk.yellow('Reference to entity ') + entityName} ${chalk.yellow('not added to service in main.\n')}`;
    const filePath = `${this.clientSrcDir}/app/main.ts`;

    // prettier-ignore
    const entityEntry = this.generator.stripMargin(
            `${entityInstance}Service: () => new ${entityName}Service(),`
        );

    const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-add-entity-service-to-main', entityEntry);
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addEntityServiceToEntitiesComponentImport(entityName, entityClass, entityFileName, entityFolderName) {
    const errorMessage = `${chalk.yellow('Reference to entity ') + entityClass} ${chalk.yellow(
      'not added to import in entities component.\n'
    )}`;
    const filePath = `${this.clientSrcDir}/app/entities/entities.component.ts`;

    // prettier-ignore
    const entityEntry = `import ${entityName}Service from './${entityFolderName}/${entityFileName}.service';`;

    const rewriteFileModel = this.generateFileModel(
      filePath,
      'jhipster-needle-add-entity-service-to-entities-component-import',
      entityEntry
    );
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addEntityServiceToEntitiesComponent(entityInstance, entityName) {
    const errorMessage = `${chalk.yellow('Reference to entity ') + entityName} ${chalk.yellow(
      'not added to service in entities component.\n'
    )}`;
    const filePath = `${this.clientSrcDir}/app/entities/entities.component.ts`;

    // prettier-ignore
    const entityEntry = `@Provide('${entityInstance}Service') private ${entityInstance}Service = () => new ${entityName}Service();`;

    const rewriteFileModel = this.generateFileModel(filePath, 'jhipster-needle-add-entity-service-to-entities-component', entityEntry);
    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }
}
