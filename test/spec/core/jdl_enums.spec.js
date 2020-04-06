/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const JDLEnums = require('../../../lib/core/jdl_enums');
const JDLEnum = require('../../../lib/core/jdl_enum');

describe('JDLEnums', () => {
  describe('add', () => {
    let jdlEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    context('when adding an invalid enum', () => {
      it('should fail', () => {
        expect(() => {
          jdlEnums.add(new JDLEnum({ name: '' }));
        }).to.throw("The enum's name must be passed to create an enum.");
      });
    });
    context('when adding an invalid element', () => {
      it('should fail', () => {
        expect(() => {
          jdlEnums.add();
        }).to.throw('The enum must be valid in order to be added to the enums.\nError: No enum.');
      });
    });
    context('when adding a valid enum', () => {
      it('should not fail', () => {
        expect(() => {
          jdlEnums.add(new JDLEnum({ name: 'A' }));
        }).not.to.throw();
      });
    });
  });
  describe('get', () => {
    let jdlEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    context('when fetching an absent enum', () => {
      it('should return null', () => {
        expect(jdlEnums.get('A')).to.be.undefined;
      });
    });
    context('when fetching an existing enum', () => {
      let jdlEnum;

      before(() => {
        jdlEnum = new JDLEnum({ name: 'A' });
        jdlEnums.add(jdlEnum);
      });

      it('should return it', () => {
        expect(jdlEnums.get(jdlEnum.name)).to.deep.equal(jdlEnum);
      });
    });
  });
  describe('has', () => {
    let jdlEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    context('when fetching an absent enum', () => {
      it('should return false', () => {
        expect(jdlEnums.has('A')).to.be.false;
      });
    });
    context('when fetching an existing enum', () => {
      let jdlEnum;

      before(() => {
        jdlEnum = new JDLEnum({ name: 'A' });
        jdlEnums.add(jdlEnum);
      });

      it('should return true', () => {
        expect(jdlEnums.has(jdlEnum.name)).to.be.true;
      });
    });
  });
  describe('forEach', () => {
    let jdlEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    context('when not passing a function', () => {
      it('should not fail', () => {
        jdlEnums.forEach();
      });
    });
    context('when passing a function', () => {
      const result = [];

      before(() => {
        jdlEnums.add(new JDLEnum({ name: 'A' }));
        jdlEnums.add(new JDLEnum({ name: 'B' }));
        jdlEnums.forEach(jdlEnum => {
          result.push(jdlEnum.name);
        });
      });

      it('should use each enum name', () => {
        expect(result).to.deep.equal(['A', 'B']);
      });
    });
  });
  describe('size', () => {
    let jdlEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    context('when there is no element', () => {
      it('should return 0', () => {
        expect(jdlEnums.size()).to.equal(0);
      });
    });
    context('when there are enums', () => {
      before(() => {
        jdlEnums.add(new JDLEnum({ name: 'A' }));
        jdlEnums.add(new JDLEnum({ name: 'B' }));
        jdlEnums.add(new JDLEnum({ name: 'C' }));
      });
      after(() => {
        jdlEnums = new JDLEnums();
      });

      it('should return the number of enums', () => {
        expect(jdlEnums.size()).to.equal(3);
      });
    });
    context('when adding twice the same enum', () => {
      before(() => {
        jdlEnums.add(new JDLEnum({ name: 'A' }));
        jdlEnums.add(new JDLEnum({ name: 'A' }));
      });

      it('should count it as one enum', () => {
        expect(jdlEnums.size()).to.equal(1);
      });
    });
  });
  describe('toString', () => {
    let jdlEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    context('when there is no enum', () => {
      it('should return an empty string', () => {
        expect(jdlEnums.toString()).to.equal('');
      });
    });
    context('when there is at least one enum', () => {
      before(() => {
        jdlEnums.add(new JDLEnum({ name: 'A', values: ['AA', 'AB'].map(value => ({ key: value })) }));
        jdlEnums.add(new JDLEnum({ name: 'B', values: ['BA', 'BB', 'BC'].map(value => ({ key: value })) }));
      });

      it('should return a stringified version of enums', () => {
        expect(jdlEnums.toString()).to.equal(`enum A {
  AA,
  AB
}
enum B {
  BA,
  BB,
  BC
}
`);
      });
    });
  });
});
