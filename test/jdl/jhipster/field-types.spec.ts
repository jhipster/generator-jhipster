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

import { databaseTypes, fieldTypes, validations } from '../../../jdl/jhipster/index.mjs';
import { JDLEnum } from '../../../jdl/models/index.mjs';

const {
  Validations: { MIN, MAXLENGTH, PATTERN },
} = validations;

describe('FieldTypes', () => {
  describe('isCommonDBType', () => {
    context('when passing an invalid argument', () => {
      it('should fail', () => {
        expect(() => {
          fieldTypes.isCommonDBType(null);
        }).to.throw(/^The passed type must not be nil\.$/);
        expect(() => {
          fieldTypes.isCommonDBType('');
        }).to.throw(/^The passed type must not be nil\.$/);
      });
    });
    context('when passing a false type', () => {
      it('should return false', () => {
        expect(fieldTypes.isCommonDBType('UNKNOWN-TYPE')).to.be.false;
      });
    });
    context('when passing a valid type', () => {
      it('should return true', () => {
        expect(fieldTypes.isCommonDBType(fieldTypes.CommonDBTypes.BIG_DECIMAL)).to.be.true;
      });
    });
    context('when passing an enum', () => {
      it('should return true', () => {
        expect(fieldTypes.isCommonDBType(new JDLEnum({ name: 'MyEnum' }))).to.be.true;
      });
    });
  });
  describe('getIsType', () => {
    context('when passing an invalid argument', () => {
      it('should fail', () => {
        expect(() => {
          fieldTypes.getIsType(null);
        }).to.throw(/^The passed type must not be nil\.$/);
        expect(() => {
          fieldTypes.getIsType(null, () => {
            // do nothing
          });
        }).to.throw(/^The passed type must not be nil\.$/);
      });
    });
    context('when passing a valid argument without callback', () => {
      it('should return isType', () => {
        expect(fieldTypes.getIsType('mysql')).to.equal(fieldTypes.isCommonDBType);
      });
    });
    context('when passing a valid argument and callback', () => {
      it('should return true', () => {
        expect(
          fieldTypes.getIsType('sql', () => {
            // do nothing
          })
        ).to.equal(fieldTypes.isCommonDBType);
      });
    });
    context('when passing an invalid argument', () => {
      it('should fail', () => {
        expect(() => {
          fieldTypes.getIsType('thing', () => {});
        }).to.throw(
          "The passed database type must either be 'sql', 'mysql', 'mariadb', 'postgresql'," +
            " 'oracle', 'mssql', 'mongodb', 'couchbase', 'neo4j' or 'cassandra'"
        );
      });
    });
    context("when passing 'no' as argument", () => {
      it('should not fail', () => {
        expect(() => {
          fieldTypes.getIsType(databaseTypes.NO, () => {});
        }).not.to.throw();
      });
    });
  });
  describe('hasValidation', () => {
    context('when passing an invalid argument', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          fieldTypes.hasValidation();
        }).to.throw(/^The passed type and value must not be nil\.$/);
        expect(() => {
          fieldTypes.hasValidation(null, MAXLENGTH);
        }).to.throw(/^The passed type and value must not be nil\.$/);
        expect(() => {
          // @ts-expect-error
          fieldTypes.hasValidation('UNKNOWN-TYPE');
        }).to.throw(/^The passed type and value must not be nil\.$/);
      });
    });
    context('when passing a false argument', () => {
      it('should return false', () => {
        expect(fieldTypes.hasValidation(fieldTypes.CommonDBTypes.BIG_DECIMAL, PATTERN)).to.be.false;
      });
    });
    context('when passing a valid argument', () => {
      it('should return true', () => {
        expect(fieldTypes.hasValidation(fieldTypes.CommonDBTypes.BIG_DECIMAL, MIN)).to.be.true;
      });
    });
  });
  describe('isBlobType', () => {
    context('when not passing anything', () => {
      it('should return false', () => {
        expect(fieldTypes.isBlobType()).to.be.false;
      });
    });
    context('when passing a type containing blob without it being one', () => {
      it('should return false', () => {
        expect(fieldTypes.isBlobType('NotABlob')).to.be.false;
      });
    });
    Object.keys(fieldTypes.CommonDBTypes).forEach(dbTypeKey => {
      const commonDBType = fieldTypes.CommonDBTypes[dbTypeKey];
      context(`when passing ${commonDBType}`, () => {
        const typeHasBlobInItsName = commonDBType.toLowerCase().includes('blob');
        it(`should return ${typeHasBlobInItsName}`, () => {
          expect(fieldTypes.isBlobType(commonDBType)).to.equal(typeHasBlobInItsName);
        });
      });
    });
  });
});
