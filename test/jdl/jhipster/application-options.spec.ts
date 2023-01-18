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
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { applicationOptions } from '../../../jdl/jhipster/index.mjs';

const { OptionNames, doesOptionExist, getTypeForOption, shouldTheValueBeQuoted } = applicationOptions;

describe('jdl - ApplicationOptions', () => {
  describe('doesOptionExist', () => {
    context('when not passing anything', () => {
      it('should return false', () => {
        // @ts-expect-error
        expect(doesOptionExist()).to.be.false;
      });
    });
    context('when passing an option that does not exist', () => {
      it('should return false', () => {
        expect(doesOptionExist('toto')).to.be.false;
      });
    });
    context('when passing an option that exists', () => {
      it('should return true', () => {
        expect(doesOptionExist('baseName')).to.be.true;
      });
    });
  });
  describe('getTypeForOption', () => {
    context('when not passing anything', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => getTypeForOption()).to.throw(/^A name has to be passed to get the option type.$/);
      });
    });
    context('when passing an unknown option name', () => {
      it('should fail', () => {
        expect(() => getTypeForOption('tutu')).to.throw(/^Unrecognised application option name: tutu.$/);
      });
    });
    context('when passing an option', () => {
      context('that has the string type', () => {
        it("should return 'string'", () => {
          expect(getTypeForOption('baseName')).to.equal('string');
        });
      });
      context('that has the integer type', () => {
        it("should return 'integer'", () => {
          expect(getTypeForOption('serverPort')).to.equal('integer');
        });
      });
      context('that has the boolean type', () => {
        it("should return 'boolean'", () => {
          expect(getTypeForOption('skipServer')).to.equal('boolean');
        });
      });
      context('that has the list type', () => {
        it("should return 'list'", () => {
          expect(getTypeForOption('testFrameworks')).to.equal('list');
        });
      });
    });
  });
  describe('shouldTheValueBeQuoted', () => {
    const optionsThatShouldBeQuoted = new Set([
      OptionNames.JHIPSTER_VERSION,
      OptionNames.REMEMBER_ME_KEY,
      OptionNames.JWT_SECRET_KEY,
      OptionNames.GRADLE_ENTERPRISE_HOST,
    ]);
    const optionsThatShouldNotBeQuoted = new Set(
      Object.values(OptionNames).filter(optionName => !optionsThatShouldBeQuoted.has(optionName))
    );

    context('when not passing anything', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => shouldTheValueBeQuoted()).to.throw(/^An option name has to be passed to know whether it is quoted.$/);
      });
    });
    context('when passing an option for which the value should not be quoted', () => {
      optionsThatShouldNotBeQuoted.forEach(optionName => {
        context(`such as ${optionName}`, () => {
          it('should return false', () => {
            expect(shouldTheValueBeQuoted(optionName)).to.be.false;
          });
        });
      });
    });
    context('when passing an option for which the value should be quoted', () => {
      optionsThatShouldBeQuoted.forEach(optionName => {
        context(`such as ${optionName}`, () => {
          it('should return true', () => {
            expect(shouldTheValueBeQuoted(optionName)).to.be.true;
          });
        });
      });
    });
  });
});
