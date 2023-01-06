/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

/* eslint-disable no-new, no-unused-expressions */
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as JDLReader from '../../../jdl/readers/jdl-reader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('jdl - JDLReader', () => {
  describe('parseFromFiles', () => {
    context('when passing invalid parameters', () => {
      context('such as nil', () => {
        it('should fail', () => {
          expect(() => {
            JDLReader.parseFromFiles(null);
          }).to.throw(/^The files must be passed to be parsed\.$/);
        });
      });
      context('such as an empty array', () => {
        it('should fail', () => {
          expect(() => {
            JDLReader.parseFromFiles([]);
          }).to.throw(/^The files must be passed to be parsed\.$/);
        });
      });
      context("such as files without the '.jh' or '.jdl' file extension", () => {
        it('should fail', () => {
          expect(() => {
            JDLReader.parseFromFiles(['../../test-files/invalid_file.txt']);
          }).to.throw(new RegExp("The passed file '../../test-files/invalid_file.txt' must end with '.jh' or '.jdl' to be valid."));
        });
      });
      context('such as files that do not exist', () => {
        it('should fail', () => {
          expect(() => {
            JDLReader.parseFromFiles(['nofile.jh']);
          }).to.throw(new RegExp("The passed file 'nofile.jh' must exist and must not be a directory to be read."));
        });
      });
      context('such as folders', () => {
        it('should fail', () => {
          expect(() => {
            JDLReader.parseFromFiles(['../../test-files/folder.jdl']);
          }).to.throw(new RegExp("The passed file '../../test-files/folder.jdl' must exist and must not be a directory to be read."));
        });
      });
    });
    context('when passing valid arguments', () => {
      context('when passing an empty file', () => {
        before(() => {
          fs.writeFileSync(path.join(__dirname, '..', 'test-files', 'test_file.jdl'), '');
        });

        after(() => {
          fs.unlinkSync(path.join(__dirname, '..', 'test-files', 'test_file.jdl'));
        });

        it('should fail', () => {
          expect(() => {
            JDLReader.parseFromFiles([path.join(__dirname, '..', 'test-files', 'test_file.jdl')]);
          }).to.throw(/^File content must be passed, it is currently empty\.$/);
        });
      });
      context('when passing a JDL file with a syntax error', () => {
        before(() => {
          fs.writeFileSync(path.join(__dirname, '..', 'test-files', 'test_file.jdl'), 'enity A');
        });

        after(() => {
          fs.unlinkSync(path.join(__dirname, '..', 'test-files', 'test_file.jdl'));
        });

        it('should fail', () => {
          expect(() => {
            JDLReader.parseFromFiles([path.join(__dirname, '..', 'test-files', 'test_file.jdl')]);
          }).to.throw(/but found: 'enity'/);
        });
      });
      context('when reading a single JDL file', () => {
        let content;

        before(() => {
          content = JDLReader.parseFromFiles([path.join(__dirname, '..', 'test-files', 'valid_jdl.jdl')]);
        });

        it('should read it', () => {
          expect(content).not.to.be.null;
        });
      });
      context('when reading more than one JDL file', () => {
        let content;

        before(() => {
          content = JDLReader.parseFromFiles([
            path.join(__dirname, '..', 'test-files', 'valid_jdl.jdl'),
            path.join(__dirname, '..', 'test-files', 'valid_jdl2.jdl'),
          ]);
        });

        it('should read them', () => {
          expect(content).not.to.be.null;
        });
      });
      context('when reading a complex JDL file', () => {
        let content;

        before(() => {
          content = JDLReader.parseFromFiles([path.join(__dirname, '..', 'test-files', 'complex_jdl.jdl')]);
        });

        it('should read them', () => {
          expect(content).not.to.be.null;
        });
      });
      context('when having multiple internal JDL comments', () => {
        it('should ignore them and does not fail', () => {
          expect(() => {
            JDLReader.parseFromFiles([path.join(__dirname, '..', 'test-files', 'multiple_jdl_comments.jdl')]);
          }).not.to.throw();
        });
      });
    });
  });
  describe('parseFromContent', () => {
    context('when passing an invalid content', () => {
      it('should fail', () => {
        expect(() => {
          JDLReader.parseFromContent('');
        }).to.throw();
      });
    });
    context('when passing a valid content', () => {
      let content;

      before(() => {
        content = JDLReader.parseFromContent('entity A');
      });

      it('should not fail', () => {
        expect(content).not.to.be.null;
      });
    });
  });
  context('when parsing a JDL application', () => {
    let parsed;

    before(() => {
      parsed = JDLReader.parseFromContent(`application {
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
