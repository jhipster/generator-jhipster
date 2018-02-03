/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const fs = require('fs');

const fail = expect.fail;
const parse = require('../../../lib/reader/jdl_reader').parse;
const parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

describe('::parse', () => {
  context('when passing invalid parameters', () => {
    context('such as nil', () => {
      it('throws an error', () => {
        try {
          parse(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    context('such as an empty array', () => {
      it('throws an error', () => {
        try {
          parse('');
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
  });
  context('when passing valid arguments', () => {
    context('when reading JDL content', () => {
      const input = fs.readFileSync('./test/test_files/valid_jdl.jdl', 'utf-8').toString();
      const content = parse(input);
      it('reads it', () => {
        expect(content).not.to.be.null;
      });
    });
  });
  context('when passing an invalid JDL content', () => {
    it('fails', () => {
      try {
        parse('entiy A');
        fail();
      } catch (error) {
        expect(error.name).to.equal('SyntaxError');
      }
    });
  });
});
describe('::parseFromFiles', () => {
  context('when passing invalid parameters', () => {
    context('such as nil', () => {
      it('throws an error', () => {
        try {
          parseFromFiles(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    context('such as an empty array', () => {
      it('throws an error', () => {
        try {
          parseFromFiles([]);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    context('such as files without the \'.jh\' or \'.jdl\' file extension', () => {
      it('throws an error', () => {
        try {
          parseFromFiles(['../../test_files/invalid_file.txt']);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongFileException');
        }
      });
    });
    context('such as files that do not exist', () => {
      it('throws an error', () => {
        try {
          parseFromFiles(['nofile.jh']);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongFileException');
        }
      });
    });
    context('such as folders', () => {
      it('throws an error', () => {
        try {
          parseFromFiles(['../../test_files/folder.jdl']);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongFileException');
        }
      });
    });
  });
  context('when passing valid arguments', () => {
    context('when reading a single JDL file', () => {
      const content = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
      it('reads it', () => {
        expect(content).not.to.be.null;
      });
    });
    context('when reading more than one JDL file', () => {
      const content = parseFromFiles(['./test/test_files/valid_jdl.jdl', './test/test_files/valid_jdl2.jdl']);
      it('reads them', () => {
        expect(content).not.to.be.null;
      });
    });
    context('when reading a complex JDL file', () => {
      const content = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
      it('reads them', () => {
        expect(content).not.to.be.null;
      });
    });
    context('when having multiple internal JDL comments', () => {
      it('ignores them and does not fail', () => {
        try {
          parseFromFiles(['./test/test_files/multiple_jdl_comments.jdl']);
        } catch (error) {
          fail(error, null, error);
        }
      });
    });
  });
});
