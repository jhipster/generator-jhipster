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

/**
 * @private
 * Add a new entity in the "entities" menu.
 *
 * @param {string} routerName - The name of the Angular router (which by default is the name of the entity).
 * @param {boolean} enableTranslation - If translations are enabled or not
 * @param {string} entityTranslationKeyMenu - i18n key for entity entry in menu
 * @param {string} entityTranslationValue - i18n value for entity entry in menu
 */
const addEntityMenuEntry = (context, routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue) => {
  context.needleApi.clientReact.addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue);
};

export default addEntityMenuEntry;
