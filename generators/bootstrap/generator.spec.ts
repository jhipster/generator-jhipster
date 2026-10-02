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

import { basicHelpers, defaultHelpers as helpers, result, skipPrettierHelpers } from '#testing';

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

  describe('prettier editor metadata', () => {
    const unformatted = 'key=value\nother.key   =   other value\n';
    const formatted = 'key = value\nother.key = other value\n';

    class PropertiesGenerator extends BaseGenerator {
      get [BaseGenerator.WRITING]() {
        return this.asWritingTaskGroup({
          write() {
            this.writeDestination('flagged.properties', unformatted, { metadata: { prettier: true } });
            this.writeDestination('not-flagged.properties', unformatted);
          },
        });
      }
    }

    before(async () => {
      await basicHelpers.run(PropertiesGenerator).withJHipsterGenerators();
    });

    it('formats files written with the prettier metadata, even if prettier does not format their extension', () => {
      result.assertEqualsFileContent('flagged.properties', formatted);
    });

    it('does not format the other files with that extension', () => {
      result.assertEqualsFileContent('not-flagged.properties', unformatted);
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
      // skipPrettierHelpers keeps dryRun disabled, so files would be written to disk without export mode.
      await skipPrettierHelpers.run(WriteGenerator).withOptions({ exportApplication: true }).withJHipsterGenerators();
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
      await skipPrettierHelpers.run(WriteGenerator).withOptions({ deferCommit: true }).withJHipsterGenerators();
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

  describe('prettier config generated in the same run', () => {
    const unformatted = 'function answer() {\nreturn 42;\n}\n';
    const formattedWithTabWidth2 = 'function answer() {\n  return 42;\n}\n';
    const formattedWithTabWidth4 = 'function answer() {\n    return 42;\n}\n';
    // tabWidth 4 only applies to ts files, through an override.
    const prettierConfig = "tabWidth: 2\noverrides:\n  - files: '*.ts'\n    options:\n      tabWidth: 4\n";

    class PrettierConfigGenerator extends BaseGenerator {
      get [BaseGenerator.WRITING]() {
        return this.asWritingTaskGroup({
          write() {
            this.writeDestination('.prettierrc', prettierConfig);
            this.writeDestination('src/file.ts', unformatted);
            this.writeDestination('src/file.js', unformatted);
          },
        });
      }
    }

    describe('with exportApplication', () => {
      before(async () => {
        await basicHelpers.run(PrettierConfigGenerator).withOptions({ exportApplication: true }).withJHipsterGenerators();
      });

      it('formats with the generated prettier config and its overrides, which are not on disk', () => {
        const archive = unzipSync(readFileSync(join(result.cwd, 'export-application.zip')));
        expect(Buffer.from(archive['src/file.ts']).toString('utf8')).toBe(formattedWithTabWidth4);
        expect(Buffer.from(archive['src/file.js']).toString('utf8')).toBe(formattedWithTabWidth2);
      });
    });

    describe('with deferCommit', () => {
      before(async () => {
        await basicHelpers.run(PrettierConfigGenerator).withOptions({ deferCommit: true }).withJHipsterGenerators();
      });

      it('formats with the generated prettier config and its overrides, which are not on disk', () => {
        const snapshot = result.getSnapshot(file => file.path.includes('file.'));
        expect(snapshot['src/file.ts'].contents).toBe(formattedWithTabWidth4);
        expect(snapshot['src/file.js'].contents).toBe(formattedWithTabWidth2);
      });
    });

    describe('committing to disk', () => {
      before(async () => {
        await basicHelpers.run(PrettierConfigGenerator).withJHipsterGenerators();
      });

      it('formats with the generated prettier config and its overrides', () => {
        result.assertEqualsFileContent('src/file.ts', formattedWithTabWidth4);
        result.assertEqualsFileContent('src/file.js', formattedWithTabWidth2);
      });
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
      await skipPrettierHelpers.run(SiblingGenerator).withOptions({ exportApplication: true }).withJHipsterGenerators();
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
      await skipPrettierHelpers.run(EscapeGenerator).withOptions({ exportApplication: true }).withJHipsterGenerators();
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
