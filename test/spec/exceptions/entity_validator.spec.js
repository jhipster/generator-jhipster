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

const { expect } = require('chai');
const JDLEntity = require('../../../lib/core/jdl_entity');
const EntityValidator = require('../../../lib/exceptions/entity_validator');

describe('EntityValidator', () => {
  let validator;

  before(() => {
    validator = new EntityValidator();
  });

  describe('validate', () => {
    context('when not passing an entity', () => {
      it('should fail', () => {
        expect(() => validator.validate()).to.throw(/^No entity\.$/);
      });
    });
    context('when passing an entity', () => {
      context('with every required attribute', () => {
        it('should not fail', () => {
          expect(() =>
            validator.validate(
              new JDLEntity({
                name: 'A'
              })
            )
          ).not.to.throw();
        });
      });
      context('without any attribute', () => {
        it('should fail', () => {
          expect(() => validator.validate({})).to.throw(/^The entity attributes name, tableName were not found\.$/);
        });
      });
      context('without fields', () => {
        it('should fail', () => {
          it('should fail', () => {
            expect(() => validator.validate({ name: 'A', tableName: 'a' })).to.throw(
              /^The entity attributes name, tableName were not found\.$/
            );
          });
        });
      });
    });
  });
});
