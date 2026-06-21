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

import { before, describe, expect, it } from 'esmocha';

import { validations } from '../built-in-options/index.ts';

import JDLValidation from './jdl-validation.ts';

const {
  Validations: { PATTERN },
} = validations;

describe('jdl - JDLValidation', () => {
  describe('new', () => {
    describe('when not passing any argument', () => {
      let validation: JDLValidation;

      before(() => {
        // @ts-expect-error
        validation = new JDLValidation();
      });

      it("should default on the 'required' validation", () => {
        expect(validation.name).toBe('required');
        expect(validation.value).toBe('');
      });
    });
    describe('when passing arguments', () => {
      let validation: JDLValidation;

      before(() => {
        validation = new JDLValidation({
          name: 'min',
          value: 42,
        });
      });

      it('should use them', () => {
        expect(validation.name).toBe('min');
        expect(validation.value).toBe(42);
      });
    });
  });
  describe('toString', () => {
    describe('with no value', () => {
      let validation: JDLValidation;

      before(() => {
        // @ts-expect-error
        validation = new JDLValidation();
      });

      it('should stringify its content', () => {
        expect(validation.toString()).toBe('required');
      });
    });
    describe('with a value', () => {
      let validation: JDLValidation;
      let args: any = {};

      before(() => {
        args = {
          name: 'min',
          value: 42,
        };
        validation = new JDLValidation(args);
      });

      it('should stringify its content', () => {
        expect(validation.toString()).toBe(`${args.name}(${args.value})`);
      });
    });
    describe('when exporting a regexp pattern', () => {
      it('should format it', () => {
        expect(
          new JDLValidation({
            name: PATTERN,
            value: '[A-z0-9]',
          }).toString(),
        ).toBe('pattern(/[A-z0-9]/)');
      });
    });
  });
});
