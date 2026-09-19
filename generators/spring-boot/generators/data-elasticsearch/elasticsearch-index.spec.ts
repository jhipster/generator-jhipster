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
import { before, describe, it } from 'esmocha';

import { defaultHelpers as helpers, result, runResult } from '#testing';

const FOO = 'src/main/java/com/mycompany/myapp/domain/Foo.java';
const BAR = 'src/main/java/com/mycompany/myapp/domain/Bar.java';

/**
 * The index and the mapping field names are part of the Elasticsearch schema, which has to stay stable for the
 * life of an application. `elasticsearchIndexName` and `elasticsearchFieldName` let an entity or relationship keep
 * pointing at an existing index/field when the name it is otherwise derived from changes.
 */
describe('generator - elasticsearch - index and field names', () => {
  before(async () => {
    await helpers.runJHipster('spring-boot').withJHipsterConfig({ searchEngine: 'elasticsearch' }, [
      {
        name: 'Foo',
        fields: [{ fieldName: 'name', fieldType: 'String' }],
        relationships: [
          {
            relationshipName: 'bar',
            otherEntityName: 'Bar',
            relationshipType: 'many-to-many',
            relationshipSide: 'left',
            otherEntityRelationshipName: 'foo',
            elasticsearchFieldName: 'legacy_bar_field',
          },
          {
            relationshipName: 'baz',
            otherEntityName: 'Bar',
            relationshipType: 'many-to-many',
            relationshipSide: 'left',
            otherEntityRelationshipName: 'fooB',
          },
        ],
      },
      {
        name: 'Bar',
        elasticsearchIndexName: 'legacy_bar_index',
        fields: [{ fieldName: 'label', fieldType: 'String' }],
        relationships: [
          {
            relationshipName: 'foo',
            otherEntityName: 'Foo',
            relationshipType: 'many-to-many',
            relationshipSide: 'right',
            otherEntityRelationshipName: 'bar',
          },
          {
            relationshipName: 'fooB',
            otherEntityName: 'Foo',
            relationshipType: 'many-to-many',
            relationshipSide: 'right',
            otherEntityRelationshipName: 'baz',
          },
        ],
      },
    ] as any);
  });

  it('should index an entity under its lower cased name by default', () => {
    runResult.assertFileContent(FOO, 'indexName = "foo"');
  });

  it('should index an entity under the configured name', () => {
    runResult.assertFileContent(BAR, 'indexName = "legacy_bar_index"');
  });

  it('should index a relationship under the configured name', () => {
    runResult.assertFileContent(FOO, 'Field(name = "legacy_bar_field")');
  });

  it('should not annotate a relationship indexed under its own name', () => {
    runResult.assertNoFileContent(FOO, 'Field(name = "baz")');
  });
});

/**
 * Both properties are reachable from JDL as annotations, which land in the entity's `annotations` and in the
 * relationship's `options` and are then assigned onto the entity and the relationship.
 */
describe('generator - elasticsearch - index names declared as jdl annotations', () => {
  before(async () => {
    await helpers
      .runJHipster('jdl')
      .withJHipsterConfig()
      .withOptions({
        jsonOnly: true,
        inline: `
@elasticsearchIndexName("legacy_bar_index")
entity Bar { label String }
entity Foo { name String }
relationship ManyToMany {
  Foo{bar} to @elasticsearchFieldName("legacy_bar_field") Bar{foo}
}
`,
      })
      .withMockedJHipsterGenerators();
  });

  it('should carry the entity annotation into the entity configuration', () => {
    result.assertJsonFileContent('.jhipster/Bar.json', { annotations: { elasticsearchIndexName: 'legacy_bar_index' } });
  });

  it('should carry the relationship annotation into the annotated side', () => {
    // Written on the `Bar` side, it configures the relationship held by `Foo`: the converter applies the
    // options of one side to the relationship of the opposite entity.
    result.assertJsonFileContent('.jhipster/Foo.json', {
      relationships: [{ relationshipName: 'bar', options: { elasticsearchFieldName: 'legacy_bar_field' } }],
    });
  });
});
