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
const JDLReader = require('../../../lib/reader/jdl_reader');

describe('JDLReader', () => {
  describe('::parseFromFiles', () => {
    context('when passing invalid parameters', () => {
      context('such as nil', () => {
        it('throws an error', () => {
          expect(() => {
            JDLReader.parseFromFiles(null);
          }).to.throw('The files must be passed.');
        });
      });
      context('such as an empty array', () => {
        it('throws an error', () => {
          expect(() => {
            JDLReader.parseFromFiles([]);
          }).to.throw('The files must be passed.');
        });
      });
      context('such as files without the \'.jh\' or \'.jdl\' file extension', () => {
        it('throws an error', () => {
          expect(() => {
            JDLReader.parseFromFiles(['../../test_files/invalid_file.txt']);
          }).to.throw('The passed file \'../../test_files/invalid_file.txt\' must end ' +
            'with \'.jh\' or \'.jdl\' to be valid.');
        });
      });
      context('such as files that do not exist', () => {
        it('throws an error', () => {
          expect(() => {
            JDLReader.parseFromFiles(['nofile.jh']);
          }).to.throw('The passed file \'nofile.jh\' must exist and must not be a directory.');
        });
      });
      context('such as folders', () => {
        it('throws an error', () => {
          expect(() => {
            JDLReader.parseFromFiles(['../../test_files/folder.jdl']);
          }).to.throw('The passed file \'../../test_files/folder.jdl\' must exist and must not be a directory.');
        });
      });
    });
    context('when passing valid arguments', () => {
      context('when passing an empty file', () => {
        before(() => {
          fs.writeFileSync('./test/test_files/test_file.jdl', '');
        });

        after(() => {
          fs.unlinkSync('./test/test_files/test_file.jdl');
        });

        it('fails', () => {
          expect(() => {
            JDLReader.parseFromFiles(['./test/test_files/test_file.jdl']);
          }).to.throw('File content must be passed in order to be parsed, it is currently empty.');
        });
      });
      context('when passing a JDL file with a syntax error', () => {
        before(() => {
          fs.writeFileSync('./test/test_files/test_file.jdl', 'enity A');
        });

        after(() => {
          fs.unlinkSync('./test/test_files/test_file.jdl');
        });

        it('fails', () => {
          expect(() => {
            JDLReader.parseFromFiles(['./test/test_files/test_file.jdl']);
          }).to.throw(SyntaxError);
        });
      });
      context('when reading a single JDL file', () => {
        let content = null;

        before(() => {
          content = JDLReader.parseFromFiles(['./test/test_files/valid_jdl.jdl']);
        });

        it('reads it', () => {
          expect(content).not.to.be.null;
        });
      });
      context('when reading more than one JDL file', () => {
        let content = null;

        before(() => {
          content = JDLReader.parseFromFiles(['./test/test_files/valid_jdl.jdl', './test/test_files/valid_jdl2.jdl']);
        });

        it('reads them', () => {
          expect(content).not.to.be.null;
        });
      });
      context('when reading a complex JDL file', () => {
        let content = null;

        before(() => {
          content = JDLReader.parseFromFiles(['./test/test_files/complex_jdl.jdl']);
        });

        it('reads them', () => {
          expect(content).not.to.be.null;
        });
      });
      context('when having multiple internal JDL comments', () => {
        it('ignores them and does not fail', () => {
          expect(() => {
            JDLReader.parseFromFiles(['./test/test_files/multiple_jdl_comments.jdl']);
          }).not.to.throw();
        });
      });
    });
  });
  describe('::lintFiles', () => {
    context('when passing invalid parameters', () => {
      context('such as nil', () => {
        it('throws an error', () => {
          expect(() => {
            JDLReader.lintFiles(null);
          }).to.throw('The files must be passed to be linted.');
        });
      });
      context('such as an empty array', () => {
        it('throws an error', () => {
          expect(() => {
            JDLReader.lintFiles([]);
          }).to.throw('The files must be passed to be linted.');
        });
      });
      context('such as files without the \'.jh\' or \'.jdl\' file extension', () => {
        it('throws an error', () => {
          expect(() => {
            JDLReader.lintFiles(['../../test_files/invalid_file.txt']);
          }).to.throw('The passed file \'../../test_files/invalid_file.txt\' must end ' +
            'with \'.jh\' or \'.jdl\' to be valid.');
        });
      });
      context('such as files that do not exist', () => {
        it('throws an error', () => {
          expect(() => {
            JDLReader.lintFiles(['nofile.jh']);
          }).to.throw('The passed file \'nofile.jh\' must exist and must not be a directory.');
        });
      });
      context('such as folders', () => {
        it('throws an error', () => {
          expect(() => {
            JDLReader.lintFiles(['../../test_files/folder.jdl']);
          }).to.throw('The passed file \'../../test_files/folder.jdl\' must exist and must not be a directory.');
        });
      });
    });
    context('when passing valid parameters', () => {
      context('when parsing a file containing useless curly braces', () => {
        let content = null;

        before(() => {
          content = JDLReader.lintFiles(['./test/test_files/lint/useless_curly_braces.jdl']);
        });

        it('counts it', () => {
          expect(content.errors.ENT_SHORTER_DECL).to.have.lengthOf(1);
        });
        it('tells which entity', () => {
          expect(content.errors.ENT_SHORTER_DECL[0].entityName).to.equal('B');
        });
      });
      context('when parsing a file containing useless table names', () => {
        let content = null;

        before(() => {
          content = JDLReader.lintFiles(['./test/test_files/lint/useless_table_names.jdl']);
        });

        it('counts it', () => {
          expect(content.errors.ENT_OPTIONAL_TABLE_NAME).to.have.lengthOf(3);
        });
        it('tells which entity', () => {
          expect(content.errors.ENT_OPTIONAL_TABLE_NAME[0]).to.deep.equal({ entityName: 'B' });
          expect(content.errors.ENT_OPTIONAL_TABLE_NAME[1]).to.deep.equal({ entityName: 'Toto' });
          expect(content.errors.ENT_OPTIONAL_TABLE_NAME[2]).to.deep.equal({ entityName: 'SuperToto' });
        });
      });
      context('when parsing a file containing un-grouped relationships', () => {
        let content = null;

        before(() => {
          content = JDLReader.lintFiles(['./test/test_files/lint/ungrouped_relationships.jdl']);
        });

        it('counts it', () => {
          expect(content.errors.REL_INDIVIDUAL_DECL).to.have.lengthOf(2);
        });
        it('tells which entity', () => {
          expect(content.errors.REL_INDIVIDUAL_DECL[0]).to.deep.equal({ from: 'B', to: 'C', type: 'one-to-many' });
          expect(content.errors.REL_INDIVIDUAL_DECL[1]).to.deep.equal({ from: 'A', to: 'C', type: 'one-to-many' });
        });
      });
    });
  });
});
