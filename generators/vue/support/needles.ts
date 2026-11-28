/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import type { ClientAdminRoute, ClientMenuItem } from '../../client/types.d.ts';
import { addNamedImports } from '../../javascript-simple-application/support/imports.ts';
import { addListItem } from '../../javascript-simple-application/support/list-items.ts';

/** Adds an icon to the named imports of @fortawesome/free-solid-svg-icons, and to the icons of the library before its add-icon-to-library needle. */
export const addIconImport = ({ icon }: { icon: string }) => {
  const iconImport = `fa${upperFirstCamelCase(icon)}`;
  return joinCallbacks(
    addNamedImports({ module: '@fortawesome/free-solid-svg-icons', names: [iconImport] }),
    addListItem({ needle: 'add-icon-to-library', item: iconImport }),
  );
};

/** Adds a dropdown item before the needle of a menu of the navbar. */
const addItemToMenu = ({
  needle,
  enableTranslation,
  route,
  translationKey,
  name = '',
  icon = 'asterisk',
}: ClientMenuItem & { needle: string; enableTranslation?: boolean }) =>
  createNeedleCallback({
    needle,
    contentToAdd: `<b-dropdown-item to="/${route}" active-class="active">
  <font-awesome-icon icon="${icon}" />
  <span>${enableTranslation ? `{{ t$('${translationKey}') }}` : name}</span>
</b-dropdown-item>`,
    contentToCheck: `<b-dropdown-item to="/${route}"`,
  });

/** Adds a dropdown item before the add-element-to-account-menu needle of the navbar. */
export const addItemToAccountMenu = (item: ClientMenuItem & { enableTranslation?: boolean }) =>
  addItemToMenu({ needle: 'add-element-to-account-menu', ...item });

/** Adds a dropdown item before the add-element-to-admin-menu needle of the navbar. */
export const addItemToAdminMenu = (item: ClientMenuItem & { enableTranslation?: boolean }) =>
  addItemToMenu({ needle: 'add-element-to-admin-menu', ...item });

/** Adds a route to the administration routes, at /admin/route, its component loaded lazily from modulePath. */
export const addAdminRoute = ({ route, modulePath, moduleName }: ClientAdminRoute) =>
  createNeedleCallback({
    needle: 'add-admin-route',
    contentToAdd: `{
  path: '/admin/${route}',
  name: '${moduleName ?? upperFirstCamelCase(route)}',
  component: () => import('${modulePath}'),
  meta: { authorities: [Authority.ADMIN] },
},`,
    contentToCheck: `path: '/admin/${route}',`,
  });
