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

/* eslint-disable no-new, no-unused-expressions */
import { expect } from 'chai';
import JDLValidation from '../../../jdl/models/jdl-validation.js';
import { validations } from '../../../jdl/jhipster/index.mjs';

const {
  Validations: { PATTERN },
} = validations;

describe('jdl - JDLValidation', () => {
  describe('new', () => {
    context('when not passing any argument', () => {
      let validation;

      before(() => {
        // @ts-expect-error
        validation = new JDLValidation();
      });

      it("should default on the 'required' validation", () => {
        expect(validation.name).to.equal('required');
        expect(validation.value).to.equal('');
      });
    });
    context('when passing arguments', () => {
      let validation;

      before(() => {
        validation = new JDLValidation({
          name: 'min',
          value: 42,
        });
      });

      it('should use them', () => {
        expect(validation.name).to.equal('min');
        expect(validation.value).to.equal(42);
      });
    });
  });
  describe('toString', () => {
    context('with no value', () => {
      let validation;

      before(() => {
        // @ts-expect-error
        validation = new JDLValidation();
      });

      it('should stringifiy its content', () => {
        expect(validation.toString()).to.equal('required');
      });
    });
    context('with a value', () => {
      let validation;
      let args: any = {};

      before(() => {
        args = {
          name: 'min',
          value: 42,
        };
        validation = new JDLValidation(args);
      });

      it('should stringifiy its content', () => {
        expect(validation.toString()).to.equal(`${args.name}(${args.value})`);
      });
    });
    context('when exporting a regexp pattern', () => {
      it('should format it', () => {
        expect(
          new JDLValidation({
            name: PATTERN,
            value: '[A-z0-9]',
          }).toString()
        ).to.equal('pattern(/[A-z0-9]/)');
      });
    });
  });
});
