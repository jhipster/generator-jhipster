/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { after, before, describe, expect as jestExpect, it } from 'esmocha';

import { expect } from 'chai';

import { JDLEnum } from './index.ts';
import JDLEnums from './jdl-enums.ts';

describe('jdl - JDLEnums', () => {
  describe('add', () => {
    let jdlEnums: JDLEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    describe('when adding an invalid enum', () => {
      it('should fail', () => {
        expect(() => {
          jdlEnums.add(new JDLEnum({ name: '' }));
        }).to.throw("The enum's name must be passed to create an enum.");
      });
    });
    describe('when adding an invalid element', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error invalid api test
          jdlEnums.add();
        }).to.throw(/^Can't add a nil JDL enum to the JDL enums\.$/);
      });
    });
    describe('when adding a valid enum', () => {
      it('should not fail', () => {
        expect(() => {
          jdlEnums.add(new JDLEnum({ name: 'A' }));
        }).not.to.throw();
      });
    });
  });
  describe('get', () => {
    let jdlEnums: JDLEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    describe('when fetching an absent enum', () => {
      it('should return null', () => {
        expect(jdlEnums.get('A')).to.be.undefined;
      });
    });
    describe('when fetching an existing enum', () => {
      let jdlEnum: JDLEnum;

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
    let jdlEnums: JDLEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    describe('when fetching an absent enum', () => {
      it('should return false', () => {
        expect(jdlEnums.has('A')).to.be.false;
      });
    });
    describe('when fetching an existing enum', () => {
      let jdlEnum: JDLEnum;

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
    let jdlEnums: JDLEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    describe('when not passing a function', () => {
      it('should not fail', () => {
        // @ts-expect-error invalid api test
        jdlEnums.forEach();
      });
    });
    describe('when passing a function', () => {
      const result: any[] = [];

      before(() => {
        jdlEnums.add(new JDLEnum({ name: 'A' }));
        jdlEnums.add(new JDLEnum({ name: 'B' }));
        jdlEnums.forEach(jdlEnum => {
          result.push(jdlEnum.name);
        });
      });

      it('should use each enum name', () => {
        jestExpect(result).toMatchInlineSnapshot(`
[
  "A",
  "B",
]
`);
      });
    });
  });
  describe('size', () => {
    let jdlEnums: JDLEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    describe('when there is no element', () => {
      it('should return 0', () => {
        expect(jdlEnums.size()).to.equal(0);
      });
    });
    describe('when there are enums', () => {
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
    describe('when adding twice the same enum', () => {
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
    let jdlEnums: JDLEnums;

    before(() => {
      jdlEnums = new JDLEnums();
    });

    describe('when there is no enum', () => {
      it('should return an empty string', () => {
        expect(jdlEnums.toString()).to.equal('');
      });
    });
    describe('when there is at least one enum', () => {
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
