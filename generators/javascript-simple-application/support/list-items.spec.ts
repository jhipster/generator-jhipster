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

import { before, describe, expect, it } from 'expect-node';

import { addListItem } from './list-items.ts';

import { defaultHelpers as helpers } from '#testing';

describe('javascript-simple-application - support - addListItem', () => {
  const content = `import {
  faAsterisk,
  // jhipster-needle-add-icon-import
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faAsterisk,
    // jhipster-needle-add-icon-import - the icons
);`;
  let gen: Awaited<ReturnType<typeof helpers.instantiateDummyBaseCoreGenerator>>;

  before(async () => {
    gen = await helpers.instantiateDummyBaseCoreGenerator();
  });

  it('adds the item before each line of the needle, at its indentation', () => {
    expect(addListItem({ needle: 'add-icon-import', item: 'faCircleInfo' }).call(gen, content, 'file')).toBe(`import {
  faAsterisk,
  faCircleInfo,
  // jhipster-needle-add-icon-import
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faAsterisk,
    faCircleInfo,
    // jhipster-needle-add-icon-import - the icons
);`);
  });

  it('accepts the needle with its prefix', () => {
    expect(addListItem({ needle: 'jhipster-needle-add-icon-import', item: 'faCircleInfo' }).call(gen, content, 'file')).toContain(
      '    faCircleInfo,\n    // jhipster-needle-add-icon-import - the icons',
    );
  });

  it('does not add an item of the list again', () => {
    expect(addListItem({ needle: 'add-icon-import', item: 'faAsterisk' }).call(gen, content, 'file')).toBe(content);
  });

  it('adds an item another list of the file has, like the import of the icon', () => {
    const imported = `import {
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faAsterisk,
  // jhipster-needle-add-icon-to-library
);`;
    expect(addListItem({ needle: 'add-icon-to-library', item: 'faCircleInfo' }).call(gen, imported, 'file')).toContain(
      '  faAsterisk,\n  faCircleInfo,\n  // jhipster-needle-add-icon-to-library',
    );
  });

  it('adds an item another one starts with', () => {
    expect(addListItem({ needle: 'add-icon-import', item: 'faAster' }).call(gen, content, 'file')).toContain('  faAster,\n');
  });
});
