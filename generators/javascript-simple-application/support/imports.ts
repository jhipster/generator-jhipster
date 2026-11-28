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
import type { EditFileCallback } from '../../base-core/api.js';

const escapeRegExp = (value: string): string => value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/** The name a named import declares, without its type modifier: `type Foo` and `Foo as Bar` sort by Foo. */
const sortName = (name: string): string => name.replace(/^type\s+/, '');

const IMPORT_STATEMENT = /^import\s[^;]*?\bfrom\s+(['"])(?<module>[^'"]+)\1;?$/gm;

/**
 * Adds named imports of a module to a file: to the braces of its import, sorted, the names already there kept once, or in a
 * new import, after the last import of a module sorted before it, when the file does not import the module.
 */
export const addNamedImports =
  ({ module, names }: { module: string; names: string[] }): EditFileCallback =>
  content => {
    const namedImport = new RegExp(
      String.raw`^import\s*\{(?<names>[^}]*)\}\s*from\s*(?<quote>['"])${escapeRegExp(module)}\k<quote>;?$`,
      'm',
    );
    const match = namedImport.exec(content);
    if (match) {
      // The comments between the braces, like a needle of an older file, are left out.
      const existing = match
        .groups!.names.replaceAll(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '')
        .split(',')
        .map(name => name.trim())
        .filter(Boolean);
      if (names.every(name => existing.includes(name))) {
        return content;
      }
      const sorted = [...new Set([...existing, ...names])].sort((a, b) => sortName(a).localeCompare(sortName(b)));
      const { quote } = match.groups!;
      return content.replace(match[0], `import {\n  ${sorted.join(',\n  ')},\n} from ${quote}${module}${quote};`);
    }

    const statement = `import { ${[...names].sort((a, b) => sortName(a).localeCompare(sortName(b))).join(', ')} } from '${module}';`;
    const imports = [...content.matchAll(IMPORT_STATEMENT)];
    const before = imports.filter(imported => imported.groups!.module.localeCompare(module) < 0).at(-1);
    if (before) {
      const end = before.index + before[0].length;
      return `${content.slice(0, end)}\n${statement}${content.slice(end)}`;
    }
    // Before the first import, or at the start of a file without imports.
    const start = imports.at(0)?.index ?? 0;
    return `${content.slice(0, start)}${statement}\n${content.slice(start)}`;
  };
