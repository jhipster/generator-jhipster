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
import { basename, resolve } from 'node:path';

import { testBootstrapEntities } from '../../../../test/support/bootstrap-tests.ts';

import Generator from './generator.ts';

import { shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import { defaultHelpers as helpers, result } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with default config', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withMockedSource().withSharedApplication({}).withJHipsterConfig({
        skipClient: true,
      });
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

  describe('with a MapStruct expression', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withMockedSource()
        .withJHipsterConfig({ skipUserManagement: true }, [
          {
            name: 'Foo',
            dto: 'mapstruct',
            fields: [
              { fieldName: 'name', fieldType: 'String' },
              { fieldName: 'preview', fieldType: 'ImageBlob', options: { mapstructExpression: 'java(null)' } },
            ],
          } as any,
        ])
        .withSkipWritingPriorities();
    });

    const field = (fieldName: string): Record<string, any> =>
      (result.entities!.Foo as any).fields.find((field: any) => field.fieldName === fieldName);

    it('should give the field read only, computed by the backend and stored in no column', () => {
      expect(field('preview')).toMatchObject({ restAccess: 'readOnly', readonly: true, transient: true });
    });

    it('should give the content type of a computed blob the access of its blob', () => {
      expect(field('previewContentType')).toMatchObject({ restAccess: 'readOnly', readonly: true });
    });

    it('should give the other fields read and write', () => {
      expect(field('name')).toMatchObject({ restAccess: 'readWrite' });
      expect(field('name').readonly).toBeUndefined();
    });
  });

  describe('with a MapStruct expression without MapStruct DTO', () => {
    it('should fail', async () => {
      await expect(
        helpers
          .runJHipster(generator)
          .withMockedJHipsterGenerators()
          .withMockedSource()
          .withJHipsterConfig({ skipUserManagement: true }, [
            {
              name: 'Foo',
              fields: [{ fieldName: 'preview', fieldType: 'String', options: { mapstructExpression: 'java(null)' } }],
            } as any,
          ])
          .withSkipWritingPriorities(),
      ).rejects.toThrow('@MapstructExpression requires an Entity with mapstruct dto [Foo.preview].');
    });
  });

  describe('without client', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withMockedSource().withJHipsterConfig({ clientFramework: 'no' });
    });

    it('should not use the npm wrapper', () => {
      expect(result.application).toMatchObject({ useNpmWrapper: false, nodePackageManagerCommand: 'npm' });
    });
  });

  describe('with pnpm', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withMockedSource()
        .withJHipsterConfig({ clientFramework: 'angular', nodePackageManager: 'pnpm' });
    });

    it('should use the pnpm wrapper', () => {
      expect(result.application).toMatchObject({ useNpmWrapper: true, nodePackageManagerCommand: './pnpmw' });
    });
  });

  testBootstrapEntities(generator, { skipClient: true });
});
