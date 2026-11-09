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

import { testBootstrapApplication } from '../../../../test/support/bootstrap-tests.ts';

import Generator from './generator.ts';

import { shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import { defaultHelpers as helpers, fromMatrix, result } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  for (const [name, config] of Object.entries(fromMatrix({ packageJsonNodeEngine: [true, false, 'customVersion'] }))) {
    describe(name, () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedJHipsterGenerators()
          .withMockedSource()
          .withSharedApplication({ dasherizedBaseName: 'dasherizedBaseName', projectDescription: 'projectDescription' })
          .withJHipsterConfig(config);
      });

      it('should match files snapshot', () => {
        expect(result.getSnapshot()).toMatchSnapshot({ '.yo-rc.json': expect.objectContaining({ contents: expect.any(String) }) });
      });

      it('should call source snapshot', () => {
        expect(result.sourceCallsArg).toMatchSnapshot();
      });

      it('should compose with generators', () => {
        expect(result.getComposedGenerators()).toHaveLength(0);
        expect(result.getComposedGenerators()).toEqual([]);
      });
    });
  }

  describe('prettierClientSources', () => {
    const prettierFoldersFor = async (application: Record<string, unknown>, config: Record<string, unknown> = {}) => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withMockedSource()
        .withSharedApplication({ dasherizedBaseName: 'dasherizedBaseName', projectDescription: 'projectDescription', ...application })
        .withJHipsterConfig(config);
      return result.application!.prettierFolders;
    };

    it('should not format the sources of a client by default', async () => {
      expect(await prettierFoldersFor({})).toEqual(['', '.blueprint/**/']);
    });

    it('should format the sources of the client once resolved', async () => {
      expect(await prettierFoldersFor({ prettierClientSources: true })).toEqual(['', '.blueprint/**/', 'src/main/webapp/**/']);
      expect(await prettierFoldersFor({ prettierClientSources: true }, { clientRootDir: 'client/' })).toEqual([
        '',
        '.blueprint/**/',
        'client/src/**/',
      ]);
    });

    it('should not add the sources of the client a folder already formats', async () => {
      expect(await prettierFoldersFor({ prettierClientSources: true, prettierFolders: ['', 'src/**/'] })).toEqual(['', 'src/**/']);
    });
  });

  testBootstrapApplication(generator);
});
