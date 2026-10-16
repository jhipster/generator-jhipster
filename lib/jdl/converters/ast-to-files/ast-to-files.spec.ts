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

import { getDefaultRuntime } from '../../../jdl-config/jdl-runtime.ts';
import { parse, performJDLPostParsingTasks } from '../../core/parsing/index.ts';

import { astToFiles, convertAstToFiles } from './ast-to-files.ts';

const runtime = getDefaultRuntime();

const convert = (jdl: string) => astToFiles(performJDLPostParsingTasks(parse(jdl, runtime, { onWarning: () => {} })), runtime);

describe('jdl - astToFiles', () => {
  it('should put an application in its folder, its deployments beside it, and run in its folder', () => {
    expect(
      convert(`
application {
  config { baseName shop }
  entities Product
}
entity Product { name String }
deployment { deploymentType docker-compose appsFolders [shop] }
`),
    ).toMatchInlineSnapshot(`
{
  "files": {
    "docker-compose/.yo-rc.json": {
      "generator-jhipster": {
        "appsFolders": [
          "shop",
        ],
        "deploymentType": "docker-compose",
      },
    },
    "shop/.jhipster/Product.json": {
      "fields": [
        {
          "fieldName": "name",
          "fieldType": "String",
        },
      ],
      "name": "Product",
      "relationships": [],
    },
    "shop/.yo-rc.json": {
      "generator-jhipster": {
        "baseName": "shop",
        "entities": [
          "Product",
        ],
      },
    },
  },
  "relativeRoot": "shop",
}
`);
  });

  it('should put each application in its folder, and run above them', () => {
    const { files, relativeRoot } = convert(`
application {
  config { baseName gateway applicationType gateway }
  entities Product, Order
}
application {
  config { baseName store applicationType microservice }
  entities Product
}
entity Product
entity Order
microservice Product with store
microservice Order with orders
`);
    expect(relativeRoot).toBe('');
    expect(Object.keys(files)).toEqual([
      'gateway/.yo-rc.json',
      'gateway/.jhipster/Product.json',
      'gateway/.jhipster/Order.json',
      'store/.yo-rc.json',
      'store/.jhipster/Product.json',
    ]);
  });

  it('should put the entities of a jdl without application in .jhipster, as the jdl declares them', () => {
    expect(convert('entity Product\nentity Order\nmicroservice Order with orders')).toMatchInlineSnapshot(`
{
  "files": {
    ".jhipster/Order.json": {
      "fields": [],
      "microserviceName": "orders",
      "name": "Order",
      "relationships": [],
    },
    ".jhipster/Product.json": {
      "fields": [],
      "name": "Product",
      "relationships": [],
    },
  },
  "relativeRoot": "",
}
`);
  });

  it('should refuse the deployments of a jdl without application declaring entities', () => {
    expect(() => convert('entity Product\ndeployment { deploymentType docker-compose appsFolders [shop] }')).toThrow(
      'A jdl declaring entities without application cannot declare deployments.',
    );
  });

  it('should not know where the applications of a jdl declaring only deployments are', () => {
    const { files, relativeRoot } = convert(
      'deployment { deploymentType docker-compose appsFolders [shop] }\ndeployment { deploymentType kubernetes appsFolders [shop] }',
    );
    expect(relativeRoot).toBeNull();
    expect(Object.keys(files)).toEqual(['docker-compose/.yo-rc.json', 'kubernetes/.yo-rc.json']);
  });

  it('should convert an empty jdl to no file', () => {
    expect(convert('')).toEqual({ files: {}, relativeRoot: '' });
  });

  it('should convert the entities, their fields, enums and validations', () => {
    const { files } = convert(`
/** An entity. */
@ChangelogDate("20200101000000")
entity A (a_table) {
  /** A name. */
  name String required pattern(/[a-z']+/)
  size Integer min(MIN)
  kind Kind
}
MIN = 2
/** A kind. */
enum Kind {
  /** One. */
  ONE (one),
  TWO
}
`);
    expect(files).toMatchInlineSnapshot(`
{
  ".jhipster/A.json": {
    "annotations": {
      "changelogDate": "20200101000000",
    },
    "documentation": "An entity.",
    "entityTableName": "a_table",
    "fields": [
      {
        "documentation": "A name.",
        "fieldName": "name",
        "fieldType": "String",
        "fieldValidateRules": [
          "required",
          "pattern",
        ],
        "fieldValidateRulesPattern": "[a-z\\']+",
      },
      {
        "fieldName": "size",
        "fieldType": "Integer",
        "fieldValidateRules": [
          "min",
        ],
        "fieldValidateRulesMin": "2",
      },
      {
        "fieldName": "kind",
        "fieldType": "Kind",
        "fieldTypeDocumentation": "A kind.",
        "fieldValues": "ONE (one),TWO",
        "fieldValuesJavadocs": {
          "ONE": "One.",
        },
      },
    ],
    "name": "A",
    "relationships": [],
  },
}
`);
  });

  it('should make a relationship without injected field bidirectional', () => {
    const { files } = convert('entity A\nentity B\nrelationship OneToMany { A to B }');
    expect(Object.values(files).map(entity => entity.relationships)).toMatchInlineSnapshot(`
[
  [
    {
      "otherEntityName": "b",
      "otherEntityRelationshipName": "a",
      "relationshipName": "b",
      "relationshipSide": "left",
      "relationshipType": "one-to-many",
    },
  ],
  [
    {
      "otherEntityName": "a",
      "otherEntityRelationshipName": "b",
      "relationshipName": "a",
      "relationshipSide": "right",
      "relationshipType": "many-to-one",
    },
  ],
]
`);
  });

  it('should convert the relationship options, the required sides and the built-in entities', () => {
    const { files } = convert(`
entity A
relationship ManyToOne {
  @OnDelete("CASCADE") A{user(login) required} to @Other User with builtInEntity
}
`);
    expect(files['.jhipster/A.json'].relationships).toMatchInlineSnapshot(`
[
  {
    "options": {
      "other": true,
    },
    "otherEntityField": "login",
    "otherEntityName": "user",
    "relationshipName": "user",
    "relationshipSide": "left",
    "relationshipType": "many-to-one",
    "relationshipValidateRules": "required",
    "relationshipWithBuiltInEntity": true,
  },
]
`);
  });

  it('should keep the relationships in the order they are written', () => {
    const { files } = convert(`
entity A
entity B
relationship ManyToMany { A{b} to B{a} }
relationship OneToOne { A{c} to B }
`);
    expect(files['.jhipster/A.json'].relationships.map((relationship: any) => relationship.relationshipType)).toEqual([
      'many-to-many',
      'one-to-one',
    ]);
  });

  it('should apply the option statements in the order they are written, a later one winning', () => {
    const { files } = convert(`
entity A
entity B
use couchbase for *
service * with serviceImpl except B
search * with elasticsearch except A
dto A with mapstruct
service B with no
filter B
`);
    expect(files['.jhipster/A.json']).toMatchObject({ searchEngine: 'no', service: 'serviceImpl', dto: 'mapstruct' });
    expect(files['.jhipster/B.json']).toMatchObject({ searchEngine: 'elasticsearch', service: 'no', jpaMetamodelFiltering: true });
  });

  it('should give each application its own entities, with the options of the jdl then its own', () => {
    const { files } = convert(`
application {
  config { baseName one languages [en, fr, en] }
  entities A
  dto * with mapstruct
}
application {
  config { baseName two }
  entities A
}
entity A
paginate * with pagination
`);
    expect(files['one/.yo-rc.json']['generator-jhipster']).toEqual({ baseName: 'one', languages: ['en', 'fr'], entities: ['A'] });
    expect(files['one/.jhipster/A.json']).toMatchObject({ dto: 'mapstruct', pagination: 'pagination' });
    expect(files['two/.jhipster/A.json']).toMatchObject({ pagination: 'pagination' });
    expect(files['two/.jhipster/A.json'].dto).toBeUndefined();
  });

  it('should give a deployment the options it declares, each list item once', () => {
    const { files } = convert('deployment { deploymentType kubernetes appsFolders [one, two, one] }');
    expect(files).toMatchInlineSnapshot(`
{
  "kubernetes/.yo-rc.json": {
    "generator-jhipster": {
      "appsFolders": [
        "one",
        "two",
      ],
      "deploymentType": "kubernetes",
    },
  },
}
`);
  });

  it('should name a blueprint and its namespace config after its package', () => {
    const { files } = convert(`
application {
  config { baseName shop blueprints [foo, generator-jhipster-bar] }
  config(foo) { flag true }
}
`);
    expect(files['shop/.yo-rc.json']).toEqual({
      'generator-jhipster-foo': { flag: true },
      'generator-jhipster': {
        baseName: 'shop',
        blueprints: [{ name: 'generator-jhipster-foo' }, { name: 'generator-jhipster-bar' }],
        entities: [],
      },
    });
  });

  describe('convertAstToFiles, without customization', () => {
    const convertPlain = (jdl: string) =>
      convertAstToFiles(performJDLPostParsingTasks(parse(jdl, runtime, { onWarning: () => {} })), runtime).files;

    it('should give a relationship naming no field its source side only', () => {
      expect(
        Object.values(convertPlain('entity A\nentity B\nrelationship OneToMany { A to B }')).map(entity => entity.relationships),
      ).toEqual([[{ relationshipSide: 'left', relationshipType: 'one-to-many', otherEntityName: 'b', relationshipName: 'b' }], []]);
    });

    it('should keep the blueprint and namespace config names as written', () => {
      expect(
        convertPlain('application {\n  config { baseName shop blueprints [foo] }\n  config(foo) { flag true }\n}')['shop/.yo-rc.json'],
      ).toEqual({
        foo: { flag: true },
        'generator-jhipster': { baseName: 'shop', blueprints: [{ name: 'foo' }], entities: [] },
      });
    });

    it('should refuse an application without base name', () => {
      expect(() => convertPlain('application {\n  config { applicationType monolith }\n}')).toThrow(
        'An application without baseName has no folder to be converted to.',
      );
    });
  });
});
