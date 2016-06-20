'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    JDLParser = require('../../../lib/dsl/jdl_parser');


describe('JDLParser', function () {
  describe('::parse', function () {
    describe('when passing invalid args', function() {
      describe('because there is no document', function() {
        it('fails', function() {
          try {
            JDLParser.parse(null, 'sql');
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because there is no database type', function() {
        it('fails', function() {
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
  });
});
