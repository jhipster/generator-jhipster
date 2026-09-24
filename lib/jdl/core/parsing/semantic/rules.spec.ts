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

import { getDefaultJDLRelationshipConfig } from '../../../../jdl-config/jdl-relationship-config.ts';
import { createJDLRuntime, getDefaultRuntime } from '../../../../jdl-config/jdl-runtime.ts';
import { createImporterFromContent } from '../../__test-support__/index.ts';
import { parseFromContent } from '../../readers/jdl-reader.ts';
import type { JDLRuntime } from '../types/runtime.ts';

import { checkSemantics } from './index.ts';

/** The diagnostics of a jdl, with the source each one points at. */
const check = (content: string, runtime: JDLRuntime = getDefaultRuntime()) =>
  checkSemantics(parseFromContent(content, runtime), runtime).map(({ ruleId, message, location }) => ({
    ruleId,
    message,
    at: location && content.slice(location.startOffset, location.endOffset + 1),
  }));

describe('jdl - semantic rules', () => {
  describe('undeclared-relationship-entity', () => {
    it('reports an undeclared destination at the relationship', () => {
      expect(check('entity A\nrelationship OneToMany {\n  A to B\n}')).toEqual([
        {
          ruleId: 'undeclared-relationship-entity',
          message:
            "In the relationship between A and B, B is not declared. If 'B' is a built-in entity declare like 'A to B with builtInEntity'.",
          at: 'A to B',
        },
      ]);
    });
    it('reports both sides at once', () => {
      expect(check('entity A\nrelationship OneToMany { C to B }').map(diagnostic => diagnostic.message)).toEqual([
        "In the relationship between C and B, C and B are not declared. If 'B' is a built-in entity declare like 'C to B with builtInEntity'.",
      ]);
    });
    it('accepts a built-in destination', () => {
      expect(check('entity A\nrelationship ManyToOne { A to User with builtInEntity }')).toEqual([]);
    });
    it('takes the built-in entity options from the relationship definitions', () => {
      const runtime = createJDLRuntime({
        relationship: {
          configs: { ...getDefaultJDLRelationshipConfig().configs, external: { jdl: { type: 'unary', builtInEntity: true } } },
        },
      });
      expect(check('entity A\nrelationship ManyToOne { A to Account with external }', runtime)).toEqual([]);
    });
    it('still requires a declared source with a built-in destination', () => {
      expect(check('relationship ManyToOne { A to User with builtInEntity }').map(diagnostic => diagnostic.at)).toEqual([
        'A to User with builtInEntity',
      ]);
    });
  });

  describe('undeclared-application-entity', () => {
    it('reports an undeclared entity at its name in the entities statement', () => {
      expect(check('entity A\napplication {\n  config { baseName foo }\n  entities A, B\n}')).toEqual([
        {
          ruleId: 'undeclared-application-entity',
          message: "The entity B which is declared in foo's entity list doesn't exist.",
          at: 'B',
        },
      ]);
    });
    it('accepts every entity', () => {
      expect(check('entity A\napplication {\n  config { baseName foo }\n  entities *\n}')).toEqual([]);
    });
  });

  describe('entity-outside-application', () => {
    it("reports an entity of an option that is not in the application's list", () => {
      expect(check('entity A\nentity B\napplication {\n  config { baseName foo }\n  entities A\n  dto A, B with mapstruct\n}')).toEqual([
        {
          ruleId: 'entity-outside-application',
          message: "The entity B in the dto option isn't declared in foo's entity list.",
          at: 'B',
        },
      ]);
    });
    it('reports it for a unary option and for a use statement, by the option the value belongs to', () => {
      expect(
        check('entity A\nentity B\napplication {\n  config { baseName foo }\n  entities A\n  readOnly B\n  use serviceClass for B\n}').map(
          diagnostic => diagnostic.message,
        ),
      ).toEqual([
        "The entity B in the readOnly option isn't declared in foo's entity list.",
        "The entity B in the service option isn't declared in foo's entity list.",
      ]);
    });
    it('accepts every entity and an excluded one', () => {
      expect(
        check('entity A\nentity B\napplication {\n  config { baseName foo }\n  entities A\n  dto * with mapstruct except B\n}'),
      ).toEqual([]);
    });
  });

  describe('undeclared-option-entity', () => {
    it('reports an undeclared entity of an option statement at its name', () => {
      expect(check('entity A\ndto A, B with mapstruct')).toEqual([
        { ruleId: 'undeclared-option-entity', message: 'The entity B in the dto option is not declared.', at: 'B' },
      ]);
    });
    it('reports an undeclared entity of a use statement', () => {
      expect(check('entity A\nuse mapstruct for B').map(diagnostic => diagnostic.message)).toEqual([
        'The entity B in the dto option is not declared.',
      ]);
    });
    it('accepts every entity', () => {
      expect(check('entity A\ndto * with mapstruct except B')).toEqual([]);
    });
  });

  it('reports every problem, in source order', () => {
    expect(check('dto B with mapstruct\nentity A\nrelationship OneToOne { A to C }').map(diagnostic => diagnostic.ruleId)).toEqual([
      'undeclared-option-entity',
      'undeclared-relationship-entity',
    ]);
  });

  describe('when importing', () => {
    it('throws every error, each with its position', () => {
      expect(() => createImporterFromContent('dto B with mapstruct\nentity A\nrelationship OneToOne { A to C }').import()).toThrow(
        new RegExp(
          [
            String.raw`^The entity B in the dto option is not declared\.\n\tat line: 1, column: 5`,
            String.raw`In the relationship between A and C, C is not declared\. .*\n\tat line: 3, column: 25$`,
          ].join('\\n'),
        ),
      );
    });
  });
});
