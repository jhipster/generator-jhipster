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

/** The name of the Font Awesome definition of an icon, faCircleInfo for circle-info. */
const iconDefinitionName = (icon: string): string => `fa${upperFirstCamelCase(icon)}`;

/**
 * Adds an icon before every add-icon-import needle of a file importing the icons by name from @fortawesome/free-solid-svg-icons:
 * its named import and the list of the registered icons (Angular, React).
 */
export const addIconImport = ({ icon }: { icon: string }) => {
  const iconImport = iconDefinitionName(icon);
  return createNeedleCallback({
    needle: 'jhipster-needle-add-icon-import',
    contentToCheck: new RegExp(String.raw`\b${iconImport}\b`),
    contentToAdd: (content, { indentPrefix }) =>
      content.replace(
        /(\r?\n)(\s*)\/\/ jhipster-needle-add-icon-import/g,
        `\n${indentPrefix}${iconImport},\n${indentPrefix}// jhipster-needle-add-icon-import`,
      ),
  });
};

/**
 * Adds an icon to a file importing each icon from its own module of @fortawesome/free-solid-svg-icons (Vue): its import before
 * the add-icon-import needle, and the icon before the add-icon-to-library needle.
 */
export const addIconModuleImport = ({ icon }: { icon: string }) => {
  const iconImport = iconDefinitionName(icon);
  return joinCallbacks(
    createNeedleCallback({
      needle: 'add-icon-import',
      contentToAdd: `import { ${iconImport} } from '@fortawesome/free-solid-svg-icons/${iconImport}';`,
      contentToCheck: `/${iconImport}';`,
    }),
    createNeedleCallback({
      needle: 'add-icon-to-library',
      contentToAdd: `${iconImport},`,
      contentToCheck: new RegExp(String.raw`^\s*${iconImport},$`, 'm'),
    }),
  );
};
