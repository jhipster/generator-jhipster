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

import _ from 'lodash';
import { clientFrameworkTypes } from '../../../jdl/jhipster/index.mjs';
import {
  addMenuEntry as addAngularMenuEntry,
  addIconInImport as addAngularIconInImport,
  addAdminMenuEntry as addAngularAdminMenuEntry,
} from '../../angular/support/index.mjs';

const { ANGULAR, REACT } = clientFrameworkTypes;

/**
 * @private
 * Add a new icon to icon imports.
 *
 * @param context the generator context
 * @param {string} iconName - The name of the Font Awesome icon.
 * @param {string} clientFramework - The name of the client framework
 */
export const addIconInImport = (context, iconName, clientFramework) => {
  if (clientFramework === ANGULAR) {
    addAngularIconInImport(context, iconName);
  } else if (clientFramework === REACT) {
    // React
    // TODO:
  }
};

/**
 * @private
 * Add new entry to menu
 * @param context the generator context
 * @param routerName the client technology router name
 * @param iconName name of the menu's icon
 * @param enableTranslation whether translation is enabled
 * @param clientFramework the client technology
 * @param translationKeyMenu the translation key
 */
export const addMenuEntry = (
  context,
  routerName,
  iconName,
  enableTranslation,
  clientFramework,
  translationKeyMenu = _.camelCase(routerName)
) => {
  if (clientFramework === ANGULAR) {
    addAngularMenuEntry(context, routerName, iconName, enableTranslation, translationKeyMenu);
  } else if (clientFramework === REACT) {
    // React
    // TODO:
  }
};

/**
 * @private
 * Add external resources to root file(index.html).
 *
 * @param {string} resources - Resources added to root file.
 * @param {string} comment - comment to add before resources content.
 */
export const addExternalResourcesToIndexHtml = (context, resources, comment) => {
  context.needleApi.client.addExternalResourcesToRoot(resources, comment);
};

/**
 * Add a new menu element to the admin menu.
 * @param context the generator context
 * @param {string} routerName - The name of the Angular router that is added to the admin menu.
 * @param {string} iconName - The name of the Font Awesome icon that will be displayed.
 * @param {boolean} enableTranslation - If translations are enabled or not
 * @param {string} clientFramework - The name of the client framework
 * @param {string} translationKeyMenu - i18n key for entry in the admin menu
 */
export const addAdminMenuEntry = (context, routerName, iconName, enableTranslation, clientFramework, translationKeyMenu) => {
  addAngularAdminMenuEntry(context, routerName, iconName, enableTranslation, translationKeyMenu);
};
