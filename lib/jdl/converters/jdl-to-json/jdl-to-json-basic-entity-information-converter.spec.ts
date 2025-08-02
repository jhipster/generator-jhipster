/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { before, describe, it, expect as jestExpect } from 'esmocha';
import { use as chaiUse, expect } from 'chai';
import sinonChai from 'sinon-chai';

chaiUse(sinonChai);

import { JDLEntity } from '../../core/models/index.ts';
import { convert } from './jdl-to-json-basic-entity-converter.ts';

describe('jdl - JDLToJSONBasicEntityConverter', () => {
  describe('convert', () => {
    describe('when not passing JDL entities', () => {
      it('should fail', () => {
        // @ts-expect-error empty parameter not allowed
        expect(() => convert()).to.throw(/^JDL entities must be passed to get the basic entity information\.$/);
      });
    });
    describe('when passing an empty array', () => {
      it('should return an empty map', () => {
        expect(convert([])).to.deep.equal(new Map());
      });
    });
    describe('when passing JDL entities', () => {
      describe('with some of them being built-in entities', () => {
        let builtInEntitiesAreConverted;
        let customEntitiesAreConverted;

        before(() => {
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          const userEntity = new JDLEntity({
            name: 'User',
          });
          const authorityEntity = new JDLEntity({
            name: 'Authority',
          });
          const returnedMap = convert([entityA, userEntity, authorityEntity]);
          customEntitiesAreConverted = returnedMap.has('A');
          builtInEntitiesAreConverted = returnedMap.has('User') || returnedMap.has('Authority');
        });

        it('should convert built-in entities', () => {
          expect(builtInEntitiesAreConverted).to.be.true;
        });
        it('should convert custom entities', () => {
          expect(customEntitiesAreConverted).to.be.true;
        });
      });
      describe('with no field, no option and no relationship', () => {
        let convertedEntity;

        before(() => {
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          // TODO: Convert only accepts one argument. This might be a bug.
          // @ts-expect-error
          const returnedMap = convert([entityA], new Date(2020, 0, 1, 1, 0, 0));
          convertedEntity = returnedMap.get('A');
        });

        it('should convert the entity', () => {
          jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "angularJSSuffix": undefined,
  "annotations": {},
  "applications": [],
  "clientRootFolder": undefined,
  "documentation": "The best entity",
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": "entity_a",
  "fields": [],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "microserviceName": undefined,
  "name": "A",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "service": undefined,
  "skipClient": undefined,
  "skipServer": undefined,
}
`);
        });
      });
    });
  });
});
