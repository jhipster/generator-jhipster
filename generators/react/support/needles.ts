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
import { addNamedImports } from '../../client/support/imports.ts';
import { addListItem } from '../../client/support/needles.ts';
import type { ClientAdminRoute, ClientMenuItem } from '../../client/types.d.ts';

/** Adds an icon to the named imports of @fortawesome/free-solid-svg-icons, and to the icons of the library before its add-icon-import needle. */
export const addIconImport = ({ icon }: { icon: string }) => {
  const iconImport = `fa${upperFirstCamelCase(icon)}`;
  return joinCallbacks(
    addNamedImports({ module: '@fortawesome/free-solid-svg-icons', names: [iconImport] }),
    addListItem({ needle: 'add-icon-import', item: iconImport }),
  );
};

/** Adds a MenuItem before the needle of a menu. */
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
    contentToAdd: `<MenuItem icon="${icon}" to="/${route}">
  ${enableTranslation ? `<Translate contentKey="${translationKey}">${name}</Translate>` : name}
</MenuItem>`,
    contentToCheck: `to="/${route}"`,
  });

/** Adds a MenuItem before the add-element-to-account-menu needle of the account menu. */
export const addItemToAccountMenu = (item: ClientMenuItem & { enableTranslation?: boolean }) =>
  addItemToMenu({ needle: 'add-element-to-account-menu', ...item });

/** Adds a MenuItem before the add-element-to-admin-menu needle of the administration menu. */
export const addItemToAdminMenu = (item: ClientMenuItem & { enableTranslation?: boolean }) =>
  addItemToMenu({ needle: 'add-element-to-admin-menu', ...item });

/**
 * Adds a route to the administration routes: the component, the default export of modulePath or its moduleName export,
 * and its Route at route.
 */
export const addAdminRoute = ({ route, modulePath, moduleName }: ClientAdminRoute) => {
  const componentName = moduleName ?? upperFirstCamelCase(route);
  return joinCallbacks(
    createNeedleCallback({
      needle: 'add-route-import',
      contentToAdd: moduleName ? `import { ${moduleName} } from '${modulePath}';` : `import ${componentName} from '${modulePath}';`,
      contentToCheck: `from '${modulePath}';`,
    }),
    createNeedleCallback({
      needle: 'add-route-path',
      contentToAdd: `<Route path="${route}" element={<${componentName} />} />`,
      contentToCheck: `<Route path="${route}"`,
    }),
  );
};
