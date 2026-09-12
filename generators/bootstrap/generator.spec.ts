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
import { before, describe, expect, it } from 'esmocha';
import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { unzipSync } from 'fflate';

import { shouldSupportFeatures } from '../../test/support/tests.ts';
import BaseGenerator from '../base/index.ts';

import Generator from './index.ts';

import { basicHelpers, defaultHelpers as helpers, result } from '#testing';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  describe('instance', () => {
    let bootstrapGenerator: Generator;

    beforeEach(async () => {
      bootstrapGenerator = await helpers.instantiateDummyGenerator(Generator);
    });

    it('should not set jhipsterConfig', () => {
      expect(bootstrapGenerator.jhipsterConfig).toBeUndefined();
    });

    it('should reject jhipsterConfigWithDefaults access', () => {
      expect(() => bootstrapGenerator.jhipsterConfigWithDefaults).toThrow(
        'jhipsterConfigWithDefaults is not available in uniqueGlobally generators',
      );
    });
  });

  describe('removeNeedles', () => {
    const content = 'first\n// jhipster-needle-add-content - JHipster will add content here\nlast\n';

    class NeedleGenerator extends BaseGenerator {
      get [BaseGenerator.WRITING]() {
        return this.asWritingTaskGroup({
          write() {
            this.writeDestination('file.txt', content);
          },
        });
      }
    }

    describe('with removeNeedles config', () => {
      before(async () => {
        await helpers.run(NeedleGenerator).withJHipsterConfig({ removeNeedles: true }).withJHipsterGenerators();
      });

      it('should remove needles from the committed file', () => {
        result.assertEqualsFileContent('file.txt', 'first\nlast\n');
      });
    });

    describe('without removeNeedles config', () => {
      before(async () => {
        await helpers.run(NeedleGenerator).withJHipsterGenerators();
      });

      it('should keep needles', () => {
        result.assertEqualsFileContent('file.txt', content);
      });
    });
  });

  describe('exportApplication', () => {
    class WriteGenerator extends BaseGenerator {
      get [BaseGenerator.WRITING]() {
        return this.asWritingTaskGroup({
          write() {
            this.writeDestination('file.txt', 'exported content\n');
          },
        });
      }
    }

    before(async () => {
      // basicHelpers keeps dryRun disabled, so files would be written to disk without export mode.
      await basicHelpers.run(WriteGenerator).withOptions({ exportApplication: true }).withJHipsterGenerators();
    });

    it('does not write the generated file to disk', () => {
      expect(existsSync(join(result.cwd, 'file.txt'))).toBe(false);
    });

    it('writes an export-application.zip archive instead', () => {
      expect(existsSync(join(result.cwd, 'export-application.zip'))).toBe(true);
    });

    it('includes the generated file in the archive', () => {
      const archive = unzipSync(readFileSync(join(result.cwd, 'export-application.zip')));
      expect(Object.keys(archive)).toContain('file.txt');
      expect(Buffer.from(archive['file.txt']).toString('utf8')).toBe('exported content\n');
    });
  });

  describe('deferCommit', () => {
    class WriteGenerator extends BaseGenerator {
      get [BaseGenerator.WRITING]() {
        return this.asWritingTaskGroup({
          write() {
            this.writeDestination('deferred.txt', 'deferred content\n');
          },
        });
      }
    }

    before(async () => {
      await basicHelpers.run(WriteGenerator).withOptions({ deferCommit: true }).withJHipsterGenerators();
    });

    it('does not write the generated file to disk', () => {
      expect(existsSync(join(result.cwd, 'deferred.txt'))).toBe(false);
    });

    it('does not write an archive, the parent generator owns the export', () => {
      expect(existsSync(join(result.cwd, 'export-application.zip'))).toBe(false);
    });

    it('leaves the file in the shared mem-fs', () => {
      expect(result.getStateSnapshot()).toMatchObject({ 'deferred.txt': { state: 'modified' } });
    });
  });

  describe('exportApplication with a registered path outside of the destination root', () => {
    class SiblingGenerator extends BaseGenerator {
      get [BaseGenerator.WRITING]() {
        return this.asWritingTaskGroup({
          async write() {
            // A deployment or a blueprint generating a sibling application registers its own destination root.
            const siblingRoot = this.destinationPath('..', 'exported-sibling', { allowOutsideRoot: true });
            const bootstrapGenerator = await this.composeWithJHipster('bootstrap');
            bootstrapGenerator.registerExportPath(siblingRoot);

            this.writeDestination('inside.txt', 'inside\n');
            this.writeDestination(join(siblingRoot, 'sibling.txt'), 'sibling\n', { allowOutsideRoot: true });
          },
        });
      }
    }

    before(async () => {
      await basicHelpers.run(SiblingGenerator).withOptions({ exportApplication: true }).withJHipsterGenerators();
    });

    it('does not write the generated file to disk', () => {
      expect(existsSync(join(result.cwd, '..', 'exported-sibling', 'sibling.txt'))).toBe(false);
    });

    it('exports the registered path under its folder name', () => {
      const archive = unzipSync(readFileSync(join(result.cwd, 'export-application.zip')));
      expect(Object.keys(archive)).toContain('inside.txt');
      expect(Object.keys(archive)).toContain('exported-sibling/sibling.txt');
    });
  });

  describe('exportApplication with a file outside the destination root', () => {
    class EscapeGenerator extends BaseGenerator {
      get [BaseGenerator.WRITING]() {
        return this.asWritingTaskGroup({
          write() {
            this.writeDestination('inside.txt', 'inside\n');
            this.writeDestination(this.destinationPath('..', 'escaped.txt', { allowOutsideRoot: true }), 'escaped\n', {
              allowOutsideRoot: true,
            });
          },
        });
      }
    }

    before(async () => {
      await basicHelpers.run(EscapeGenerator).withOptions({ exportApplication: true }).withJHipsterGenerators();
    });

    it('does not write the escaped file to disk', () => {
      expect(existsSync(join(result.cwd, '..', 'escaped.txt'))).toBe(false);
    });

    it('ignores the escaped file and keeps the ones inside the root', () => {
      const archive = unzipSync(readFileSync(join(result.cwd, 'export-application.zip')));
      expect(Object.keys(archive)).toContain('inside.txt');
      expect(Object.keys(archive).some(entry => entry.includes('escaped.txt'))).toBe(false);
    });
  });
});
