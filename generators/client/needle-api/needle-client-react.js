/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const chalk = require('chalk');
const _ = require('lodash');

const needleClientBase = require('./needle-client');
const constants = require('../../generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

module.exports = class extends needleClientBase {
    addAppSCSSStyle(style, comment) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}app/app.scss`;
        this.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-main');
    }

    addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu) {
        const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`;
        const entityMenuPath = `${CLIENT_MAIN_SRC_DIR}app/shared/layout/menus/entities.tsx`;
        const entityEntry =
            // prettier-ignore
            this.generator.stripMargin(`|<MenuItem icon="asterisk" to="/entity/${routerName}">
                        |      ${enableTranslation ? `<Translate contentKey="global.menu.entities.${entityTranslationKeyMenu}" />` : `${_.startCase(routerName)}`}
                        |    </MenuItem>`);
        const rewriteFileModel = this.generateFileModel(entityMenuPath, 'jhipster-needle-add-entity-to-menu', entityEntry);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }

    addEntityToModule(entityInstance, entityClass, entityName, entityFolderName, entityFileName) {
        const indexModulePath = `${CLIENT_MAIN_SRC_DIR}app/entities/index.tsx`;
        const indexReducerPath = `${CLIENT_MAIN_SRC_DIR}app/shared/reducers/index.ts`;

        const errorMessage = path =>
            `${chalk.yellow('Reference to ') + entityInstance + entityClass + entityFolderName + entityFileName} ${chalk.yellow(
                `not added to ${path}.\n`
            )}`;

        const indexAddRouteImportRewriteFileModel = this.generateFileModel(
            indexModulePath,
            'jhipster-needle-add-route-import',
            this.generator.stripMargin(`|import ${entityName} from './${entityFolderName}';`)
        );
        this.addBlockContentToFile(indexAddRouteImportRewriteFileModel, errorMessage(indexModulePath));

        const indexAddRoutePathRewriteFileModel = this.generateFileModel(
            indexModulePath,
            'jhipster-needle-add-route-path',
            this.generator.stripMargin(`|<ErrorBoundaryRoute path={\`\${match.url}/${entityFileName}\`} component={${entityName}} />`)
        );
        this.addBlockContentToFile(indexAddRoutePathRewriteFileModel, errorMessage(indexModulePath));

        const reducerAddImportRewriteFileModel = this.generateFileModel(
            indexReducerPath,
            'jhipster-needle-add-reducer-import', // prettier-ignore
            this.generator.stripMargin(`|// prettier-ignore
                    |import ${entityInstance}, {
                    |  ${entityName}State
                    |} from 'app/entities/${entityFolderName}/${entityFileName}.reducer';`)
        );
        this.addBlockContentToFile(reducerAddImportRewriteFileModel, errorMessage(indexReducerPath));

        const reducerAddTypeRewriteFileModel = this.generateFileModel(
            indexReducerPath,
            'jhipster-needle-add-reducer-type',
            this.generator.stripMargin(`|  readonly ${entityInstance}: ${entityName}State;`)
        );
        this.addBlockContentToFile(reducerAddTypeRewriteFileModel, errorMessage(indexReducerPath));

        const reducerAddCombineRewriteFileModel = this.generateFileModel(
            indexReducerPath,
            'jhipster-needle-add-reducer-combine',
            this.generator.stripMargin(`|  ${entityInstance},`)
        );
        this.addBlockContentToFile(reducerAddCombineRewriteFileModel, errorMessage(indexReducerPath));
    }
};
