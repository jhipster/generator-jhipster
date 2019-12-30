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

const { expect } = require('chai');
const JDLEntity = require('../../../../lib/core/jdl_entity');
const { convertEntities } = require('../../../../lib/converters/parsedJDLToJDLObject/entity_converter');

describe('EntityConverter', () => {
  describe('convertEntities', () => {
    context('when not passing entities', () => {
      it('should fail', () => {
        expect(() => convertEntities()).to.throw(/^Entities have to be passed so as to be converted\.$/);
      });
    });
    context('when passing entities', () => {
      let convertedEntities;
      let expectedEntities;

      before(() => {
        convertedEntities = convertEntities(
          [
            {
              name: 'A',
              javadoc: '/** No comment */'
            },
            {
              name: 'B',
              tableName: 'b_table'
            }
          ],
          () => []
        );
        expectedEntities = [
          new JDLEntity({
            name: 'A',
            comment: '/** No comment */'
          }),
          new JDLEntity({
            name: 'B',
            tableName: 'b_table'
          })
        ];
      });

      it('should convert them', () => {
        expect(convertedEntities).to.deep.equal(expectedEntities);
      });
    });
  });
});
