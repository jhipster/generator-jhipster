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
const ApplicationOptions = require('../../../lib/core/jhipster/application_options');
const { MONOLITH } = require('../../../lib/core/jhipster/application_types');
const { SQL, MYSQL, POSTGRESQL, MONGODB, CASSANDRA, COUCHBASE } = require('../../../lib/core/jhipster/database_types');
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
      context('with different options for databaseType, devDatabaseType and prodDatabaseType', () => {
        context('mysql', () => {
          it('does not fail', () => {
            expect(() => {
              checkApplication({
                config: {
                  databaseType: SQL,
                  devDatabaseType: 'h2Disk',
                  prodDatabaseType: MYSQL,
                  applicationType: MONOLITH,
                  authenticationType: ApplicationOptions.authenticationType.jwt
                }
              });
            }).not.to.throw();
          });
          it('does not fail', () => {
            expect(() => {
              checkApplication({
                config: {
                  databaseType: SQL,
                  devDatabaseType: MYSQL,
                  prodDatabaseType: MYSQL,
                  applicationType: MONOLITH,
                  authenticationType: ApplicationOptions.authenticationType.jwt
                }
              });
            }).not.to.throw();
          });
        });
        context('postgresql', () => {
          it('does not fail', () => {
            expect(() => {
              checkApplication({
                config: {
                  databaseType: SQL,
                  devDatabaseType: 'h2Disk',
                  prodDatabaseType: POSTGRESQL,
                  applicationType: MONOLITH,
                  authenticationType: ApplicationOptions.authenticationType.jwt
                }
              });
            }).not.to.throw();
          });
          it('does not fail', () => {
            expect(() => {
              checkApplication({
                config: {
                  databaseType: SQL,
                  devDatabaseType: POSTGRESQL,
                  prodDatabaseType: POSTGRESQL,
                  applicationType: MONOLITH,
                  authenticationType: ApplicationOptions.authenticationType.jwt
                }
              });
            }).not.to.throw();
          });
        });
        context('mongodb', () => {
          it('does not fail', () => {
            expect(() => {
              checkApplication({
                config: {
                  databaseType: MONGODB,
                  devDatabaseType: MONGODB,
                  prodDatabaseType: MONGODB,
                  applicationType: MONOLITH,
                  authenticationType: ApplicationOptions.authenticationType.jwt
                }
              });
            }).not.to.throw();
          });
        });
        context('cassandra', () => {
          it('does not fail', () => {
            expect(() => {
              checkApplication({
                config: {
                  databaseType: CASSANDRA,
                  devDatabaseType: CASSANDRA,
                  prodDatabaseType: CASSANDRA,
                  applicationType: MONOLITH,
                  authenticationType: ApplicationOptions.authenticationType.jwt
                }
              });
            }).not.to.throw();
          });
        });
        context('couchbase', () => {
          it('does not fail', () => {
            expect(() => {
              checkApplication({
                config: {
                  databaseType: COUCHBASE,
                  devDatabaseType: COUCHBASE,
                  prodDatabaseType: COUCHBASE,
                  applicationType: MONOLITH,
                  authenticationType: ApplicationOptions.authenticationType.jwt
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
                checkApplication({
                  config: {
                    databaseType: SQL,
                    devDatabaseType: ApplicationOptions.devDatabaseType.h2Memory,
                    prodDatabaseType: MONGODB
                  }
                });
              }).to.throw(
                "Only 'mysql', 'postgresql', 'mariadb', 'oracle', 'mssql' are allowed as prodDatabaseType values for " +
                  "databaseType 'sql'."
              );
            });
          });
          context('with an invalid devDatabaseType', () => {
            it('fails', () => {
              expect(() => {
                checkApplication({
                  config: {
                    databaseType: SQL,
                    devDatabaseType: MYSQL,
                    prodDatabaseType: POSTGRESQL
                  }
                });
              }).to.throw(
                "Only 'h2Memory', 'h2Disk', 'postgresql' are allowed as devDatabaseType values for databaseType 'sql'."
              );
            });
          });
          context('with both devDatabaseType and prodDatabaseType as invalid values', () => {
            it('fails', () => {
              expect(() => {
                checkApplication({
                  config: {
                    databaseType: SQL,
                    devDatabaseType: MONGODB,
                    prodDatabaseType: MONGODB
                  }
                });
              }).to.throw(
                "Only 'mysql', 'postgresql', 'mariadb', 'oracle', 'mssql' are allowed as prodDatabaseType values for " +
                  "databaseType 'sql'."
              );
            });
          });
        });
        context("for either 'mongodb', 'couchbase' or 'cassandra'", () => {
          context('when the devDatabaseType is not the same as the databaseType', () => {
            it('fails', () => {
              expect(() => {
                checkApplication({
                  config: {
                    databaseType: MONGODB,
                    devDatabaseType: CASSANDRA,
                    prodDatabaseType: MONGODB
                  }
                });
              }).to.throw(
                "When the databaseType is either 'mongodb', 'couchbase', 'cassandra', the devDatabaseType and " +
                  'prodDatabaseType must be the same.'
              );
            });
          });
          context('when the prodDatabaseType is not the same as the databaseType', () => {
            it('fails', () => {
              expect(() => {
                checkApplication({
                  config: {
                    databaseType: MONGODB,
                    devDatabaseType: MONGODB,
                    prodDatabaseType: CASSANDRA
                  }
                });
              }).to.throw(
                "When the databaseType is either 'mongodb', 'couchbase', 'cassandra', the devDatabaseType and " +
                  'prodDatabaseType must be the same.'
              );
            });
          });
        });
      });
    });
  });
});
