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
import { describe, esmocha, expect, it } from 'esmocha';

import { createJDLRuntime, getDefaultJDLDefinitions, getDefaultRuntime } from '../../../../jdl-config/jdl-runtime.ts';
import { createImporterFromContent } from '../../__test-support__/index.ts';
import { parseFromContent } from '../../readers/jdl-reader.ts';
import logger from '../../utils/objects/logger.ts';
import { createRuntime } from '../runtime.ts';
import type { JDLRuntime } from '../types/runtime.ts';

import { checkSemantics } from './index.ts';

/** The diagnostics of a jdl, with the source each one points at. */
const diagnose = (content: string, runtime: JDLRuntime = getDefaultRuntime()) =>
  checkSemantics(parseFromContent(content, runtime), runtime).map(({ ruleId, severity, message, location }) => ({
    ruleId,
    severity,
    message,
    at: location && content.slice(location.startOffset, location.endOffset + 1),
  }));

/** The errors and the warnings of a jdl, the suggestions left out. */
const check = (content: string, runtime?: JDLRuntime) =>
  diagnose(content, runtime)
    .filter(({ severity }) => severity !== 'info')
    .map(({ severity: _severity, ...diagnostic }) => diagnostic);

/** The suggestions about how a jdl is written. */
const suggest = (content: string) =>
  diagnose(content)
    .filter(({ severity }) => severity === 'info')
    .map(({ ruleId, message, at }) => ({ ruleId, message, at }));

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
    it('knows the built-in destination whatever the relationship definitions', () => {
      const runtime = createJDLRuntime({ relationship: { configs: { cascade: { jdl: { type: 'unary' } } } } });
      expect(check('entity A\nrelationship ManyToOne { A to User with builtInEntity }', runtime)).toEqual([]);
    });
    it('does not take a relationship option of the definitions as a built-in destination', () => {
      const runtime = createJDLRuntime({ relationship: { configs: { cascade: { jdl: { type: 'unary' } } } } });
      expect(check('entity A\nrelationship ManyToOne { A to User with cascade }', runtime).map(diagnostic => diagnostic.message)).toEqual([
        "In the relationship between A and User, User is not declared. If 'User' is a built-in entity declare like 'A to User with builtInEntity'.",
      ]);
    });
    it('still requires a declared source with a built-in destination', () => {
      expect(check('relationship ManyToOne { A to User with builtInEntity }').map(diagnostic => diagnostic.at)).toEqual([
        'A to User with builtInEntity',
      ]);
    });
    it('suggests builtInEntity only for an entity the runtime provides', () => {
      const runtime = createJDLRuntime({ builtInEntities: ['User'] });
      expect(check('entity A\nrelationship ManyToOne { A to User, A to Account }', runtime).map(diagnostic => diagnostic.message)).toEqual([
        "In the relationship between A and User, User is not declared. If 'User' is a built-in entity declare like 'A to User with builtInEntity'.",
        'In the relationship between A and Account, Account is not declared.',
      ]);
    });
  });

  describe('built-in-entity', () => {
    it('accepts any destination when the runtime lists no built-in entity, as JHipster does', () => {
      expect(check('entity A\nrelationship ManyToOne { A to Account with builtInEntity }')).toEqual([]);
    });
    it('accepts a built-in entity the runtime provides', () => {
      const runtime = createJDLRuntime({ builtInEntities: ['User', 'Authority'] });
      expect(
        check('entity A\nrelationship ManyToOne { A to User with builtInEntity, A{authority} to Authority with builtInEntity }', runtime),
      ).toEqual([]);
    });
    it('reports a destination the runtime does not provide at the option', () => {
      const runtime = createJDLRuntime({ builtInEntities: ['User', 'Authority'] });
      expect(check('entity A\nrelationship ManyToOne { A to Account with builtInEntity }', runtime)).toEqual([
        {
          ruleId: 'built-in-entity',
          message:
            'In the relationship between A and Account, Account is not a built-in entity, the built-in entities are: User, Authority.',
          at: 'builtInEntity',
        },
      ]);
    });
    it('takes the built-in entities of the runtime', () => {
      const runtime = createJDLRuntime({ builtInEntities: ['Account'] });
      expect(
        check('entity A\nrelationship ManyToOne { A to Account with builtInEntity, A{user} to User with builtInEntity }', runtime).map(
          diagnostic => diagnostic.message,
        ),
      ).toEqual(['In the relationship between A and User, User is not a built-in entity, the built-in entities are: Account.']);
    });
    it('reports every destination when the runtime provides no built-in entity', () => {
      const runtime = createJDLRuntime({ builtInEntities: [] });
      expect(
        check('entity A\nrelationship ManyToOne { A to User with builtInEntity }', runtime).map(diagnostic => diagnostic.message),
      ).toEqual(['In the relationship between A and User, User is not a built-in entity, there is no built-in entity.']);
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

  describe('duplicated-entity', () => {
    it('reports every declaration after the first one', () => {
      expect(check('entity A\nentity B\nentity A { name String }\nentity A')).toEqual([
        { ruleId: 'duplicated-entity', message: 'The entity A is declared more than once.', at: 'entity A { name String }' },
        { ruleId: 'duplicated-entity', message: 'The entity A is declared more than once.', at: 'entity A' },
      ]);
    });
  });

  describe('duplicated-application-statement', () => {
    it('reports a config, a namespace config or an entities statement declared again in an application', () => {
      expect(
        check(`application {
  config { baseName app blueprints [foo, bar] }
  config(foo) { a 1 }
  config(bar) { b 2 }
  entities A
  config { baseName other }
  config(foo) { c 3 }
  entities A
}
entity A`),
      ).toEqual([
        {
          ruleId: 'duplicated-application-statement',
          message: 'The application app declares config more than once.',
          at: 'config { baseName other }',
        },
        {
          ruleId: 'duplicated-application-statement',
          message: 'The application app declares config(foo) more than once.',
          at: 'config(foo) { c 3 }',
        },
        { ruleId: 'duplicated-application-statement', message: 'The application app declares entities more than once.', at: 'entities A' },
      ]);
    });
  });

  describe('duplicated-enum', () => {
    it('reports a second declaration', () => {
      expect(check('enum E { X }\nenum E { Y }')).toEqual([
        { ruleId: 'duplicated-enum', message: 'The enum E is declared more than once.', at: 'enum E { Y }' },
      ]);
    });
  });

  describe('duplicated-field', () => {
    it('reports a second declaration in the same entity only', () => {
      expect(check('entity A {\n  name String\n  name Integer required\n}\nentity B {\n  name String\n}')).toEqual([
        {
          ruleId: 'duplicated-field',
          message: 'The field name is declared more than once in the entity A.',
          at: 'name Integer required',
        },
      ]);
    });
  });

  describe('field-type', () => {
    it('reports a type that is neither a field type nor an enum, once', () => {
      expect(check('enum E { X }\nentity A {\n  e E\n  name Strin required\n}')).toEqual([
        {
          ruleId: 'field-type',
          message: 'The type Strin of the field name in the entity A is neither a field type nor an enum.',
          at: 'name Strin required',
        },
      ]);
    });
    it('warns about a deprecated type', () => {
      expect(
        checkSemantics(parseFromContent('entity A {\n  start Date required\n}', getDefaultRuntime()), getDefaultRuntime()).map(
          ({ severity, message }) => [severity, message],
        ),
      ).toEqual([['warning', 'The type Date of the field start in the entity A is deprecated: use Instant, which it is migrated to.']]);
    });
  });

  describe('without field types definitions', () => {
    it('accepts any field type and any validation', () => {
      const { fieldTypes: _fieldTypes, ...definitions } = getDefaultJDLDefinitions();
      const runtime = createRuntime(definitions);
      expect(check('entity A {\n  name Strin required minlength(3)\n  age Integer pattern(/a/)\n}', runtime)).toEqual([]);
    });
  });

  describe('validation-for-field-type', () => {
    it('reports a validation the type does not take, at the validation', () => {
      expect(check('entity A {\n  age Integer required minlength(3)\n}')).toEqual([
        {
          ruleId: 'validation-for-field-type',
          message: "The validation 'minlength' isn't supported for the type 'Integer'.",
          at: 'minlength(3)',
        },
      ]);
    });
    it('takes the validations of an enum field from the enum type', () => {
      expect(check('enum E { X }\nentity A {\n  e E required unique minlength(3)\n}').map(diagnostic => diagnostic.message)).toEqual([
        "The validation 'minlength' isn't supported for the type 'E'.",
      ]);
    });
    it('reports any validation of a type that takes none', () => {
      // ByteBuffer crashed the validator.
      expect(check('entity A {\n  b ByteBuffer required\n}').map(diagnostic => diagnostic.message)).toEqual([
        "The validation 'required' isn't supported for the type 'ByteBuffer'.",
      ]);
    });
    it('takes the field types from the definitions', () => {
      const runtime = createJDLRuntime({
        fieldTypes: { types: { Money: { validations: ['min'] }, String: { validations: [] } }, enum: { validations: [] } },
      });
      expect(check('entity A {\n  price Money min(0)\n  name String required\n}', runtime).map(diagnostic => diagnostic.message)).toEqual([
        "The validation 'required' isn't supported for the type 'String'.",
      ]);
    });
  });

  describe('decimal-validation-value', () => {
    it('reports a decimal given to a validation that takes an integer', () => {
      expect(check('entity A {\n  name String minlength(1.5)\n}')).toEqual([
        { ruleId: 'decimal-validation-value', message: 'Decimal values are forbidden for the minlength validation.', at: 'minlength(1.5)' },
      ]);
    });
    it('reports it through a constant', () => {
      expect(check('MINL = 1.5\nentity A {\n  name String minlength(MINL)\n}').map(diagnostic => diagnostic.at)).toEqual([
        'minlength(MINL)',
      ]);
    });
    it('accepts a decimal for a validation that takes a number', () => {
      expect(check('entity A {\n  age Float min(1.5)\n}')).toEqual([]);
    });
  });

  describe('required-reflexive-relationship', () => {
    it('reports a required relationship to the same entity, on either side', () => {
      expect(
        check('entity A\nrelationship ManyToOne {\n  A{parent required} to A\n  A{other} to A{others required}\n}').map(diagnostic => [
          diagnostic.ruleId,
          diagnostic.at,
        ]),
      ).toEqual([
        ['required-reflexive-relationship', 'A{parent required} to A'],
        ['required-reflexive-relationship', 'A{other} to A{others required}'],
      ]);
    });
    it('accepts an optional one', () => {
      expect(check('entity A\nrelationship ManyToOne { A{parent} to A }')).toEqual([]);
    });
  });

  describe('one-to-one-direction', () => {
    it('reports a One-to-One relationship whose destination only has the injected field', () => {
      expect(check('entity A\nentity B\nrelationship OneToOne { A to B{a} }')).toEqual([
        {
          ruleId: 'one-to-one-direction',
          message:
            'In the One-to-One relationship from A to B, the source entity must possess the destination, or you must invert the direction of the relationship.',
          at: 'A to B{a}',
        },
      ]);
    });
    it('accepts one without any injected field, both sides get one', () => {
      expect(check('entity A\nentity B\nrelationship OneToOne { A to B }')).toEqual([]);
    });
  });

  describe('option-value', () => {
    it('reports a value outside the choices of the option, at its first statement', () => {
      expect(check('entity A\nentity B\ndto A with foo\ndto B with foo')).toEqual([
        { ruleId: 'option-value', message: "The 'dto' option is not valid for value 'foo'.", at: 'dto A with foo' },
      ]);
    });
    it('reports it inside an application', () => {
      expect(
        check('entity A\napplication {\n  config { baseName foo }\n  entities A\n  service A with foo\n}').map(diagnostic => diagnostic.at),
      ).toEqual(['service A with foo']);
    });
    it('accepts any value for an option without choices, and no', () => {
      expect(check('entity A\nmicroservice A with anything\ndto A with no')).toEqual([]);
    });
    it('reports a use statement value that belongs to no option', () => {
      expect(check('entity A\nuse mapstruct, foo, no for A')).toEqual([
        {
          ruleId: 'option-value',
          message: "The value 'foo' of the use statement is the value of no option.",
          at: 'use mapstruct, foo, no for A',
        },
        {
          ruleId: 'option-value',
          message: "The value 'no' of the use statement is the value of no option.",
          at: 'use mapstruct, foo, no for A',
        },
      ]);
    });
  });

  describe('relationship-between-applications', () => {
    const applications = (sourceApplications: string, destinationApplications: string) =>
      `entity A\nentity B\napplication { config { baseName a } entities ${sourceApplications} }\napplication { config { baseName b } entities ${destinationApplications} }\nrelationship ManyToOne { A to B }`;
    it('reports a relationship from an application that does not have the destination', () => {
      expect(check(applications('A', 'B'))).toEqual([
        {
          ruleId: 'relationship-between-applications',
          message: "Entities for the ManyToOne relationship from 'A' to 'B' do not belong to the same application.",
          at: 'A to B',
        },
      ]);
      expect(check(applications('A, B', 'A')).map(diagnostic => diagnostic.ruleId)).toEqual(['relationship-between-applications']);
    });
    it('accepts a destination in every application of the source', () => {
      expect(check(applications('A, B', 'B'))).toEqual([]);
    });
    it('accepts an entity of no application', () => {
      expect(check('entity A\nentity B\napplication { config { baseName a } entities A }\nrelationship ManyToOne { A to B }')).toEqual([]);
    });
  });

  describe('application-option-value', () => {
    it('reports a value outside the choices of an application option, at the option', () => {
      expect(check('application {\n  config {\n    baseName foo\n    clientFramework svelte\n  }\n}')).toEqual([
        {
          ruleId: 'application-option-value',
          message: "The value 'svelte' is not allowed for the option 'clientFramework'.",
          at: 'clientFramework svelte',
        },
      ]);
    });
  });

  describe('deployment-option-value', () => {
    it('reports a value outside the choices of a deployment option, at the option', () => {
      expect(check('deployment {\n  deploymentType kubernetes\n  serviceDiscoveryType zookeeper\n}')).toEqual([
        {
          ruleId: 'deployment-option-value',
          message: "The value 'zookeeper' is not allowed for the deployment option 'serviceDiscoveryType'.",
          at: 'serviceDiscoveryType zookeeper',
        },
      ]);
    });
    it('accepts any value for an option without choices', () => {
      expect(check('deployment {\n  deploymentType kubernetes\n  kubernetesNamespace anything-goes\n}')).toEqual([]);
    });
  });

  describe('namespace-config-blueprint', () => {
    it('reports a namespace config without its blueprint, at the config', () => {
      expect(check('application {\n  config { baseName a }\n  config(foo) { bar baz }\n}')).toEqual([
        {
          ruleId: 'namespace-config-blueprint',
          message: 'Blueprint namespace config foo requires the blueprint foo',
          at: 'config(foo) { bar baz }',
        },
      ]);
    });
    it('accepts it with its blueprint', () => {
      expect(check('application {\n  config { baseName a blueprints [foo] }\n  config(foo) { bar baz }\n}')).toEqual([]);
    });
  });

  describe('unused-enum', () => {
    it('suggests removing an enum no field uses', () => {
      expect(suggest('enum Used { X }\nenum Unused { Y }\nentity A {\n  used Used\n}')).toEqual([
        { ruleId: 'unused-enum', message: 'The enum Unused is not used.', at: 'enum Unused { Y }' },
      ]);
    });
  });

  describe('empty-entity-body', () => {
    it('suggests dropping the braces of an entity without field', () => {
      expect(suggest('entity A {}\nentity B\nentity C {\n  name String\n}')).toEqual([
        { ruleId: 'empty-entity-body', message: 'The entity A has no field, it can be declared without braces.', at: '{}' },
      ]);
    });
  });

  describe('individual-relationship-declaration', () => {
    it('suggests grouping the declarations of a relationship type', () => {
      expect(
        suggest(
          'entity A\nentity B\nrelationship OneToMany { A to B }\nrelationship OneToMany { B to A }\nrelationship ManyToOne { A{b} to B, B{a} to A }',
        ),
      ).toEqual([
        {
          ruleId: 'individual-relationship-declaration',
          message: 'The OneToMany relationships are declared apart, they can be declared together.',
          at: 'relationship OneToMany { A to B }',
        },
        {
          ruleId: 'individual-relationship-declaration',
          message: 'The OneToMany relationships are declared apart, they can be declared together.',
          at: 'relationship OneToMany { B to A }',
        },
      ]);
    });
  });

  describe('with rules of the runtime', () => {
    it('checks them with the rules of the jdl', () => {
      const runtime = createJDLRuntime({
        rules: [{ id: 'no-b', check: ast => ast.entities.filter(entity => entity.name === 'B').map(() => ({ message: 'No B.' })) }],
      });
      expect(check('entity B\ndto C with mapstruct', runtime).map(diagnostic => diagnostic.ruleId)).toEqual([
        'undeclared-option-entity',
        'no-b',
      ]);
    });
  });

  it('reports every problem, in source order', () => {
    expect(check('dto B with mapstruct\nentity A\nrelationship OneToOne { A to C }').map(diagnostic => diagnostic.ruleId)).toEqual([
      'undeclared-option-entity',
      'undeclared-relationship-entity',
    ]);
  });

  describe('when importing', () => {
    it('logs the warnings, with their position, and imports', () => {
      const warn = esmocha.spyOn(logger, 'warn');
      try {
        const { exportedEntities } = createImporterFromContent('entity A {\n  start Date\n}', {
          applicationName: 'foo',
          databaseType: 'sql',
        }).import();
        expect(exportedEntities.map(entity => entity.name)).toEqual(['A']);
        expect(warn).toHaveBeenCalledWith(
          'The type Date of the field start in the entity A is deprecated: use Instant, which it is migrated to.\n\tat line: 2, column: 3',
        );
      } finally {
        warn.mockRestore();
      }
    });
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
