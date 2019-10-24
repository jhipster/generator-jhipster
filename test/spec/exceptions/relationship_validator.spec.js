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
const JDLRelationship = require('../../../lib/core/jdl_relationship');
const RelationshipValidator = require('../../../lib/exceptions/relationship_validator');

const { JPA_DERIVED_IDENTIFIER } = require('../../../lib/core/jhipster/relationship_options');
const { ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY } = require('../../../lib/core/jhipster/relationship_types');

describe('RelationshipValidator', () => {
  let validator;

  before(() => {
    validator = new RelationshipValidator();
  });

  describe('validate', () => {
    context('when not passing anything', () => {
      it('should fail', () => {
        expect(() => validator.validate()).to.throw(/^No relationship\.$/);
      });
    });
    context('when passing a relationship', () => {
      context('with all its required attributes', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: ONE_TO_ONE,
            injectedFieldInTo: 'a',
            injectedFieldInFrom: 'b'
          });
        });

        it('should not fail', () => {
          expect(() => validator.validate(relationship)).not.to.throw();
        });
      });
      context('with an invalid type', () => {
        let relationship;

        before(() => {
          relationship = {
            from: 'A',
            to: 'B',
            type: 'toto',
            injectedFieldInTo: 'a'
          };
        });

        it('should fail', () => {
          expect(() => validator.validate(relationship)).to.throw(/^The relationship type 'toto' doesn't exist\.$/);
        });
      });
      context('without any injected field', () => {
        let relationship;

        before(() => {
          relationship = {
            from: 'A',
            to: 'B',
            type: ONE_TO_ONE
          };
        });

        it('should fail', () => {
          expect(() => validator.validate(relationship)).to.throw(/^At least one injected field is required\.$/);
        });
      });
      context(`when using the ${JPA_DERIVED_IDENTIFIER} option`, () => {
        context(`in a ${ONE_TO_ONE} relationship`, () => {
          let relationship;

          before(() => {
            relationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
              options: { [JPA_DERIVED_IDENTIFIER]: true }
            });
          });

          it('should not fail', () => {
            expect(() => validator.validate(relationship)).not.to.throw();
          });
        });
        [ONE_TO_MANY, MANY_TO_MANY, MANY_TO_ONE].forEach(type => {
          context(`in a ${type} relationship`, () => {
            let relationship;

            before(() => {
              relationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type,
                injectedFieldInTo: 'a',
                options: { [JPA_DERIVED_IDENTIFIER]: true }
              });
            });

            it('should fail', () => {
              expect(() => validator.validate(relationship)).to.throw(
                /^Only a OneToOne relationship can have the 'jpaDerivedIdentifier' option\.$/
              );
            });
          });
        });
      });
      context('when having a reflexive relationship', () => {
        context('with both sides being required', () => {
          let relationship;

          before(() => {
            relationship = {
              from: 'A',
              to: 'A',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'aa',
              isInjectedFieldInFromRequired: true
            };
          });

          it('should fail', () => {
            expect(() => validator.validate(relationship)).to.throw(
              /^Required relationships to the same entity are not supported, for relationship from and to 'A'\.$/
            );
          });
        });
      });
    });
  });
});
