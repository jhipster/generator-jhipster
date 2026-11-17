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
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

import Generator from './generator.ts';

import { shouldSupportFeatures } from '#test-support';
import { defaultHelpers as helpers, result } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  // describe('blueprint support', () => testBlueprintSupport(generator, { bootstrapGenerator: true }));

  it('bootstrap migration', async () => {
    await helpers
      .runJHipster('jhipster:bootstrap-application-base')
      .prepareEnvironment()
      .withMockedGenerators(['jhipster:base-application:bootstrap']);
    expect(result.getComposedGenerators()).toContain('jhipster:base-application:bootstrap');
  });

  describe('with defaults options', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withMockedSource().withSharedApplication({}).withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should call source snapshot', () => {
      expect(result.sourceCallsArg).toMatchSnapshot();
    });

    it('should compose with generators - snapshot', () => {
      expect(result.composedMockedGenerators).toMatchInlineSnapshot(`[]`);
    });
  });

  describe('with an entity written by an older version', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({ skipUserManagement: true }, [
          { name: 'Foo', annotations: { changelogDate: '20200101000100' }, incrementalChangelog: true, fields: [] } as any,
        ])
        .doInDir(cwd => writeFileSync(join(cwd, '.yo-rc.json'), JSON.stringify({ 'generator-jhipster': { jhipsterVersion: '9.4.0' } })))
        .withSkipWritingPriorities();
    });

    it('should store the incrementalChangelog flag as the incrementalChangelogDate', () => {
      result.assertJsonFileContent('.jhipster/Foo.json', { annotations: { incrementalChangelogDate: '20200101000100' } });
      result.assertNoFileContent('.jhipster/Foo.json', '"changelogDate"');
      result.assertNoFileContent('.jhipster/Foo.json', '"incrementalChangelog"');
    });
  });

  describe('with relationships written by an older version', () => {
    const publisher = {
      relationshipName: 'publisher',
      otherEntityName: 'member',
      relationshipType: 'one-to-one',
      relationshipSide: 'left',
    };
    const owner = { relationshipName: 'owner', otherEntityName: 'member', relationshipType: 'many-to-one', relationshipSide: 'left' };
    const recipient = {
      relationshipName: 'recipient',
      otherEntityName: 'member',
      relationshipType: 'one-to-one',
      relationshipSide: 'left',
    };
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({ skipUserManagement: true }, [
          // recipient is added in this run, like by a jdl import: it is not in the entity file on the disk.
          {
            name: 'Order',
            annotations: { changelogDate: '20200101000100' },
            fields: [],
            relationships: [publisher, owner, recipient],
          } as any,
          { name: 'Member', annotations: { changelogDate: '20200101000200' }, fields: [] } as any,
        ])
        .doInDir(cwd => {
          writeFileSync(join(cwd, '.yo-rc.json'), JSON.stringify({ 'generator-jhipster': { jhipsterVersion: '9.4.0' } }));
          mkdirSync(join(cwd, '.jhipster'), { recursive: true });
          writeFileSync(join(cwd, '.jhipster/Order.json'), JSON.stringify({ name: 'Order', relationships: [publisher, owner] }));
        })
        .withSkipWritingPriorities();
    });

    it('should save the back reference name the older version derived for the relationships it generated', () => {
      const { relationships } = result.fs.readJSON(join(result.cwd, '.jhipster/Order.json')) as { relationships: any[] };
      expect(relationships.map(({ relationshipName, options }) => ({ relationshipName, options }))).toEqual([
        { relationshipName: 'publisher', options: { backReferenceName: 'order' } },
        { relationshipName: 'owner', options: undefined },
        { relationshipName: 'recipient', options: undefined },
      ]);
    });
  });

  describe('with relationships of a new application', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({ skipUserManagement: true }, [
          {
            name: 'Order',
            annotations: { changelogDate: '20200101000100' },
            fields: [],
            relationships: [
              { relationshipName: 'publisher', otherEntityName: 'member', relationshipType: 'one-to-one', relationshipSide: 'left' },
              { relationshipName: 'owner', otherEntityName: 'member', relationshipType: 'many-to-one', relationshipSide: 'left' },
            ],
          } as any,
          { name: 'Member', annotations: { changelogDate: '20200101000200' }, fields: [] } as any,
        ])
        .withSkipWritingPriorities();
    });

    it('should save no back reference name', () => {
      result.assertNoFileContent('.jhipster/Order.json', 'backReferenceName');
    });
  });

  describe('with an entity with blob fields stored as byte[]', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({ skipUserManagement: true }, [
          {
            name: 'Foo',
            fields: [
              { fieldName: 'attachment', fieldType: 'byte[]', fieldTypeBlobContent: 'any' },
              { fieldName: 'picture', fieldType: 'byte[]', fieldTypeBlobContent: 'image' },
              { fieldName: 'description', fieldType: 'byte[]', fieldTypeBlobContent: 'text' },
            ],
          } as any,
        ])
        .withSkipWritingPriorities();
    });

    it('should store every blob field with its blob type', () => {
      result.assertJsonFileContent('.jhipster/Foo.json', {
        fields: [
          { fieldName: 'attachment', fieldType: 'AnyBlob' },
          { fieldName: 'picture', fieldType: 'ImageBlob' },
          { fieldName: 'description', fieldType: 'TextBlob' },
        ],
      });
      result.assertNoFileContent('.jhipster/Foo.json', 'fieldTypeBlobContent');
    });
  });

  describe('with an entity with a Blob field', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({ skipUserManagement: true }, [
          { name: 'Foo', fields: [{ fieldName: 'attachment', fieldType: 'Blob' }] } as any,
        ])
        .withSkipWritingPriorities();
    });

    it('should prepare it as a blob of any content', () => {
      const field = (result.entities!.Foo as any).fields.find((field: any) => field.fieldName === 'attachment');
      expect(field).toMatchObject({
        fieldTypeBlobContent: 'any',
        blobContentTypeAny: true,
        blobContentTypeImage: false,
        blobContentTypeText: false,
      });
    });
  });

  describe('security hardening', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({ skipUserManagement: true }, [
          {
            name: 'Foo',
            // eslint-disable-next-line no-template-curly-in-string
            annotations: { entityProperty: '${foo}' },
            fields: [
              {
                fieldName: 'myField',
                fieldType: 'String',
                // eslint-disable-next-line no-template-curly-in-string
                fieldValidateRulesPattern: '${injected}',
                // eslint-disable-next-line no-template-curly-in-string
                options: { fieldProperty: '${foot}' },
              },
            ],
          },
        ])
        .withSkipWritingPriorities();
    });

    it('should be applied to entity config', () => {
      expect(result.entities?.Foo).toMatchObject({
        entityProperty: '',
        fields: expect.arrayContaining([expect.objectContaining({ fieldProperty: '', fieldValidateRulesPattern: '' })]),
      });
    });
  });
});
