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

import { describe, expect, it } from 'esmocha';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { getDefaultRuntime } from '../../../jdl-config/jdl-runtime.ts';
import { parse } from '../parsing/api.ts';
import { type JDLStatement, getStatements } from '../parsing/statements.ts';

import { printJDL } from './print-jdl.ts';

const runtime = getDefaultRuntime();
/** Prints a jdl in the layout of printJDL, the text it was written with being ignored. */
const print = (jdl: string) => printJDL(getStatements(parse(jdl, runtime, { onWarning: () => {} }))!, runtime, { format: true });

/** Jdls written as printJDL writes them, one per kind of statement. */
const testFilesDir = join(import.meta.dirname, '__test-support__');

describe('jdl - printJDL', () => {
  for (const file of readdirSync(testFilesDir).filter(file => file.endsWith('.jdl'))) {
    it(`should format ${file} into the same text`, () => {
      const jdl = readFileSync(join(testFilesDir, file)).toString();
      expect(print(jdl)).toBe(jdl);
    });
  }

  it('should write a jdl the way it prints it, keeping the order of its statements', () => {
    expect(
      print(`
/** An entity. */ entity A { name String }
paginate A with pagination
relationship OneToMany { A{b} to B, A{c} to B }
entity B
`),
    ).toBe(`/**
 * An entity.
 */
entity A {
  name String
}

paginate A with pagination

relationship OneToMany {
  A{b} to B
  A{c} to B
}

entity B
`);
  });

  it('should quote a string of digits of a string option', () => {
    // Unquoted, it would be read back as an integer, which a string option rejects.
    const jdl =
      'application {\n  config {\n    baseName a\n    jwtSecretKey "123456"\n  }\n}\n\ndeployment {\n  deploymentType docker-compose\n  directoryPath "666"\n}\n';
    expect(print(jdl)).toBe(jdl);
  });

  describe('statements parsed from a jdl', () => {
    const source = `// The shop.

/** A product. */
entity Product {
  /** Its name. */
  name String required // kept
  price BigDecimal
}

// Kinds.
enum Kind {
  ONE,
  TWO
}

entity Order
`;
    const statementsOf = (jdl: string) => getStatements(parse(jdl, runtime, { onWarning: () => {} }))!;

    it('should print the jdl as written', () => {
      expect(printJDL(statementsOf(source), runtime)).toBe(source);
    });

    it('should print a new node, keeping the text of the others and around it', () => {
      const statements = statementsOf(source);
      const { entity } = statements[0] as Extract<JDLStatement, { type: 'entity' }>;
      // A new node has no location: the field changed, rather than the one parsed.
      entity.body![1] = { ...entity.body![1], type: 'Integer' };
      expect(printJDL(statements, runtime)).toBe(source.replace('price BigDecimal', 'price Integer'));
    });

    it('should print a new field after the ones written', () => {
      const statements = statementsOf(source);
      const { entity } = statements[0] as Extract<JDLStatement, { type: 'entity' }>;
      entity.body!.push({ name: 'stock', type: 'Integer', validations: [] });
      expect(printJDL(statements, runtime)).toBe(source.replace('  price BigDecimal\n', '  price BigDecimal\n  stock Integer\n'));
    });
  });

  describe('with comments', () => {
    const source = `// The shop.
entity Product {
  // The name.
  /* Required. */
  name String required // kept
  price BigDecimal
  // No more fields.
}

entity Order

/** A note documenting nothing. */
`;
    const statementsOf = (jdl: string) => getStatements(parse(jdl, runtime, { onWarning: () => {} }))!;

    it('should keep a javadoc documenting nothing as a statement', () => {
      expect(statementsOf(source).map(statement => statement.type)).toEqual(['entity', 'entity', 'comment']);
    });

    it('should keep the comments of the nodes of a statement printed again', () => {
      const statements = statementsOf(source);
      const { entity } = statements[0] as Extract<JDLStatement, { type: 'entity' }>;
      entity.body!.push({ name: 'stock', type: 'Integer', validations: [] });
      expect(printJDL(statements, runtime)).toBe(source.replace('  // No more fields.\n', '  // No more fields.\n  stock Integer\n'));
    });

    describe('ending the line of an enum value', () => {
      const enumSource = 'enum Kind {\n  A, // first\n  B // last\n}\n';
      const enumOf = (statements: JDLStatement[]) => (statements[0] as Extract<JDLStatement, { type: 'enum' }>).enum;

      it('should write the comma before the comment, formatting the same text again', () => {
        const formatted = print(enumSource);
        expect(formatted).toBe(enumSource);
        expect(print(formatted)).toBe(formatted);
      });

      it('should write the comma before the comment when a value is added after it', () => {
        const statements = statementsOf(enumSource);
        enumOf(statements).values.push({ key: 'C' });
        expect(printJDL(statements, runtime)).toBe('enum Kind {\n  A, // first\n  B, // last\n  C\n}\n');
      });

      it('should write one comma when a value is inserted after one written with it', () => {
        const statements = statementsOf(enumSource);
        enumOf(statements).values.splice(1, 0, { key: 'X' });
        expect(printJDL(statements, runtime)).toBe('enum Kind {\n  A, // first\n  X,\n  B // last\n}\n');
      });
    });

    it('should keep the comma written before the comment of a field when a field is inserted after it', () => {
      const entitySource = 'entity A {\n  name String, // the name\n  age Integer\n}\n';
      const statements = statementsOf(entitySource);
      const { entity } = statements[0] as Extract<JDLStatement, { type: 'entity' }>;
      entity.body!.splice(1, 0, { name: 'nick', type: 'String', validations: [] });
      expect(printJDL(statements, runtime)).toBe('entity A {\n  name String, // the name\n  nick String\n  age Integer\n}\n');
    });

    it('should format the comments with the nodes', () => {
      expect(printJDL(statementsOf(source), runtime, { format: true })).toMatchInlineSnapshot(`
"// The shop.
entity Product {
  // The name.
  /* Required. */
  name String required // kept
  price BigDecimal
  // No more fields.
}
entity Order

/** A note documenting nothing. */
"
`);
    });
  });
});
