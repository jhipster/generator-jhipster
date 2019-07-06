/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const { expect } = require('chai');
const JDLValidation = require('../../../lib/core/jdl_validation');
const Validations = require('../../../lib/core/jhipster/validations');

describe('JDLValidation', () => {
  context('::new', () => {
    context('when not passing any argument', () => {
      let validation = null;

      before(() => {
        validation = new JDLValidation();
      });

      it("defaults on the 'required' validation", () => {
        expect(validation.name).to.eq('required');
        expect(validation.value).to.eq('');
      });
    });
    context('when passing arguments', () => {
      let validation = null;

      before(() => {
        validation = new JDLValidation({
          name: 'min',
          value: 42
        });
      });

      it('uses them', () => {
        expect(validation.name).to.eq('min');
        expect(validation.value).to.eq(42);
      });
    });
  });
  describe('::isValid', () => {
    context('when checking the validity of an invalid object', () => {
      context('because it is nil or invalid', () => {
        it('returns false', () => {
          expect(JDLValidation.isValid(null)).to.be.false;
          expect(JDLValidation.isValid(undefined)).to.be.false;
        });
      });
      context('without a name attribute', () => {
        it('returns false', () => {
          expect(JDLValidation.isValid({})).to.be.false;
        });
      });
      context('without a valid name attribute', () => {
        it('returns false', () => {
          expect(JDLValidation.isValid({ name: 'something' })).to.be.false;
        });
      });
      context('with a valid name but an invalid value', () => {
        it('returns false', () => {
          expect(JDLValidation.isValid({ name: Validations.MIN })).to.be.false;
        });
      });
    });
    context('when checking the validity of a valid object', () => {
      it('returns true', () => {
        expect(JDLValidation.isValid({ name: Validations.REQUIRED })).to.be.true;
        expect(
          JDLValidation.isValid({
            name: Validations.MIN,
            value: 42
          })
        ).to.be.true;
      });
    });
  });
  describe('#toString', () => {
    context('with no value', () => {
      let validation = null;

      before(() => {
        validation = new JDLValidation();
      });

      it('stringifies its content', () => {
        expect(validation.toString()).to.eq('required');
      });
    });
    context('with a value', () => {
      let validation = null;
      let args = {};

      before(() => {
        args = {
          name: 'min',
          value: 42
        };
        validation = new JDLValidation(args);
      });

      it('stringifies its content', () => {
        expect(validation.toString()).to.eq(`${args.name}(${args.value})`);
      });
    });
    context('when exporting a regexp pattern', () => {
      it('properly formats it', () => {
        expect(
          new JDLValidation({
            name: Validations.PATTERN,
            value: '[A-z0-9]'
          }).toString()
        ).to.equal('pattern(/[A-z0-9]/)');
      });
    });
  });
});
