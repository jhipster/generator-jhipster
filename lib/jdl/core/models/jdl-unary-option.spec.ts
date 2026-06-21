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

import { before, describe, expect, it } from 'esmocha';

import { unaryOptions } from '../built-in-options/index.ts';

import JDLUnaryOption from './jdl-unary-option.ts';

describe('jdl - JDLUnaryOption', () => {
  describe('new', () => {
    describe('when passing no argument', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error invalid api test
          new JDLUnaryOption();
        }).toThrow("The option's name must be passed to create an option.");
      });
    });
    describe('when passing a name at least', () => {
      let option: JDLUnaryOption;

      before(() => {
        option = new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT });
      });

      it('should create an option', () => {
        expect(option.name).toBe(unaryOptions.SKIP_CLIENT);
      });
    });
    describe('when passing a list of entity names and excluded names with some of them being repeated', () => {
      let option: JDLUnaryOption;

      before(() => {
        option = new JDLUnaryOption({
          name: unaryOptions.SKIP_CLIENT,
          entityNames: new Set(['A', 'B', 'C', 'A']),
          excludedNames: new Set(['E', 'E', 'D']),
        });
      });

      it('should removes the dupes', () => {
        expect(option.entityNames.size).toBe(3);
        expect(option.entityNames.has('A')).toBe(true);
        expect(option.entityNames.has('B')).toBe(true);
        expect(option.entityNames.has('C')).toBe(true);
        expect(option.excludedNames.size).toBe(2);
        expect(option.excludedNames.has('E')).toBe(true);
        expect(option.excludedNames.has('D')).toBe(true);
      });
    });
  });
  describe('setEntityNames', () => {
    let option: JDLUnaryOption;

    before(() => {
      option = new JDLUnaryOption({
        name: unaryOptions.SKIP_CLIENT,
        entityNames: new Set(['A', 'B', 'C']),
      });
      option.setEntityNames(['A']);
    });

    it('should set the entity names', () => {
      expect(option.entityNames.size).toBe(1);
      expect(option.entityNames.has('A')).toBe(true);
    });
  });
  describe('addEntityName', () => {
    describe('when passing a nil name', () => {
      let option: JDLUnaryOption;

      before(() => {
        option = new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT });
      });

      it('should fail', () => {
        expect(() => {
          // @ts-expect-error invalid api test
          option.addEntityName(null);
        }).toThrow('An entity name has to be passed so as to be added to the option.');
      });
    });
    describe("when passing a name that hasn't been added yet", () => {
      let option: JDLUnaryOption;

      before(() => {
        option = new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT });
        option.addEntityName('A');
      });

      it('should change the set', () => {
        expect(option.entityNames.size).toBe(1);
      });
    });
    describe('when passing a name that has already been added', () => {
      let option: JDLUnaryOption;

      before(() => {
        option = new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT });
        option.addEntityName('A');
        option.addEntityName('A');
      });

      it('should not change the size', () => {
        expect(option.entityNames.size).toBe(1);
      });
    });
    describe('when passing an excluded name', () => {
      let option: JDLUnaryOption;

      before(() => {
        option = new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT });
        option.addEntityName('A');
        option.excludeEntityName('A');
      });

      it('should not change the sizes', () => {
        expect(option.entityNames.size).toBe(1);
        expect(option.excludedNames.size).toBe(0);
      });
    });
  });
  describe('addEntitiesFromAnotherOption', () => {
    let option: JDLUnaryOption;

    before(() => {
      option = new JDLUnaryOption({
        name: unaryOptions.SKIP_SERVER,
        entityNames: new Set(['B', 'C']),
        excludedNames: new Set(['Z']),
      });
    });

    describe('when passing an invalid option', () => {
      it('should return false', () => {
        // @ts-expect-error invalid api test
        expect(option.addEntitiesFromAnotherOption(null)).toBe(false);
      });
    });
    describe('when passing a valid option', () => {
      let returned: boolean;

      before(() => {
        const option2 = new JDLUnaryOption({
          name: unaryOptions.SKIP_SERVER,
          entityNames: new Set(['A', 'C']),
          excludedNames: new Set(['Y']),
        });
        returned = option.addEntitiesFromAnotherOption(option2);
      });

      it('should return true', () => {
        expect(returned).toBe(true);
      });
      it('should add the source entities to the target option', () => {
        expect(option.entityNames).toEqual(new Set(['B', 'C', 'A']));
      });
      it('should add the excluded source entities to the target option', () => {
        expect(option.excludedNames).toEqual(new Set(['Z', 'Y']));
      });
    });
  });
  describe('excludeEntityName', () => {
    describe('when passing a nil name', () => {
      let option: JDLUnaryOption;

      before(() => {
        option = new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT });
      });

      it('should fail', () => {
        expect(() => {
          // @ts-expect-error invalid api test
          option.excludeEntityName(null);
        }).toThrow('An entity name has to be passed so as to be excluded from the option.');
      });
    });
    describe("when passing a name that hasn't been excluded yet", () => {
      let option: JDLUnaryOption;

      before(() => {
        option = new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT });
        option.excludeEntityName('A');
      });

      it('should change the set', () => {
        expect(option.excludedNames.size).toBe(1);
      });
    });
    describe('when passing a name that has already been excluded', () => {
      let option: JDLUnaryOption;

      before(() => {
        option = new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT });
        option.excludeEntityName('A');
        option.excludeEntityName('A');
      });

      it('should not change the size', () => {
        expect(option.excludedNames.size).toBe(1);
      });
    });
    describe('when passing an added name', () => {
      let option: JDLUnaryOption;

      before(() => {
        option = new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT });
        option.excludeEntityName('A');
        option.addEntityName('A');
      });

      it('should not change the size', () => {
        expect(option.entityNames.size).toBe(1);
      });
    });
  });
  describe('toString', () => {
    let option: JDLUnaryOption;

    before(() => {
      option = new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT });
      expect(option.toString()).toBe(`${unaryOptions.SKIP_CLIENT} *`);
      option.addEntityName('D');
      expect(option.toString()).toBe(`${unaryOptions.SKIP_CLIENT} D`);
      option.addEntityName('E');
      option.addEntityName('F');
      expect(option.toString()).toBe(`${unaryOptions.SKIP_CLIENT} D, E, F`);
      option.excludeEntityName('A');
      expect(option.toString()).toBe(`${unaryOptions.SKIP_CLIENT} D, E, F except A`);
      option.excludeEntityName('B');
      option.excludeEntityName('C');
    });

    it('should stringify the option', () => {
      expect(option.toString()).toBe(`${unaryOptions.SKIP_CLIENT} D, E, F except A, B, C`);
    });
  });
});
