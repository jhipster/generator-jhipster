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

/**
 * @private
 * Add new entry to menu
 * @param context the generator context
 * @param routerName the client technology router name
 * @param iconName name of the menu's icon
 * @param enableTranslation whether translation is enabled
 * @param translationKeyMenu the translation key
 */
export const addMenuEntry = (context, routerName, iconName, enableTranslation, translationKeyMenu = _.camelCase(routerName)) => {
  context.needleApi.clientAngular.addElementToMenu(routerName, iconName, enableTranslation, translationKeyMenu, context.jhiPrefix);
};

/**
 * @private
 * Add a new icon to icon imports.
 *
 * @param context the generator context
 * @param {string} iconName - The name of the Font Awesome icon.
 */
export const addIconInImport = (context, iconName) => {
  context.needleApi.clientAngular.addIcon(iconName);
};

/**
 * Add a new menu element to the admin menu.
 * @param context the generator context
 * @param {string} routerName - The name of the Angular router that is added to the admin menu.
 * @param {string} iconName - The name of the Font Awesome icon that will be displayed.
 * @param {boolean} enableTranslation - If translations are enabled or not
 * @param {string} translationKeyMenu - i18n key for entry in the admin menu
 */
export const addAdminMenuEntry = (context, routerName, iconName, enableTranslation, translationKeyMenu) => {
  context.needleApi.clientAngular.addElementToAdminMenu(routerName, iconName, enableTranslation, translationKeyMenu, context.jhiPrefix);
};

/**
 * @private
 * Add a new entity in the "entities" menu.
 *
 * @param {string} routerName - The name of the Angular router (which by default is the name of the entity).
 * @param {boolean} enableTranslation - If translations are enabled or not
 * @param {string} entityTranslationKeyMenu - i18n key for entity entry in menu
 * @param {string} entityTranslationValue - i18n value for entity entry in menu
 */
export const addEntityMenuEntry = (context, routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue, jhiPrefix) => {
  context.needleApi.clientAngular.addEntityToMenu(
    routerName,
    enableTranslation,
    entityTranslationKeyMenu,
    entityTranslationValue,
    jhiPrefix
  );
};
