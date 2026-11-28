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

import { addNamedImports } from './imports.ts';

import { defaultHelpers as helpers } from '#testing';

describe('javascript-simple-application - support - addNamedImports', () => {
  let gen: Awaited<ReturnType<typeof helpers.instantiateDummyBaseCoreGenerator>>;
  const run = (content: string, module: string, names: string[]) => addNamedImports({ module, names }).call(gen, content, 'file.ts');

  before(async () => {
    gen = await helpers.instantiateDummyBaseCoreGenerator();
  });

  it('adds the names to the braces of the import of the module, sorted', () => {
    const content = `import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faAsterisk } from '@fortawesome/free-solid-svg-icons';

library.add(faAsterisk, faUser);
`;
    expect(run(content, '@fortawesome/free-solid-svg-icons', ['faCircleInfo']))
      .toBe(`import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faAsterisk,
  faCircleInfo,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

library.add(faAsterisk, faUser);
`);
  });

  it('keeps a file that imports the names already', () => {
    const content = "import {\n  faAsterisk,\n  faUser,\n} from '@fortawesome/free-solid-svg-icons';\n";
    expect(run(content, '@fortawesome/free-solid-svg-icons', ['faUser'])).toBe(content);
  });

  it('sorts the type imports by their name and keeps the quotes of the import', () => {
    expect(run('import { type Foo, Zed } from "lib";\n', 'lib', ['Bar'])).toBe('import {\n  Bar,\n  type Foo,\n  Zed,\n} from "lib";\n');
  });

  it('leaves out the comments between the braces', () => {
    expect(run("import {\n  faUser,\n  // a needle\n} from 'icons';\n", 'icons', ['faAsterisk'])).toBe(
      "import {\n  faAsterisk,\n  faUser,\n} from 'icons';\n",
    );
  });

  it('adds an import after the last import of a module sorted before it', () => {
    const content = `import { faAsterisk } from '@fortawesome/free-solid-svg-icons/faAsterisk';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
`;
    expect(run(content, '@fortawesome/free-solid-svg-icons/faCircleInfo', ['faCircleInfo']))
      .toBe(`import { faAsterisk } from '@fortawesome/free-solid-svg-icons/faAsterisk';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
`);
  });

  it('adds an import before the first one when every module sorts after it', () => {
    expect(run("// header\nimport { b } from 'b';\n", 'a', ['a'])).toBe("// header\nimport { a } from 'a';\nimport { b } from 'b';\n");
  });

  it('adds an import to a file without imports', () => {
    expect(run('const a = 1;\n', 'a', ['a'])).toBe("import { a } from 'a';\nconst a = 1;\n");
  });
});
