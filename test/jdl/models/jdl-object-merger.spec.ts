/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { expect } from 'chai';
import { applicationTypes, fieldTypes, unaryOptions, relationshipTypes } from '../../../jdl/jhipster/index.mjs';
import JDLObject from '../../../jdl/models/jdl-object.js';
import createJDLApplication from '../../../jdl/models/jdl-application-factory.js';
import { JDLEntity, JDLEnum } from '../../../jdl/models/index.mjs';
import JDLField from '../../../jdl/models/jdl-field.js';
import JDLRelationship from '../../../jdl/models/jdl-relationship.js';
import JDLUnaryOption from '../../../jdl/models/jdl-unary-option.js';
import mergeJDLObjects from '../../../jdl/models/jdl-object-merger.js';

const { MONOLITH } = applicationTypes;

describe('jdl - JDLObjectMerger', () => {
  describe('mergeJDLObjects', () => {
    context('when not passing the first object', () => {
      it('should fail', () => {
        expect(() => mergeJDLObjects(undefined, {})).to.throw(/^Can't merge nil JDL objects\.$/);
      });
    });
    context('when not passing the second object', () => {
      it('should fail', () => {
        expect(() => mergeJDLObjects({}, undefined)).to.throw(/^Can't merge nil JDL objects\.$/);
      });
    });
    context('when passing two jdl objects', () => {
      let merged;
      let firstJDLObject;
      let secondJDLObject;
      let originalFirstJDLObjectToString;
      let originalSecondJDLObjectToString;
      let firstJDLObjectAfterMergeToString;
      let secondJDLObjectAfterMergeToString;

      before(() => {
        firstJDLObject = createFirstJDLObjectForTheMergeTest();
        secondJDLObject = createSecondJDLObjectForTheMergeTest();
        originalFirstJDLObjectToString = firstJDLObject.toString();
        originalSecondJDLObjectToString = secondJDLObject.toString();
        merged = mergeJDLObjects(firstJDLObject, secondJDLObject);
        firstJDLObjectAfterMergeToString = firstJDLObject.toString();
        secondJDLObjectAfterMergeToString = secondJDLObject.toString();
      });

      it('should not modify the first JDL object', () => {
        expect(originalFirstJDLObjectToString).to.equal(firstJDLObjectAfterMergeToString);
      });
      it('should not modify the second JDL object', () => {
        expect(originalSecondJDLObjectToString).to.equal(secondJDLObjectAfterMergeToString);
      });
      it('should merge the applications', () => {
        expect(merged.getApplicationQuantity()).to.equal(2);
      });
      it('should merge the entities', () => {
        expect(merged.getEntityQuantity()).to.equal(3);
      });
      it('should merge the enums', () => {
        expect(merged.getEnumQuantity()).to.equal(2);
      });
      it('should merge the relationships', () => {
        expect(merged.getRelationshipQuantity()).to.equal(2);
      });
      it('should merge the options', () => {
        expect(merged.getOptionQuantity()).to.equal(2);
      });
    });
  });
});

function createFirstJDLObjectForTheMergeTest() {
  const jdlObject = new JDLObject();
  const application = createJDLApplication({
    applicationType: MONOLITH,
    baseName: 'anApp',
    databaseType: 'sql',
  });
  const entityA = new JDLEntity({
    name: 'A',
  });
  const entityB = new JDLEntity({
    name: 'B',
  });
  const fieldForA = new JDLField({
    name: 'aa',
    type: fieldTypes.CommonDBTypes.STRING,
  });
  const relationship = new JDLRelationship({
    from: entityA.name,
    to: entityB.name,
    type: relationshipTypes.ONE_TO_ONE,
    injectedFieldInFrom: 'b',
  });
  const enumeration = new JDLEnum({
    name: 'AEnum',
    values: [{ key: 'AAA' }, { key: 'BBB' }],
  });
  const option = new JDLUnaryOption({
    name: unaryOptions.FILTER,
    entityNames: [entityA.name, entityB.name],
  });
  entityA.addField(fieldForA);
  jdlObject.addApplication(application);
  jdlObject.addEntity(entityA);
  jdlObject.addEntity(entityB);
  jdlObject.addRelationship(relationship);
  jdlObject.addEnum(enumeration);
  jdlObject.addOption(option);
  return jdlObject;
}

function createSecondJDLObjectForTheMergeTest() {
  const jdlObject = new JDLObject();
  const application = createJDLApplication({
    applicationType: MONOLITH,
    baseName: 'anotherApp',
    databaseType: 'sql',
  });
  const entityC = new JDLEntity({
    name: 'C',
  });
  const fieldForC = new JDLField({
    name: 'cc',
    type: fieldTypes.CommonDBTypes.STRING,
  });
  const relationship = new JDLRelationship({
    from: entityC.name,
    to: entityC.name,
    type: relationshipTypes.MANY_TO_ONE,
    injectedFieldInFrom: 'c2',
  });
  const enumeration = new JDLEnum({
    name: 'BEnum',
    values: [{ key: 'CCC' }],
  });
  const option = new JDLUnaryOption({
    name: unaryOptions.NO_FLUENT_METHOD,
    entityNames: [entityC.name],
  });
  entityC.addField(fieldForC);
  jdlObject.addApplication(application);
  jdlObject.addEntity(entityC);
  jdlObject.addRelationship(relationship);
  jdlObject.addEnum(enumeration);
  jdlObject.addOption(option);
  return jdlObject;
}
