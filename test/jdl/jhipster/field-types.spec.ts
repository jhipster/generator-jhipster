/* eslint-disable @typescript-eslint/no-empty-function */
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

/* eslint-disable no-new, no-unused-expressions */
import { expect } from 'chai';

import DatabaseTypes from '../../../jdl/jhipster/database-types.js';
import FieldTypes from '../../../jdl/jhipster/field-types.js';
import Validations from '../../../jdl/jhipster/validations.js';
import JDLEnum from '../../../jdl/models/jdl-enum.js';

describe('FieldTypes', () => {
  describe('isCommonDBType', () => {
    context('when passing an invalid argument', () => {
      it('should fail', () => {
        expect(() => {
          FieldTypes.isCommonDBType(null);
        }).to.throw(/^The passed type must not be nil\.$/);
        expect(() => {
          FieldTypes.isCommonDBType('');
        }).to.throw(/^The passed type must not be nil\.$/);
      });
    });
    context('when passing a false type', () => {
      it('should return false', () => {
        expect(FieldTypes.isCommonDBType('UNKNOWN-TYPE')).to.be.false;
      });
    });
    context('when passing a valid type', () => {
      it('should return true', () => {
        expect(FieldTypes.isCommonDBType(FieldTypes.CommonDBTypes.BIG_DECIMAL)).to.be.true;
      });
    });
    context('when passing an enum', () => {
      it('should return true', () => {
        expect(FieldTypes.isCommonDBType(new JDLEnum({ name: 'MyEnum' }))).to.be.true;
      });
    });
  });
  describe('getIsType', () => {
    context('when passing an invalid argument', () => {
      it('should fail', () => {
        expect(() => {
          FieldTypes.getIsType(null);
        }).to.throw(/^The passed type must not be nil\.$/);
        expect(() => {
          FieldTypes.getIsType(null, () => {
            // do nothing
          });
        }).to.throw(/^The passed type must not be nil\.$/);
      });
    });
    context('when passing a valid argument without callback', () => {
      it('should return isType', () => {
        expect(FieldTypes.getIsType('mysql')).to.equal(FieldTypes.isCommonDBType);
      });
    });
    context('when passing a valid argument and callback', () => {
      it('should return true', () => {
        expect(
          FieldTypes.getIsType('sql', () => {
            // do nothing
          })
        ).to.equal(FieldTypes.isCommonDBType);
      });
    });
    context('when passing an invalid argument', () => {
      it('should fail', () => {
        expect(() => {
          FieldTypes.getIsType('thing', () => {});
        }).to.throw(
          "The passed database type must either be 'sql', 'mysql', 'mariadb', 'postgresql'," +
            " 'oracle', 'mssql', 'mongodb', 'couchbase', 'neo4j' or 'cassandra'"
        );
      });
    });
    context("when passing 'no' as argument", () => {
      it('should not fail', () => {
        expect(() => {
          FieldTypes.getIsType(DatabaseTypes.NO, () => {});
        }).not.to.throw();
      });
    });
  });
  describe('hasValidation', () => {
    context('when passing an invalid argument', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          FieldTypes.hasValidation();
        }).to.throw(/^The passed type and value must not be nil\.$/);
        expect(() => {
          FieldTypes.hasValidation(null, Validations.MAXLENGTH);
        }).to.throw(/^The passed type and value must not be nil\.$/);
        expect(() => {
          // @ts-expect-error
          FieldTypes.hasValidation('UNKNOWN-TYPE');
        }).to.throw(/^The passed type and value must not be nil\.$/);
      });
    });
    context('when passing a false argument', () => {
      it('should return false', () => {
        expect(FieldTypes.hasValidation(FieldTypes.CommonDBTypes.BIG_DECIMAL, Validations.PATTERN)).to.be.false;
      });
    });
    context('when passing a valid argument', () => {
      it('should return true', () => {
        expect(FieldTypes.hasValidation(FieldTypes.CommonDBTypes.BIG_DECIMAL, Validations.MIN)).to.be.true;
      });
    });
  });
  describe('isBlobType', () => {
    context('when not passing anything', () => {
      it('should return false', () => {
        expect(FieldTypes.isBlobType()).to.be.false;
      });
    });
    context('when passing a type containing blob without it being one', () => {
      it('should return false', () => {
        expect(FieldTypes.isBlobType('NotABlob')).to.be.false;
      });
    });
    Object.keys(FieldTypes.CommonDBTypes).forEach(dbTypeKey => {
      const commonDBType = FieldTypes.CommonDBTypes[dbTypeKey];
      context(`when passing ${commonDBType}`, () => {
        const typeHasBlobInItsName = commonDBType.toLowerCase().includes('blob');
        it(`should return ${typeHasBlobInItsName}`, () => {
          expect(FieldTypes.isBlobType(commonDBType)).to.equal(typeHasBlobInItsName);
        });
      });
    });
  });
});
