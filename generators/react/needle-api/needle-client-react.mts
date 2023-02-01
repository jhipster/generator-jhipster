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

import needleClientBase from '../../client/needle-api/needle-client.mjs';
import { stripMargin } from '../../base/support/index.mjs';

export default class extends needleClientBase {
  addAppSCSSStyle(style: string, comment: string) {
    const filePath = `${this.clientSrcDir}app/app.scss`;
    this.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-main');
  }

  addEntityToMenu(
    routerName: string,
    enableTranslation: boolean,
    entityTranslationKeyMenu: string,
    entityTranslationValue: string = _.startCase(routerName)
  ) {
    const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`;
    const entityMenuPath = `${this.clientSrcDir}app/entities/menu.tsx`;
    const entityEntry =
      // prettier-ignore
      stripMargin(`|<MenuItem icon="asterisk" to="/${routerName}">
                        |        ${enableTranslation ? `<Translate contentKey="global.menu.entities.${entityTranslationKeyMenu}" />` : `${entityTranslationValue}`}
                        |      </MenuItem>`);
    const rewriteFileModel = this.generateFileModel(entityMenuPath, 'jhipster-needle-add-entity-to-menu', entityEntry);

    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addEntityToModule(
    entityInstance: string,
    entityClass: string,
    entityName: string,
    entityFolderName: string,
    entityFileName: string,
    { applicationTypeMicroservice, clientSrcDir }: { applicationTypeMicroservice: boolean; clientSrcDir: string }
  ) {
    const indexModulePath = `${clientSrcDir}app/entities/routes.tsx`;
    const indexReducerPath = `${clientSrcDir}app/entities/reducers.ts`;

    const errorMessage = path =>
      `${chalk.yellow('Reference to ') + entityInstance + entityClass + entityFolderName + entityFileName} ${chalk.yellow(
        `not added to ${path}.\n`
      )}`;

    const indexAddRouteImportRewriteFileModel = this.generateFileModel(
      indexModulePath,
      'jhipster-needle-add-route-import',
      stripMargin(`|import ${entityName} from './${entityFolderName}';`)
    );
    this.addBlockContentToFile(indexAddRouteImportRewriteFileModel, errorMessage(indexModulePath));

    const indexAddRoutePathRewriteFileModel = this.generateFileModel(
      indexModulePath,
      'jhipster-needle-add-route-path',
      stripMargin(`|<Route path="${applicationTypeMicroservice ? '/' : ''}${entityFileName}/*" element={<${entityName} />} />`)
    );
    this.addBlockContentToFile(indexAddRoutePathRewriteFileModel, errorMessage(indexModulePath));

    const reducerAddImportRewriteFileModel = this.generateFileModel(
      indexReducerPath,
      'jhipster-needle-add-reducer-import', // prettier-ignore
      stripMargin(`import ${entityInstance} from 'app/entities/${entityFolderName}/${entityFileName}.reducer';`)
    );
    this.addBlockContentToFile(reducerAddImportRewriteFileModel, errorMessage(indexReducerPath));

    const reducerAddCombineRewriteFileModel = this.generateFileModel(
      indexReducerPath,
      'jhipster-needle-add-reducer-combine',
      stripMargin(`|  ${entityInstance},`)
    );
    this.addBlockContentToFile(reducerAddCombineRewriteFileModel, errorMessage(indexReducerPath));
  }
}
