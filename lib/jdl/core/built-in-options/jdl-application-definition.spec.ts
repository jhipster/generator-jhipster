/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { describe, expect, it } from 'esmocha';

import applicationOptions from '../../../jhipster/application-options.ts';
import { createRuntime } from '../runtime.ts';

const { OptionNames } = applicationOptions;

const { applicationDefinition } = createRuntime();

describe('jdl - ApplicationOptions', () => {
  describe('doesOptionExist', () => {
    describe('when not passing anything', () => {
      it('should return false', () => {
        // @ts-expect-error
        expect(applicationDefinition.doesOptionExist()).toBe(false);
      });
    });
    describe('when passing an option that does not exist', () => {
      it('should return false', () => {
        expect(applicationDefinition.doesOptionExist('toto')).toBe(false);
      });
    });
    describe('when passing an option that exists', () => {
      it('should return true', () => {
        expect(applicationDefinition.doesOptionExist('baseName')).toBe(true);
      });
    });
  });
  describe('getTypeForOption', () => {
    describe('when not passing anything', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => applicationDefinition.getTypeForOption()).toThrow(/^A name has to be passed to get the option type.$/);
      });
    });
    describe('when passing an unknown option name', () => {
      it('should fail', () => {
        expect(() => applicationDefinition.getTypeForOption('tutu')).toThrow(/^Unrecognised application option name: tutu.$/);
      });
    });
    describe('when passing an option', () => {
      describe('that has the string type', () => {
        it("should return 'string'", () => {
          expect(applicationDefinition.getTypeForOption('baseName')).toBe('string');
        });
      });
      describe('that has the integer type', () => {
        it("should return 'integer'", () => {
          expect(applicationDefinition.getTypeForOption('serverPort')).toBe('integer');
        });
      });
      describe('that has the boolean type', () => {
        it("should return 'boolean'", () => {
          expect(applicationDefinition.getTypeForOption('skipServer')).toBe('boolean');
        });
      });
      describe('that has the list type', () => {
        it("should return 'list'", () => {
          expect(applicationDefinition.getTypeForOption('testFrameworks')).toBe('list');
        });
      });
    });
  });
  describe('shouldTheValueBeQuoted', () => {
    const optionsThatShouldBeQuoted = new Set<string>([
      OptionNames.JHIPSTER_VERSION,
      OptionNames.REMEMBER_ME_KEY,
      OptionNames.JWT_SECRET_KEY,
      OptionNames.GRADLE_DEVELOCITY_HOST,
    ]);
    const optionsThatShouldNotBeQuoted = new Set<string>(
      Object.values(OptionNames).filter(optionName => !optionsThatShouldBeQuoted.has(optionName)),
    );

    describe('when not passing anything', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => applicationDefinition.shouldTheValueBeQuoted()).toThrow(
          /^An option name has to be passed to know whether it is quoted.$/,
        );
      });
    });
    describe('when passing an option for which the value should not be quoted', () => {
      optionsThatShouldNotBeQuoted.forEach(optionName => {
        describe(`such as ${optionName}`, () => {
          it('should return false', () => {
            expect(applicationDefinition.shouldTheValueBeQuoted(optionName)).toBe(false);
          });
        });
      });
    });
    describe('when passing an option for which the value should be quoted', () => {
      optionsThatShouldBeQuoted.forEach(optionName => {
        describe(`such as ${optionName}`, () => {
          it('should return true', () => {
            expect(applicationDefinition.shouldTheValueBeQuoted(optionName)).toBe(true);
          });
        });
      });
    });
  });
});
