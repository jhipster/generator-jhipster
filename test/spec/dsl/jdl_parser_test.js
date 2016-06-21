'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles,
  JDLParser = require('../../../lib/dsl/jdl_parser');


describe('JDLParser', function () {
  describe('::parse', function () {
    describe('when passing invalid args', function () {
      describe('because there is no document', function () {
        it('fails', function () {
          try {
            JDLParser.parse(null, 'sql');
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because there is no database type', function () {
        it('fails', function () {
          try {
            JDLParser.parse({
              notNull: 42
            }, null);
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
    });
    describe('when passing valid args', function () {
      describe('with no error', function () {
        it('builds a JDLObject', function () {
          var input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
          var content = JDLParser.parse(input, 'sql');
          expect(content).not.to.be.null;
        });
      });
      describe('with an invalid field type', function () {
        it('fails', function () {
          // todo
        });
      });
      describe('with an absent validation for a field type', function () {
        it('fails', function () {
          // todo
        });
      });
      describe('with an invalid validation for a field type', function () {
        it('fails', function () {
          // todo
        });
      });
      describe('with an invalid option', function () {
        it('fails', function () {
          // todo
        });
      });
    });
  });
});
