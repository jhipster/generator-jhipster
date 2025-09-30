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
import { upperFirstCamelCase } from '../../../lib/utils/index.ts';
import { createNeedleCallback } from '../../base-core/support/needles.ts';
import { joinCallbacks } from '../../base-core/support/write-files.ts';
import type { Application as ClientApplication, Entity as ClientEntity } from '../../client/types.d.ts';

export function addRoute({
  needle,
  route,
  pageTitle,
  title,
  modulePath,
  moduleName,
  component,
}: {
  needle: string;
  route: string;
  modulePath: string;
  pageTitle?: string;
  title?: string;
  moduleName?: string;
  component?: boolean;
}) {
  const routePath = `path: '${route}',`;
  // prettier-ignore
  const contentToAdd = `
    {
      ${routePath}${pageTitle ? `
      data: { pageTitle: '${pageTitle}' },` : ''}${title ? `
      title: '${title}',` : ''}
      load${component ? 'Component' : 'Children'}: () => import('${modulePath}')${moduleName ? `.then(m => m.${moduleName})` : ''},
    },`;
  return createNeedleCallback({
    needle,
    contentToAdd,
    contentToCheck: routePath,
  });
}

export function addEntitiesRoute<const E extends ClientEntity, const A extends ClientApplication<E>>({
  application,
  entities,
}: {
  application: A;
  entities: E[];
}) {
  const { enableTranslation } = application;
  return joinCallbacks(
    ...entities.map(entity => {
      const { i18nKeyPrefix, entityNamePlural, entityFolderName, entityFileName, entityUrl } = entity;

      const pageTitle = enableTranslation ? `${i18nKeyPrefix}.home.title` : entityNamePlural;
      const modulePath = `./${entityFolderName}/${entityFileName}.routes`;

      return addRoute({
        needle: 'jhipster-needle-add-entity-route',
        route: entityUrl,
        modulePath,
        pageTitle,
      });
    }),
  );
}

type MenuItem = {
  jhiPrefix: string;
  enableTranslation?: boolean;
  route: string;
  translationKey?: string;
  icon?: string;
  name?: string;
};

export function addItemToMenu({
  needle,
  enableTranslation,
  jhiPrefix,
  icon = 'asterisk',
  route,
  translationKey,
  name = '',
}: MenuItem & { needle: string }) {
  const routerLink = `routerLink="/${route}"`;
  const contentToAdd = `
        <li>
          <a class="dropdown-item" ${routerLink} routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="collapseNavbar()">
            <fa-icon icon="${icon}" [fixedWidth]="true" />
            <span${enableTranslation ? ` ${jhiPrefix}Translate="${translationKey}"` : ''}>${name}</span>
          </a>
        </li>`;

  return createNeedleCallback({
    needle,
    contentToAdd,
    contentToCheck: routerLink,
  });
}

export const addItemToAdminMenu = (menu: MenuItem) =>
  addItemToMenu({
    needle: 'add-element-to-admin-menu',
    ...menu,
  });

export const addIconImport = ({ icon }: { icon: string }) => {
  const iconImport = `fa${upperFirstCamelCase(icon)}`;
  return createNeedleCallback({
    needle: 'jhipster-needle-add-icon-import',
    contentToCheck: new RegExp(`\\b${iconImport}\\b`),
    contentToAdd: (content, { indentPrefix }) =>
      content.replace(
        /(\r?\n)(\s*)\/\/ jhipster-needle-add-icon-import/g,
        `\n${indentPrefix}${iconImport},\n${indentPrefix}// jhipster-needle-add-icon-import`,
      ),
  });
};

export function addToEntitiesMenu<const E extends ClientEntity, const A extends ClientApplication<E>>({
  application,
  entities,
}: {
  application: A;
  entities: E[];
}) {
  const { enableTranslation, jhiPrefix } = application;
  return joinCallbacks(
    ...entities.map(entity => {
      return addItemToMenu({
        needle: entity.adminEntity ? 'jhipster-needle-add-element-to-admin-menu' : 'jhipster-needle-add-entity-to-menu',
        enableTranslation,
        icon: 'asterisk',
        route: entity.entityPage!,
        translationKey: `global.menu.entities.${entity.entityTranslationKeyMenu}`,
        name: entity.entityNameHumanized,
        jhiPrefix,
      });
    }),
  );
}
