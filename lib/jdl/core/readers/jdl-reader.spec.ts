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

import { after, beforeEach, describe, expect, it } from 'esmocha';
import fs from 'node:fs';

import helpers from 'yeoman-test';

import { getDefaultRuntime } from '../../../jdl-config/jdl-runtime.ts';
import { getTestFile, parseFromContent, parseFromFiles } from '../__test-support__/index.ts';
import { parse } from '../parsing/api.ts';
import type { ParsedJDLApplications } from '../types/parsed.ts';

describe('jdl - JDLReader', () => {
  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });
  describe('parseFromFiles', () => {
    describe('when passing invalid parameters', () => {
      describe('such as nil', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error
            parseFromFiles(null);
          }).toThrow(/^The files must be passed to be parsed\.$/);
        });
      });
      describe('such as an empty array', () => {
        it('should fail', () => {
          expect(() => {
            parseFromFiles([]);
          }).toThrow(/^The files must be passed to be parsed\.$/);
        });
      });
      describe("such as files without the '.jh' or '.jdl' file extension", () => {
        it('should fail', () => {
          expect(() => {
            parseFromFiles(['../../__test-files__/invalid_file.txt']);
          }).toThrow(new RegExp("The passed file '../../__test-files__/invalid_file.txt' must end with '.jh' or '.jdl' to be valid."));
        });
      });
      describe('such as files that do not exist', () => {
        it('should fail', () => {
          expect(() => {
            parseFromFiles(['nofile.jh']);
          }).toThrow(new RegExp("The passed file 'nofile.jh' must exist and must not be a directory to be read."));
        });
      });
      describe('such as folders', () => {
        it('should fail', () => {
          expect(() => {
            parseFromFiles(['../../__test-files__/folder.jdl']);
          }).toThrow(new RegExp("The passed file '../../__test-files__/folder.jdl' must exist and must not be a directory to be read."));
        });
      });
    });
    describe('when passing valid arguments', () => {
      describe('when passing an empty file', () => {
        beforeEach(() => {
          fs.writeFileSync(getTestFile('test_file.jdl'), '');
        });

        after(() => {
          fs.unlinkSync(getTestFile('test_file.jdl'));
        });

        it('should fail', () => {
          expect(() => {
            parseFromFiles([getTestFile('test_file.jdl')]);
          }).toThrow(/^File content must be passed, it is currently empty\.$/);
        });
      });
      describe('when passing a JDL file with an unknown option', () => {
        beforeEach(() => {
          fs.writeFileSync('test_file.jdl', 'enity A');
        });

        it('should fail', () => {
          expect(() => {
            parseFromFiles(['test_file.jdl']);
          }).toThrow("The option 'enity' does not exist.\n\tat line: 1, column: 1");
          const text = fs.readFileSync('test_file.jdl', 'utf8');
          const { diagnostics } = parse(text, getDefaultRuntime());
          expect(diagnostics.map(diagnostic => diagnostic.ruleId)).toEqual(['option.unknown']);
          expect(text.slice(diagnostics[0].range.start.offset, diagnostics[0].range.end.offset)).toBe('enity A');
        });
      });
      describe('when reading a single JDL file', () => {
        let content: ParsedJDLApplications;

        beforeEach(() => {
          content = parseFromFiles([getTestFile('valid_jdl.jdl')]);
        });

        it('should read it', () => {
          expect(content.entities.map(entity => entity.name)).toEqual(['A', 'B', 'C', 'D']);
          expect(content.relationships[0].from.injectedField).toBe('b');
          expect(content.relationships[0].to.injectedField).toBe('a');
        });
      });
      describe('when reading more than one JDL file', () => {
        let content: ParsedJDLApplications;

        beforeEach(() => {
          content = parseFromFiles([getTestFile('valid_jdl.jdl'), getTestFile('valid_jdl2.jdl')]);
        });

        it('should read them', () => {
          expect(content.entities.map(entity => entity.name)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
          expect(content.relationships).toHaveLength(2);
        });
      });
      describe('when a OneToOne relationship omits its owning source field', () => {
        it('reports the source side before the content reaches a converter', () => {
          const text = fs.readFileSync(getTestFile('valid_jdl.jdl'), 'utf8').replace('A{b} to B{a}', 'A to B{a}');
          const { diagnostics } = parse(text, getDefaultRuntime());
          expect(diagnostics.map(diagnostic => diagnostic.ruleId)).toEqual(['relationship.owner']);
          expect(diagnostics[0].range.start).toEqual({ offset: text.indexOf('A to B{a}'), line: 11, column: 3 });
          expect(text.slice(diagnostics[0].range.start.offset, diagnostics[0].range.end.offset)).toBe('A');
          expect(() => parseFromContent(text)).toThrow(
            'In the One-to-One relationship from A to B, the source entity must possess the destination, or you must invert the direction of the relationship.\n\tat line: 11, column: 3',
          );
        });
      });
      describe('when reading a complex JDL file', () => {
        let content: ParsedJDLApplications;

        beforeEach(() => {
          content = parseFromFiles([getTestFile('complex_jdl.jdl')]);
        });

        it('should read them', () => {
          expect(content).not.toBeNull();
        });
      });
      describe('when having multiple internal JDL comments', () => {
        it('should ignore them and does not fail', () => {
          expect(() => {
            parseFromFiles([getTestFile('multiple_jdl_comments.jdl')]);
          }).not.toThrow();
        });
      });
    });
  });
  describe('parseFromContent', () => {
    describe('when passing an invalid content', () => {
      it('should fail', () => {
        expect(() => {
          parseFromContent('');
        }).toThrow();
      });
    });
    describe('when passing a valid content', () => {
      let content: ParsedJDLApplications;

      beforeEach(() => {
        content = parseFromContent('entity A');
      });

      it('should not fail', () => {
        expect(content).not.toBeNull();
      });
    });
  });
  describe('when parsing a JDL application', () => {
    let parsed: ParsedJDLApplications;

    beforeEach(() => {
      parsed = parseFromContent(`application {
    config {
        baseName toto
    }
    entities * except A
}
entity A
entity B
entity C
`);
    });

    it('should resolve the entity names inside the application', () => {
      expect(parsed.applications[0].entities).toEqual(['B', 'C']);
    });
  });
});
