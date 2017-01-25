'use strict';

const expect = require('chai').expect,
  buildException = require('../../../lib/exceptions/exception_factory').buildException;

describe('ExceptionFactory', function () {
  describe('::buildException', function () {
    it("adds the 'Exception' suffix to the names", function () {
      let exception = buildException('Working', null);
      expect(exception.name).to.eq('WorkingException');
    });
    it('builds throwable objects', function () {
      try {
        throw new buildException('Working', null);
      } catch (error) {
        expect(error.name).to.be.defined;
      }
    });
    describe('when only passing a name', function () {
      it('takes the name and adds no message', function () {
        let exception1 = buildException('Working', null);
        let exception2 = buildException('Working', '');
        expect(exception1.name).to.eq('WorkingException');
        expect(exception1.message).to.be.empty;
        expect(exception2.name).to.eq('WorkingException');
        expect(exception2.message).to.be.empty;
      });
    });
    describe('when only passing a message', function () {
      it("just adds the suffix and keeps the message", function () {
        let exception1 = buildException(null, 'The message');
        let exception2 = buildException('', 'The message');
        expect(exception1.name).to.eq('Exception');
        expect(exception1.message).to.eq('The message');
        expect(exception2.name).to.eq('Exception');
        expect(exception2.message).to.eq('The message');
      });
    });
    describe('when passing in a name and a message', function () {
      it('keeps both', function () {
        let exception = buildException('Good', 'The message');
        expect(exception.name).to.eq('GoodException');
        expect(exception.message).to.eq('The message');
      });
    });
    describe('when not passing anything', function () {
      it("names the exception 'Exception' and puts no message", function () {
        let exception = buildException(null, null);
        expect(exception.name).to.eq('Exception');
        expect(exception.message).to.be.empty;
      });
    });
  });
});
