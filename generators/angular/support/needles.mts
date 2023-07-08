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
import type { Entity } from '../../base-application/index.mjs';
import type { BaseApplication, CommonClientServerApplication } from '../../base-application/types.mjs';
import { createNeedleCallback } from '../../base/support/needles.mjs';
import { joinCallbacks } from '../../base/support/write-files.mjs';

export function addRoute({
  needle,
  route,
  pageTitle,
  modulePath,
  moduleName,
}: {
  needle: string;
  route: string;
  modulePath: string;
  pageTitle?: string;
  moduleName?: string;
}) {
  const routePath = `path: '${route}',`;
  // prettier-ignore
  const contentToAdd = `
    {
      ${routePath}${pageTitle ? `
      data: { pageTitle: '${pageTitle}' },` : ''}
      loadChildren: () => import('${modulePath}')${moduleName ? `.then(m => m.${moduleName})` : ''},
    },`;
  return createNeedleCallback({
    needle,
    contentToAdd,
    contentToCheck: routePath,
  });
}

export function addEntitiesRoute({ application, entities }: { application: CommonClientServerApplication; entities: Entity[] }) {
  const { enableTranslation } = application;
  return joinCallbacks(
    ...entities.map(entity => {
      const { i18nKeyPrefix, entityClassPlural, entityFolderName, entityFileName, entityUrl } = entity;

      const pageTitle = enableTranslation ? `${i18nKeyPrefix}.home.title` : entityClassPlural;
      const modulePath = `./${entityFolderName}/${entityFileName}.routes`;

      return addRoute({
        needle: 'jhipster-needle-add-entity-route',
        route: entityUrl,
        modulePath,
        pageTitle,
      });
    })
  );
}

export function addToEntitiesMenu({ application, entities }: { application: BaseApplication; entities: Entity[] }) {
  const { enableTranslation, jhiPrefix } = application;
  return joinCallbacks(
    ...entities.map(entity => {
      const { entityPage, entityTranslationKeyMenu, entityClassHumanized } = entity;
      const routerLink = `routerLink="/${entityPage}"`;

      // prettier-ignore
      const contentToAdd =`
        <li>
          <a class="dropdown-item" ${routerLink} routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="collapseNavbar()">
            <fa-icon icon="asterisk" [fixedWidth]="true"></fa-icon>
            <span${enableTranslation ? ` ${jhiPrefix}Translate="global.menu.entities.${entityTranslationKeyMenu}"` : ''}>${entityClassHumanized}</span>
          </a>
        </li>`;

      return createNeedleCallback({
        needle: 'jhipster-needle-add-entity-to-menu',
        contentToAdd,
        contentToCheck: routerLink,
      });
    })
  );
}
