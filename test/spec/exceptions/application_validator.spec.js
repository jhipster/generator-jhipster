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

const ApplicationValidator = require('../../../lib/exceptions/application_validator');

const ApplicationOptions = require('../../../lib/core/jhipster/application_options');
const { MONOLITH } = require('../../../lib/core/jhipster/application_types');
const { SQL, MYSQL, POSTGRESQL, MONGODB, CASSANDRA, COUCHBASE } = require('../../../lib/core/jhipster/database_types');

describe('ApplicationValidator', () => {
  let validator;

  before(() => {
    validator = new ApplicationValidator();
  });

  describe('validate', () => {
    context('when not passing any application config', () => {
      it('fails', () => {
        expect(() => {
          validator.validate();
        }).to.throw(/^No application\.$/);
        expect(() => {
          validator.validate({});
        }).to.throw(/^No application\.$/);
      });
    });
    context('when passing an application', () => {
      let basicValidApplication;

      beforeEach(() => {
        basicValidApplication = {
          baseName: 'toto',
          authenticationType: ApplicationOptions.authenticationType.jwt,
          buildTool: ApplicationOptions.buildTool.maven
        };
      });

      context('without the required options', () => {
        it('fails', () => {
          expect(() => {
            validator.validate({ config: { toto: 42 } });
          }).to.throw(/^The application attributes baseName, authenticationType, buildTool were not found\.$/);
        });
      });
      context('with no chosen language', () => {
        it('should fail', () => {
          expect(() => validator.validate({ config: { ...basicValidApplication, enableTranslation: true } })).to.throw(
            /^No chosen language\.$/
          );
        });
      });
      context('with invalid test framework values', () => {
        it('fails', () => {
          expect(() => {
            validator.validate({
              config: {
                ...basicValidApplication,
                testFrameworks: ['nothing']
              }
            });
          }).to.throw(/^Unknown value 'nothing' for option 'testFrameworks'\.$/);
        });
      });
      context('with different options for databaseType, devDatabaseType and prodDatabaseType', () => {
        context('mysql', () => {
          it('does not fail', () => {
            expect(() => {
              validator.validate({
                config: {
                  ...basicValidApplication,
                  databaseType: SQL,
                  devDatabaseType: MYSQL,
                  prodDatabaseType: MYSQL,
                  applicationType: MONOLITH
                }
              });
            }).not.to.throw();
          });
        });
        context('postgresql', () => {
          it('does not fail', () => {
            expect(() => {
              validator.validate({
                config: {
                  ...basicValidApplication,
                  databaseType: SQL,
                  devDatabaseType: 'h2Disk',
                  prodDatabaseType: POSTGRESQL,
                  applicationType: MONOLITH
                }
              });
            }).not.to.throw();
          });
        });
        context('mongodb', () => {
          it('does not fail', () => {
            expect(() => {
              validator.validate({
                config: {
                  ...basicValidApplication,
                  databaseType: MONGODB,
                  devDatabaseType: MONGODB,
                  prodDatabaseType: MONGODB,
                  applicationType: MONOLITH
                }
              });
            }).not.to.throw();
          });
        });
        context('cassandra', () => {
          it('does not fail', () => {
            expect(() => {
              validator.validate({
                config: {
                  ...basicValidApplication,
                  databaseType: CASSANDRA,
                  devDatabaseType: CASSANDRA,
                  prodDatabaseType: CASSANDRA,
                  applicationType: MONOLITH
                }
              });
            }).not.to.throw();
          });
        });
        context('couchbase', () => {
          it('does not fail', () => {
            expect(() => {
              validator.validate({
                config: {
                  ...basicValidApplication,
                  databaseType: COUCHBASE,
                  devDatabaseType: COUCHBASE,
                  prodDatabaseType: COUCHBASE,
                  applicationType: MONOLITH
                }
              });
            }).not.to.throw();
          });
        });
      });
      context('with an invalid combination for databaseType, devDatabaseType and prodDatabaseType', () => {
        context("for 'sql' as databaseType", () => {
          context('with an invalid prodDatabaseType', () => {
            it('fails', () => {
              expect(() => {
                validator.validate({
                  config: {
                    ...basicValidApplication,
                    databaseType: SQL,
                    devDatabaseType: ApplicationOptions.devDatabaseType.h2Memory,
                    prodDatabaseType: MONGODB
                  }
                });
              }).to.throw(
                /^Only 'mysql', 'postgresql', 'mariadb', 'oracle', 'mssql' are allowed as prodDatabaseType values for databaseType 'sql'\.$/
              );
            });
          });
          context('with an invalid devDatabaseType', () => {
            it('fails', () => {
              expect(() => {
                validator.validate({
                  config: {
                    ...basicValidApplication,
                    databaseType: SQL,
                    devDatabaseType: MYSQL,
                    prodDatabaseType: POSTGRESQL
                  }
                });
              }).to.throw(
                /^Only 'h2Memory', 'h2Disk', 'postgresql' are allowed as devDatabaseType values for databaseType 'sql'\.$/
              );
            });
          });
          context('with both devDatabaseType and prodDatabaseType as invalid values', () => {
            it('fails', () => {
              expect(() => {
                validator.validate({
                  config: {
                    ...basicValidApplication,
                    databaseType: SQL,
                    devDatabaseType: MONGODB,
                    prodDatabaseType: MONGODB
                  }
                });
              }).to.throw(
                /^Only 'mysql', 'postgresql', 'mariadb', 'oracle', 'mssql' are allowed as prodDatabaseType values for databaseType 'sql'\.$/
              );
            });
          });
        });
        context("for either 'mongodb', 'couchbase' or 'cassandra'", () => {
          context('when the devDatabaseType is not the same as the databaseType', () => {
            it('fails', () => {
              expect(() => {
                validator.validate({
                  config: {
                    ...basicValidApplication,
                    databaseType: MONGODB,
                    devDatabaseType: CASSANDRA,
                    prodDatabaseType: MONGODB
                  }
                });
              }).to.throw(
                /^When the databaseType is either 'mongodb', 'couchbase', 'cassandra', the devDatabaseType and prodDatabaseType must be the same\.$/
              );
            });
          });
          context('when the prodDatabaseType is not the same as the databaseType', () => {
            it('fails', () => {
              expect(() => {
                validator.validate({
                  config: {
                    databaseType: MONGODB,
                    devDatabaseType: MONGODB,
                    prodDatabaseType: CASSANDRA
                  }
                });
              }).to.throw(/^The application attributes baseName, authenticationType, buildTool were not found\.$/);
            });
          });
        });
      });
      context('with unknown options', () => {
        it('should fail', () => {
          expect(() => validator.validate({ config: { ...basicValidApplication, toto: 42 } })).to.throw(
            /^Unknown application option 'toto'\.$/
          );
        });
      });
      context('with unknown values', () => {
        context('because a boolean is expected', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                config: { ...basicValidApplication, enableTranslation: '42', nativeLanguage: 'fr' }
              })
            ).to.throw(/^Expected a boolean value for option 'enableTranslation'$/);
          });
        });
        context('because the value is unknown for a passed option', () => {
          it('should fail', () => {
            expect(() => validator.validate({ config: { ...basicValidApplication, clientFramework: 42 } })).to.throw(
              /^Unknown value '42' for option 'clientFramework'\.$/
            );
          });
        });
        context('because the databaseType value is unknown', () => {
          it('should fail', () => {
            expect(() => validator.validate({ config: { ...basicValidApplication, databaseType: 'toto' } })).to.throw(
              /^Unknown value 'toto' for option 'databaseType'\.$/
            );
          });
        });
        context('because the devDatabaseType value is unknown', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({ config: { ...basicValidApplication, databaseType: 'sql', devDatabaseType: 'toto' } })
            ).to.throw(/^Unknown value 'toto' for option 'devDatabaseType'\.$/);
          });
        });
        context('because the prodDatabaseType value is unknown', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate({
                config: {
                  ...basicValidApplication,
                  databaseType: 'sql',
                  devDatabaseType: 'mysql',
                  prodDatabaseType: 'toto'
                }
              })
            ).to.throw(/^Unknown value 'toto' for option 'prodDatabaseType'\.$/);
          });
        });
      });
    });
  });
});
