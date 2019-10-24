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

const { matchField } = require('../../matchers/field_matcher');
const JDLField = require('../../../lib/core/jdl_field');
const JDLValidation = require('../../../lib/core/jdl_validation');
const Validations = require('../../../lib/core/jhipster/validations');

describe('JDLField', () => {
  describe('::new', () => {
    context('when not passing any argument', () => {
      it('fails', () => {
        expect(() => {
          new JDLField();
        }).to.throw('The field name and type are mandatory to create a field.');
      });
    });
    context('when not passing the name', () => {
      it('fails', () => {
        expect(() => {
          new JDLField({ name: null, type: 'String' });
        }).to.throw('The field name and type are mandatory to create a field.');
      });
    });
    context('when not passing the type', () => {
      it('fails', () => {
        expect(() => {
          new JDLField({ name: 'abc', type: null });
        }).to.throw('The field name and type are mandatory to create a field.');
      });
    });
    context('when passing arguments', () => {
      let args = {};
      let field = null;

      before(() => {
        args = {
          name: 'abc',
          type: 'String',
          comment: 'comment',
          validations: [new JDLValidation()]
        };
        field = new JDLField(args);
      });

      it('creates a new instance', () => {
        expect(field).to.satisfy(matchField);
      });
    });
    context('when passing a reserved keyword as name', () => {
      it('fails', () => {
        expect(() => {
          new JDLField({ name: 'class', type: 'String' });
        }).to.throw('The field name cannot be a reserved keyword, got: class.');
      });
    });
  });
  describe('#addValidation', () => {
    let field = null;

    before(() => {
      field = new JDLField({
        name: 'abc',
        type: 'String',
        comment: 'comment'
      });
    });

    context('when adding an invalid validation', () => {
      context('because it is null', () => {
        it('fails', () => {
          expect(() => {
            field.addValidation(null);
          }).to.throw(/^Can't add invalid validation\. Error: No validation\.$/);
        });
      });
      context('because there is no value where it should', () => {
        it('fails', () => {
          expect(() => {
            field.addValidation({ name: Validations.MIN });
          }).to.throw(/^Can't add invalid validation\. Error: The validation min requires a value\.$/);
        });
      });
    });
    context('when adding a valid validation', () => {
      let validation = null;

      before(() => {
        validation = { name: Validations.MIN, value: 42 };
        field.addValidation(validation);
      });

      it('works', () => {
        field.forEachValidation(validation => {
          expect(validation.name).to.equal(Validations.MIN);
          expect(validation.value).to.equal(42);
        });
      });
    });
  });
  describe('#forEachValidation', () => {
    context('when not passing a function', () => {
      let field;

      before(() => {
        field = new JDLField({
          name: 'toto',
          type: 'String'
        });
      });

      it('should fail', () => {
        expect(() => field.forEachValidation()).to.throw();
      });
    });
    context('when passing a function', () => {
      let result;

      before(() => {
        const field = new JDLField({
          name: 'toto',
          type: 'String'
        });
        field.addValidation({
          name: 'required'
        });
        field.addValidation({
          name: 'min',
          value: 0
        });
        result = '';
        field.forEachValidation(validation => {
          result += `${validation.name}`;
        });
      });

      it('should iterate over the fields', () => {
        expect(result).to.equal('requiredmin');
      });
    });
  });
  describe('#toString', () => {
    context('without comment', () => {
      let args = {};
      let field = null;

      before(() => {
        args = {
          name: 'abc',
          type: 'String'
        };
        field = new JDLField(args);
      });

      it('stringifies the fields', () => {
        expect(field.toString()).to.eq(`${args.name} ${args.type}`);
      });
    });
    context('without any validation', () => {
      let args = {};
      let field = null;

      before(() => {
        args = {
          name: 'abc',
          type: 'String',
          comment: 'comment'
        };
        field = new JDLField(args);
      });

      it('stringifies the fields', () => {
        expect(field.toString()).to.eq(`/**\n * ${args.comment}\n */\n${args.name} ${args.type}`);
      });
    });
    context('with everything', () => {
      let args = {};
      let field = null;

      before(() => {
        args = {
          name: 'abc',
          type: 'String',
          comment: 'comment',
          validations: [
            new JDLValidation(),
            new JDLValidation({
              name: 'minlength',
              value: 42
            })
          ]
        };
        field = new JDLField(args);
      });

      it('stringifies the field', () => {
        expect(field.toString()).to.eq(
          `/**\n * ${args.comment}\n */\n` +
            `${args.name} ${args.type} ${args.validations[0].name} ` +
            `${args.validations[1].name}(${args.validations[1].value})`
        );
      });
    });
  });
});
