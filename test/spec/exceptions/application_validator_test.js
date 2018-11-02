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
const { expect } = require('chai');
const ApplicationOptions = require('../../../lib/core/jhipster/application_options');
const { MICROSERVICE, GATEWAY } = require('../../../lib/core/jhipster/application_types');
const { NO } = require('../../../lib/core/jhipster/database_types');
const { checkApplication } = require('../../../lib/exceptions/application_validator');

describe('ApplicationValidator', () => {
  describe('checkApplication', () => {
    context('when not passing any application config', () => {
      it('fails', () => {
        expect(() => {
          checkApplication();
        }).to.throw('An application must be passed to be validated.');
        expect(() => {
          checkApplication({});
        }).to.throw('An application must be passed to be validated.');
      });
    });
    context('when passing an application', () => {
      context('with unknown options', () => {
        it('fails', () => {
          expect(() => {
            checkApplication({ config: { toto: 42 } });
          }).to.throw("Unknown application option 'toto'.");
        });
      });
      context('with invalid values', () => {
        it('fails', () => {
          expect(() => {
            checkApplication({ config: { devDatabaseType: 'nothing' } });
          }).to.throw("Unknown value 'nothing' for option 'devDatabaseType'.");
        });
      });
      context('with invalid test framework values', () => {
        it('fails', () => {
          expect(() => {
            checkApplication({ config: { testFrameworks: ['nothing'] } });
          }).to.throw("Unknown value 'nothing' for option 'testFrameworks'.");
        });
      });
      context("when having 'no' as database type value", () => {
        context('in a microservice without oauth2 authentication type', () => {
          it('does not fail', () => {
            expect(() => {
              checkApplication({
                config: {
                  databaseType: NO,
                  applicationType: MICROSERVICE,
                  authenticationType: ApplicationOptions.authenticationType.jwt
                }
              });
            }).not.to.throw();
          });
        });
        context('in a gateway with UAA authentication type', () => {
          it('does not fail', () => {
            expect(() => {
              checkApplication({
                config: {
                  databaseType: NO,
                  applicationType: GATEWAY,
                  authenticationType: ApplicationOptions.authenticationType.uaa
                }
              });
            }).not.to.throw();
          });
        });
        context('in an invalid case', () => {
          it('fails', () => {
            expect(() => {
              checkApplication({
                config: {
                  databaseType: NO,
                  applicationType: MICROSERVICE,
                  authenticationType: ApplicationOptions.authenticationType.oauth2
                }
              });
            }).to.throw(
              'Having no database type is only allowed for microservices without oauth2 authentication type ' +
                'and gateways with UAA authentication type.'
            );
          });
        });
      });
    });
  });
});
