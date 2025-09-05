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

import { after, beforeEach, describe, it } from 'esmocha';
import fs from 'node:fs';

import { expect } from 'chai';
import helpers from 'yeoman-test';

import { getTestFile, parseFromContent, parseFromFiles } from '../__test-support__/index.ts';
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
          }).to.throw(/^The files must be passed to be parsed\.$/);
        });
      });
      describe('such as an empty array', () => {
        it('should fail', () => {
          expect(() => {
            parseFromFiles([]);
          }).to.throw(/^The files must be passed to be parsed\.$/);
        });
      });
      describe("such as files without the '.jh' or '.jdl' file extension", () => {
        it('should fail', () => {
          expect(() => {
            parseFromFiles(['../../__test-files__/invalid_file.txt']);
          }).to.throw(new RegExp("The passed file '../../__test-files__/invalid_file.txt' must end with '.jh' or '.jdl' to be valid."));
        });
      });
      describe('such as files that do not exist', () => {
        it('should fail', () => {
          expect(() => {
            parseFromFiles(['nofile.jh']);
          }).to.throw(new RegExp("The passed file 'nofile.jh' must exist and must not be a directory to be read."));
        });
      });
      describe('such as folders', () => {
        it('should fail', () => {
          expect(() => {
            parseFromFiles(['../../__test-files__/folder.jdl']);
          }).to.throw(new RegExp("The passed file '../../__test-files__/folder.jdl' must exist and must not be a directory to be read."));
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
          }).to.throw(/^File content must be passed, it is currently empty\.$/);
        });
      });
      describe('when passing a JDL file with a syntax error', () => {
        beforeEach(() => {
          fs.writeFileSync('test_file.jdl', 'enity A');
        });

        it('should fail', () => {
          expect(() => {
            parseFromFiles(['test_file.jdl']);
          }).to.throw(/but found: 'enity'/);
        });
      });
      describe('when reading a single JDL file', () => {
        let content: ParsedJDLApplications;

        beforeEach(() => {
          content = parseFromFiles([getTestFile('valid_jdl.jdl')]);
        });

        it('should read it', () => {
          expect(content).not.to.be.null;
        });
      });
      describe('when reading more than one JDL file', () => {
        let content: ParsedJDLApplications;

        beforeEach(() => {
          content = parseFromFiles([getTestFile('valid_jdl.jdl'), getTestFile('valid_jdl2.jdl')]);
        });

        it('should read them', () => {
          expect(content).not.to.be.null;
        });
      });
      describe('when reading a complex JDL file', () => {
        let content: ParsedJDLApplications;

        beforeEach(() => {
          content = parseFromFiles([getTestFile('complex_jdl.jdl')]);
        });

        it('should read them', () => {
          expect(content).not.to.be.null;
        });
      });
      describe('when having multiple internal JDL comments', () => {
        it('should ignore them and does not fail', () => {
          expect(() => {
            parseFromFiles([getTestFile('multiple_jdl_comments.jdl')]);
          }).not.to.throw();
        });
      });
    });
  });
  describe('parseFromContent', () => {
    describe('when passing an invalid content', () => {
      it('should fail', () => {
        expect(() => {
          parseFromContent('');
        }).to.throw();
      });
    });
    describe('when passing a valid content', () => {
      let content: ParsedJDLApplications;

      beforeEach(() => {
        content = parseFromContent('entity A');
      });

      it('should not fail', () => {
        expect(content).not.to.be.null;
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
      expect(parsed.applications[0].entities).to.deep.equal(['B', 'C']);
    });
  });
});
