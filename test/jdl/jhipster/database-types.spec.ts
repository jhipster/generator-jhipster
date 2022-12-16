/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import databaseTypes from '../../../jdl/jhipster/database-types.js';

const { isSql, CASSANDRA, COUCHBASE, MARIADB, MONGODB, MSSQL, MYSQL, NO, ORACLE, POSTGRESQL, SQL } = databaseTypes;

describe('DatabaseTypes', () => {
  describe('isSql', () => {
    context('when not passing anything', () => {
      it('should return false', () => {
        expect(isSql()).to.be.false;
      });
    });
    context('when passing a SQL database type', () => {
      [SQL, MYSQL, POSTGRESQL, ORACLE, MARIADB, MSSQL].forEach(databaseType => {
        context(`such as ${databaseType}`, () => {
          it('should return true', () => {
            expect(isSql(databaseType)).to.be.true;
          });
        });
      });
    });
    context('when not passing a SQL database type', () => {
      [MONGODB, CASSANDRA, COUCHBASE, NO].forEach(databaseType => {
        context(`such as ${databaseType}`, () => {
          it('should return false', () => {
            expect(isSql(databaseType)).to.be.false;
          });
        });
      });
    });
  });
});
