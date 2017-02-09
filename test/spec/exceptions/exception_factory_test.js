'use strict';

const expect = require('chai').expect,
  buildException = require('../../../lib/exceptions/exception_factory').buildException;

describe('ExceptionFactory', () => {
  describe('::buildException', () => {
    it("adds the 'Exception' suffix to the names", () => {
      let exception = buildException('Working', null);
      expect(exception.name).to.eq('WorkingException');
    });
    it('builds throwable objects', () => {
      try {
        throw new buildException('Working', null);
      } catch (error) {
        expect(error.name).to.be.defined;
      }
    });
    describe('when only passing a name', () => {
      it('takes the name and adds no message', () => {
        let exception1 = buildException('Working', null);
        let exception2 = buildException('Working', '');
        expect(exception1.name).to.eq('WorkingException');
        expect(exception1.message).to.be.empty;
        expect(exception2.name).to.eq('WorkingException');
        expect(exception2.message).to.be.empty;
      });
    });
    describe('when only passing a message', () => {
      it("just adds the suffix and keeps the message", () => {
        let exception1 = buildException(null, 'The message');
        let exception2 = buildException('', 'The message');
        expect(exception1.name).to.eq('Exception');
        expect(exception1.message).to.eq('The message');
        expect(exception2.name).to.eq('Exception');
        expect(exception2.message).to.eq('The message');
      });
    });
    describe('when passing in a name and a message', () => {
      it('keeps both', () => {
        let exception = buildException('Good', 'The message');
        expect(exception.name).to.eq('GoodException');
        expect(exception.message).to.eq('The message');
      });
    });
    describe('when not passing anything', () => {
      it("names the exception 'Exception' and puts no message", () => {
        let exception = buildException(null, null);
        expect(exception.name).to.eq('Exception');
        expect(exception.message).to.be.empty;
      });
    });
  });
});
