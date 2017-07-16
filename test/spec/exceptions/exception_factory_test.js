

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const BuildException = require('../../../lib/exceptions/exception_factory').BuildException;

describe('ExceptionFactory', () => {
  describe('::BuildException', () => {
    it('adds the \'Exception\' suffix to the names', () => {
      const exception = BuildException('Working', null);
      expect(exception.name).to.eq('WorkingException');
    });
    it('builds throwable objects', () => {
      try {
        throw new BuildException('Working', null);
      } catch (error) {
        expect(error.name).to.be.defined;
      }
    });
    describe('when only passing a name', () => {
      it('takes the name and adds no message', () => {
        const exception1 = BuildException('Working', null);
        const exception2 = BuildException('Working', '');
        expect(exception1.name).to.eq('WorkingException');
        expect(exception1.message).to.be.empty;
        expect(exception2.name).to.eq('WorkingException');
        expect(exception2.message).to.be.empty;
      });
    });
    describe('when only passing a message', () => {
      it('just adds the suffix and keeps the message', () => {
        const exception1 = BuildException(null, 'The message');
        const exception2 = BuildException('', 'The message');
        expect(exception1.name).to.eq('Exception');
        expect(exception1.message).to.eq('The message');
        expect(exception2.name).to.eq('Exception');
        expect(exception2.message).to.eq('The message');
      });
    });
    describe('when passing in a name and a message', () => {
      it('keeps both', () => {
        const exception = BuildException('Good', 'The message');
        expect(exception.name).to.eq('GoodException');
        expect(exception.message).to.eq('The message');
      });
    });
    describe('when not passing anything', () => {
      it('names the exception \'Exception\' and puts no message', () => {
        const exception = BuildException(null, null);
        expect(exception.name).to.eq('Exception');
        expect(exception.message).to.be.empty;
      });
    });
  });
});
