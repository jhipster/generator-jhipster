/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { before, describe, expect, it } from 'esmocha';
import { basename } from 'node:path';

import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { getCommandHelpOutput, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';

import Generator from './index.ts';

const generator = basename(import.meta.dirname);

const MOCKED_APP = 'jhipster:app';
const MOCKED_DOCKER_COMPOSE = 'jhipster:docker-compose';
const MOCKED_ENTITIES = 'jhipster:entities';
const MOCKED_WORKSPACES = 'jhipster:workspaces';

const mockedGenerators = [MOCKED_APP, MOCKED_ENTITIES, MOCKED_DOCKER_COMPOSE, MOCKED_WORKSPACES];

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('help', () => {
    it('should print expected information', async () => {
      expect(await getCommandHelpOutput(generator)).toMatchSnapshot();
    });
  });
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('for entities only jdl', () => {
    it('without baseName should reject', async () => {
      await expect(
        helpers.runJHipster(generator).withOptions({
          inline: 'entity Foo {}',
          db: 'postgresql',
        }),
      ).rejects.toThrow("The JDL object and its application's name are mandatory.");
    });

    describe('with valid parameters', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          inline: 'entity Foo {}',
          db: 'postgresql',
          baseName: 'jhipster',
        });
      });

      it('should not compose with app', () => {
        runResult.assertGeneratorNotComposed(MOCKED_APP);
      });

      it('should compose with entities', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_ENTITIES);
        const calls = runResult.getGeneratorMock(MOCKED_ENTITIES).calls;
        expect(calls[calls.length - 1].arguments).toStrictEqual([['Foo'], expect.any(Object)]);
      });

      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toEqual({
          '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
        });
      });
    });

    describe('with valid config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig().withMockedGenerators(mockedGenerators).withOptions({
          inline: 'entity Foo {}',
        });
      });

      it('should not compose with app', () => {
        runResult.assertGeneratorNotComposed(MOCKED_APP);
      });

      it('should compose with entities', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_ENTITIES);
        const calls = runResult.getGeneratorMock(MOCKED_ENTITIES).calls;
        expect(calls[calls.length - 1].arguments).toStrictEqual([['Foo'], expect.any(Object)]);
      });

      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toEqual({
          '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
        });
      });
    });
  });

  describe('for application jdl', () => {
    describe('with valid jdl', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          inline: 'application { }',
        });
      });

      it('should not compose with entities', () => {
        runResult.assertGeneratorNotComposed(MOCKED_ENTITIES);
      });
      it('should compose with app', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_APP);
        expect(runResult.getGeneratorMock(MOCKED_APP).calls[0].arguments).toStrictEqual([
          [],
          expect.not.objectContaining({ applicationWithEntities: expect.any(Object) }),
        ]);
      });
      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });

    describe('with blueprint jdl with blueprint config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withOptions({
          jsonOnly: true,
          inline: 'application { config { blueprints [foo, bar] } config(foo) { config fooValue } config(bar) { config barValue } }',
        });
      });

      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toMatchInlineSnapshot(`
{
  ".yo-rc.json": {
    "contents": "{
  "generator-jhipster": {
    "baseName": "jhipster",
    "blueprints": [
      {
        "name": "generator-jhipster-foo"
      },
      {
        "name": "generator-jhipster-bar"
      }
    ],
    "entities": []
  },
  "generator-jhipster-bar": {
    "config": "barValue"
  }
}
",
    "stateCleared": "modified",
  },
}
`);
      });
    });
  });

  describe('for one application and entity jdl', () => {
    describe('with valid jdl', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          inline: 'application { entities Foo } entity Foo {}',
        });
      });

      it('should not compose with entities', () => {
        runResult.assertGeneratorNotComposed(MOCKED_ENTITIES);
      });
      it('should compose with app', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_APP);
        const calls = runResult.getGeneratorMock(MOCKED_APP).calls;
        expect(calls[calls.length - 1].arguments).toStrictEqual([
          [],
          expect.not.objectContaining({ applicationWithEntities: expect.any(Object) }),
        ]);
      });
      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });

    describe('with --ignore-application option', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          ignoreApplication: true,
          inline: 'application { entities Foo } entity Foo {}',
        });
      });

      it('should write entity files', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });
  });

  describe('for two applications and entity jdl', () => {
    describe('with valid jdl', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          inline: 'application { entities Foo } entity Foo {} application { config { baseName jhipster2 } entities Bar } entity Bar',
        });
      });

      it('should not compose with entities', () => {
        runResult.assertGeneratorNotComposed(MOCKED_ENTITIES);
      });
      it('should not compose with app', () => {
        runResult.assertGeneratorNotComposed(MOCKED_APP);
      });
      it('should compose with workspaces', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_WORKSPACES);
        const calls = runResult.getGeneratorMock(MOCKED_WORKSPACES).calls;
        expect(calls[calls.length - 1].arguments).toStrictEqual([
          [],
          expect.objectContaining({ workspacesFolders: ['jhipster', 'jhipster2'], generateApplications: expect.any(Function) }),
        ]);
      });
      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toEqual({});
      });
    });

    describe('with --ignore-application option', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          ignoreApplication: true,
          inline: 'application { entities Foo } entity Foo {} application { config { baseName jhipster2 } entities Bar } entity Bar',
        });
      });

      it('should compose with entities', () => {
        expect(runResult.getGeneratorComposeCount(MOCKED_ENTITIES)).toBe(2);
        const calls = runResult.getGeneratorMock(MOCKED_ENTITIES).calls;
        expect(calls[calls.length - 1].arguments).toStrictEqual([['Bar'], expect.any(Object)]);
      });
      it('should not compose with app', () => {
        runResult.assertGeneratorNotComposed(MOCKED_APP);
      });
      it('should not compose with workspaces', () => {
        runResult.assertGeneratorNotComposed(MOCKED_WORKSPACES);
      });
      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });
  });

  describe('--json-only option', () => {
    describe('for entities only jdl', () => {
      describe('with valid parameters', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            inline: 'entity Foo {}',
            db: 'postgresql',
            baseName: 'jhipster',
          });
        });

        it('should write expected files', () => {
          expect(runResult.getSnapshot()).toEqual({
            '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });

      describe('with valid config', () => {
        before(async () => {
          await helpers.runJHipster(generator).withJHipsterConfig().withOptions({
            jsonOnly: true,
            inline: 'entity Foo {}',
          });
        });

        it('should match files snapshot', () => {
          expect(runResult.getSnapshot()).toEqual({
            '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });
    });

    describe('for application jdl', () => {
      describe('with valid jdl', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            inline: 'application { }',
          });
        });

        it('should write expected files', () => {
          expect(runResult.getSnapshot()).toEqual({
            '.yo-rc.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });
    });

    describe('for one application and entity jdl', () => {
      describe('with valid jdl', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            inline: 'application { entities Foo } entity Foo {}',
          });
        });

        it('should write expected files', () => {
          expect(runResult.getSnapshot()).toEqual({
            '.yo-rc.json': expect.objectContaining({ contents: expect.stringMatching(/"entities": \[\s*"Foo"\s*]/g) }),
            '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });

      describe('with --ignore-application option', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            ignoreApplication: true,
            inline: 'application { entities Foo } entity Foo {}',
          });
        });

        it('should write entity files', () => {
          expect(runResult.getSnapshot()).toEqual({
            '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });
    });

    describe('for two applications and entity jdl', () => {
      describe('with valid jdl', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            inline: 'application { entities Foo } entity Foo {} application { config { baseName jhipster2 } entities Bar } entity Bar',
          });
        });

        it('should write expected files', () => {
          expect(runResult.getSnapshot()).toMatchSnapshot();
        });
      });

      describe('with --ignore-application option', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            ignoreApplication: true,
            inline: 'application { entities Foo } entity Foo {} application { config { baseName jhipster2 } entities Bar } entity Bar',
          });
        });

        it('should write expected files', () => {
          expect(runResult.getSnapshot()).toEqual({
            'jhipster/.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
            'jhipster2/.jhipster/Bar.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });
    });
  });
  describe('with a microservices stack', () => {
    const jdl = `
application { entities Foo }
entity Foo {}
application { config { baseName gatewayApp applicationType gateway } entities * }
entity Bar
`;
    describe('generating the stack', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({ inline: jdl });
      });

      it('should not compose with entities', () => {
        runResult.assertGeneratorNotComposed(MOCKED_ENTITIES);
      });
      it('should not compose with app', () => {
        runResult.assertGeneratorNotComposed(MOCKED_APP);
      });
      it('should compose with workspaces', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_WORKSPACES);
        expect(runResult.getGeneratorMock(MOCKED_WORKSPACES).calls[0].arguments).toStrictEqual([
          [],
          expect.objectContaining({ workspacesFolders: ['gatewayApp', 'jhipster'], generateApplications: expect.any(Function) }),
        ]);
      });
    });
    describe('generating json', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({ inline: jdl, jsonOnly: true });
      });

      it('should generate expected config', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });
  });
  describe('with a gateway', () => {
    const jdl = `
application { config { baseName gatewayApp applicationType gateway } entities * }
microservice Bar with ms
entity Bar
`;
    describe('generating json', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({ inline: jdl, jsonOnly: true });
      });

      it('should generate expected config', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });
  });
  describe('with entrypointGenerator', () => {
    const jdl = `
application { config { baseName gatewayApp applicationType gateway } }
`;
    describe('generating application', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedGenerators([...mockedGenerators, 'foo:bar'])
          .withOptions({
            inline: jdl,
            entrypointGenerator: 'foo:bar',
          });
      });

      it('should generate expected config', () => {
        runResult.assertGeneratorComposedOnce('foo:bar');
      });
    });
  });

  describe('importing jdl', () => {
    describe('with Entity annotations', () => {
      before(async () => {
        await helpers
          .runJDL(
            `
application { config { baseName jhipster } entities * }

@EntityFalse(false)
@EntityZero(0)
@EntityEmpty("")
entity AnnotatedEntity {
  @FieldFalse(false)
  @FieldZero(0)
  @FieldEmpty("")
  annotatedField String
}

entity RelatedEntity

relationship ManyToOne {
  @RelationshipFalse(false)
  @RelationshipZero(0)
  @RelationshipEmpty("")
  RelatedEntity to AnnotatedEntity
}
`,
          )
          .withOptions({
            jsonOnly: true,
            skipApplication: true,
          });
      });

      it('should generate expected Entity config', () => {
        expect(runResult.getSnapshot('**/.jhipster/**')).toMatchInlineSnapshot(`
{
  ".jhipster/AnnotatedEntity.json": {
    "contents": "{
  "annotations": {
    "entityEmpty": "",
    "entityFalse": false,
    "entityZero": 0
  },
  "applications": [
    "jhipster"
  ],
  "fields": [
    {
      "fieldName": "annotatedField",
      "fieldType": "String",
      "options": {
        "fieldEmpty": "",
        "fieldFalse": false,
        "fieldZero": 0
      }
    }
  ],
  "name": "AnnotatedEntity",
  "relationships": [
    {
      "options": {
        "relationshipEmpty": "",
        "relationshipFalse": false,
        "relationshipZero": 0
      },
      "otherEntityName": "relatedEntity",
      "otherEntityRelationshipName": "annotatedEntity",
      "relationshipName": "relatedEntity",
      "relationshipSide": "right",
      "relationshipType": "one-to-many"
    }
  ]
}
",
    "stateCleared": "modified",
  },
  ".jhipster/RelatedEntity.json": {
    "contents": "{
  "annotations": {},
  "applications": [
    "jhipster"
  ],
  "fields": [],
  "name": "RelatedEntity",
  "relationships": [
    {
      "otherEntityName": "annotatedEntity",
      "otherEntityRelationshipName": "relatedEntity",
      "relationshipName": "annotatedEntity",
      "relationshipSide": "left",
      "relationshipType": "many-to-one"
    }
  ]
}
",
    "stateCleared": "modified",
  },
}
`);
      });
    });
  });
});
