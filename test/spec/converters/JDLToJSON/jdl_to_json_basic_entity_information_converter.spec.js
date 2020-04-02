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
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const { expect } = require('chai');

const JDLEntity = require('../../../../lib/core/jdl_entity');
const { convert } = require('../../../../lib/converters/JDLToJSON/jdl_to_json_basic_entity_converter');
const logger = require('../../../../lib/utils/objects/logger');
const { formatDateForLiquibase } = require('../../../../lib/utils/format_utils');

describe('JDLToJSONBasicEntityConverter', () => {
  describe('convert', () => {
    context('when not passing JDL entities', () => {
      it('should fail', () => {
        expect(() => convert()).to.throw(/^JDL entities must be passed to get the basic entity information\.$/);
      });
    });
    context('when passing an empty array', () => {
      it('should return an empty map', () => {
        expect(convert([])).to.deep.equal(new Map());
      });
    });
    context('when passing JDL entities', () => {
      context('with some of them being built-in entities', () => {
        let builtInEntitiesAreConverted;
        let customEntitiesAreConverted;
        let loggerSpy;

        before(() => {
          loggerSpy = sinon.spy(logger, 'warn');
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity'
          });
          const userEntity = new JDLEntity({
            name: 'User'
          });
          const authorityEntity = new JDLEntity({
            name: 'Authority'
          });
          const returnedMap = convert([entityA, userEntity, authorityEntity]);
          customEntitiesAreConverted = returnedMap.has('A');
          builtInEntitiesAreConverted = returnedMap.has('User') || returnedMap.has('Authority');
        });

        after(() => {
          loggerSpy.restore();
        });

        it('should warn about them', () => {
          expect(loggerSpy.getCall(0).args[0]).to.equal(
            "An Entity name 'User' was used: 'User' is an entity created by default by JHipster. All relationships " +
              'toward it will be kept but any attributes and relationships from it will be disregarded.'
          );
        });
        it('should not convert built-in entities', () => {
          expect(builtInEntitiesAreConverted).to.be.false;
        });
        it('should convert custom entities', () => {
          expect(customEntitiesAreConverted).to.be.true;
        });
      });
      context('with no field, no option and no relationship', () => {
        let convertedEntity;

        before(() => {
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity'
          });
          const returnedMap = convert([entityA], new Date(2020, 0, 1, 1, 0, 0));
          convertedEntity = returnedMap.get('A');
        });

        it('should convert the entity', () => {
          expect(convertedEntity).to.deep.equal({
            applications: [],
            changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
            clientRootFolder: '',
            dto: 'no',
            embedded: false,
            entityTableName: 'entity_a',
            fields: [],
            fluentMethods: true,
            javadoc: 'The best entity',
            jpaMetamodelFiltering: false,
            name: 'A',
            pagination: 'no',
            readOnly: false,
            relationships: [],
            service: 'no'
          });
        });
      });
    });
  });
});
