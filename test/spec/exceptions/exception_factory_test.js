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
        expect(error.name).not.to.be.undefined;
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
