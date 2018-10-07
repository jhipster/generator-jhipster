/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const JDLBinaryOption = require('../../../lib/core/jdl_binary_option');
const JDLEntity = require('../../../lib/core/jdl_entity');
const BinaryOptions = require('../../../lib/core/jhipster/binary_options');

describe('JDLBinaryOption', () => {
  describe('::new', () => {
    context('when passing no argument', () => {
      it('fails', () => {
        expect(() => {
          new JDLBinaryOption();
        }).to.throw("The option's name must be passed to create an option.");
      });
    });
    context('when passing an invalid name', () => {
      it('fails', () => {
        expect(() => {
          new JDLBinaryOption({ name: 'IsNotAnOption' });
        }).to.throw("The option's name and value must be valid to create an option, got no value for 'IsNotAnOption'.");
      });
    });
    context('when passing a name but no value', () => {
      it('fails', () => {
        expect(() => {
          new JDLBinaryOption({ name: BinaryOptions.Options.DTO });
        }).to.throw("The option's name and value must be valid to create an option, got no value for 'dto'.");
      });
    });
    context('when passing a name and a value', () => {
      let option = null;

      before(() => {
        option = new JDLBinaryOption({
          name: BinaryOptions.Options.DTO,
          value: BinaryOptions.Values.dto.MAPSTRUCT
        });
      });

      it('creates the option', () => {
        expect(option).not.to.be.null;
        expect(option.name).to.eq(BinaryOptions.Options.DTO);
        expect(option.value).to.eq(BinaryOptions.Values.dto.MAPSTRUCT);
      });
    });
    context('when passing a list of entity names and excluded names with some of them being repeated', () => {
      let option = null;

      before(() => {
        option = new JDLBinaryOption({
          name: BinaryOptions.Options.DTO,
          value: BinaryOptions.Values.dto.MAPSTRUCT,
          entityNames: ['A', 'B', 'C', 'A'],
          excludedNames: ['E', 'E', 'D']
        });
      });

      it('removes the dupes', () => {
        expect(option.entityNames.size()).to.eq(3);
        expect(option.entityNames.has('A')).to.be.true;
        expect(option.entityNames.has('B')).to.be.true;
        expect(option.entityNames.has('C')).to.be.true;
        expect(option.excludedNames.size()).to.eq(2);
        expect(option.excludedNames.has('E')).to.be.true;
        expect(option.excludedNames.has('D')).to.be.true;
      });
    });
  });
  describe('#setEnityNames', () => {
    let option = null;

    before(() => {
      option = new JDLBinaryOption({
        name: BinaryOptions.Options.DTO,
        value: BinaryOptions.Values.dto.MAPSTRUCT,
        entityNames: ['A', 'B', 'C']
      });
      option.setEntityNames(['A']);
    });

    it('sets the entity names', () => {
      expect(option.entityNames.size()).to.equal(1);
      expect(option.entityNames.has('A')).to.be.true;
    });
  });
  describe('::isValid', () => {
    context('when passing a nil object', () => {
      it('returns false', () => {
        expect(JDLBinaryOption.isValid()).to.be.false;
      });
    });
    context('when passing an object with no name', () => {
      it('returns false', () => {
        expect(JDLBinaryOption.isValid({})).to.be.false;
      });
    });
    context('when passing an object with a name', () => {
      it('returns false', () => {
        expect(JDLBinaryOption.isValid({ name: BinaryOptions.Options.DTO })).to.be.false;
      });
    });
    context('when passing an object with a name, entity names, excluded names and a type', () => {
      let emptyOption = null;

      before(() => {
        emptyOption = new JDLBinaryOption({
          name: BinaryOptions.Options.DTO,
          value: BinaryOptions.Values.dto.MAPSTRUCT
        });
      });

      it('returns true', () => {
        expect(
          JDLBinaryOption.isValid({
            name: BinaryOptions.Options.DTO,
            value: BinaryOptions.Values.dto.MAPSTRUCT,
            entityNames: emptyOption.entityNames,
            excludedNames: emptyOption.excludedNames,
            getType: () => 'BINARY'
          })
        ).to.be.true;
      });
    });
  });
  describe('#addEntity', () => {
    let option = null;

    before(() => {
      option = option = new JDLBinaryOption({
        name: BinaryOptions.Options.DTO,
        value: BinaryOptions.Values.dto.MAPSTRUCT
      });
    });

    context('when passing a nil entity', () => {
      it('fails', () => {
        expect(() => {
          option.addEntity(null);
        }).to.throw('An entity has to be passed so as to be added to the option.');
      });
    });
    context('when passing an invalid entity', () => {
      it('fails', () => {
        expect(() => {
          option.addEntity({});
        }).to.throw('The entity must have a name so as to be added to the option.');
      });
    });
    context("when passing a valid entity that hasn't been added yet", () => {
      let result = null;

      before(() => {
        result = option.addEntity(new JDLEntity({ name: 'A' }));
      });

      it('returns true', () => {
        expect(result).to.be.true;
        expect(option.entityNames.size()).to.eq(1);
      });
    });
    context('when passing a valid entity that has already been added', () => {
      let result = null;

      before(() => {
        option.addEntity(new JDLEntity({ name: 'A' }));
        result = option.addEntity(new JDLEntity({ name: 'A' }));
      });

      it('returns false', () => {
        expect(result).to.be.false;
        expect(option.entityNames.size()).to.eq(1);
      });
    });
    context('when passing an excluded entity', () => {
      let result = null;

      before(() => {
        option.addEntity(new JDLEntity({ name: 'A' }));
        result = option.addEntity(new JDLEntity({ name: 'A' }));
      });

      it('returns false', () => {
        expect(result).to.be.false;
      });
    });
  });
  describe('#addEntitiesFromAnotherOption', () => {
    const option = new JDLBinaryOption({
      name: BinaryOptions.Options.DTO,
      value: BinaryOptions.Values.dto.MAPSTRUCT,
      entityNames: ['B', 'C'],
      excludedNames: ['Z']
    });

    context('when passing an invalid option', () => {
      it('returns false', () => {
        expect(option.addEntitiesFromAnotherOption(null)).to.be.false;
      });
    });
    context('when passing a valid option', () => {
      let returned;

      before(() => {
        const option2 = new JDLBinaryOption({
          name: BinaryOptions.Options.DTO,
          value: BinaryOptions.Values.dto.MAPSTRUCT,
          entityNames: ['A', 'C'],
          excludedNames: ['Y']
        });
        returned = option.addEntitiesFromAnotherOption(option2);
      });

      it('returns true', () => {
        expect(returned).to.be.true;
      });
      it('adds the source entities to the target option', () => {
        expect(option.entityNames.toString()).to.equal('[B,C,A]');
      });
      it('adds the excluded source entities to the target option', () => {
        expect(option.excludedNames.toString()).to.equal('[Z,Y]');
      });
    });
  });
  describe('#excludeEntity', () => {
    let option = null;

    before(() => {
      option = option = new JDLBinaryOption({
        name: BinaryOptions.Options.DTO,
        value: BinaryOptions.Values.dto.MAPSTRUCT
      });
    });

    context('when passing a nil entity', () => {
      it('fails', () => {
        expect(() => {
          option.excludeEntity(null);
        }).to.throw('An entity has to be passed so as to be excluded from the option.');
      });
    });
    context('when passing an invalid entity', () => {
      it('fails', () => {
        expect(() => {
          option.excludeEntity({});
        }).to.throw('The entity must have a name so as to be excluded from the option.');
      });
    });
    context("when passing a valid entity that hasn't been excluded yet", () => {
      let result = null;

      before(() => {
        result = option.excludeEntity(new JDLEntity({ name: 'A' }));
      });

      it('returns true', () => {
        expect(result).to.be.true;
      });
      it('changes the size', () => {
        expect(option.excludedNames.size()).to.eq(1);
      });
    });
    context('when passing a valid entity that has already been excluded', () => {
      let result = null;

      before(() => {
        option.excludeEntity(new JDLEntity({ name: 'A' }));
        result = option.excludeEntity(new JDLEntity({ name: 'A' }));
      });

      it('returns false', () => {
        expect(result).to.be.false;
      });
      it('does not change the size', () => {
        expect(option.excludedNames.size()).to.eq(1);
      });
    });
    context('when passing an added entity', () => {
      let result = null;

      before(() => {
        option.excludeEntity(new JDLEntity({ name: 'A' }));
        result = option.excludeEntity(new JDLEntity({ name: 'A' }));
      });

      it('returns false', () => {
        expect(result).to.be.false;
      });
    });
  });
  describe('#toString', () => {
    it('stringifies the option', () => {
      let option = new JDLBinaryOption({
        name: BinaryOptions.Options.DTO,
        value: BinaryOptions.Values.dto.MAPSTRUCT
      });
      expect(option.toString()).to.eq(`${BinaryOptions.Options.DTO} * with ${BinaryOptions.Values.dto.MAPSTRUCT}`);
      option.addEntityName('D');
      expect(option.toString()).to.eq(`${BinaryOptions.Options.DTO} D with ${BinaryOptions.Values.dto.MAPSTRUCT}`);
      option.addEntityName('E');
      option.addEntityName('F');
      expect(option.toString()).to.eq(
        `${BinaryOptions.Options.DTO} D, E, F with ${BinaryOptions.Values.dto.MAPSTRUCT}`
      );
      option.excludeEntityName('A');
      expect(option.toString()).to.eq(
        `${BinaryOptions.Options.DTO} D, E, F with ${BinaryOptions.Values.dto.MAPSTRUCT} except A`
      );
      option.excludeEntityName('B');
      option.excludeEntityName('C');
      expect(option.toString()).to.eq(
        `${BinaryOptions.Options.DTO} D, E, F with ${BinaryOptions.Values.dto.MAPSTRUCT} except A, B, C`
      );
      option = new JDLBinaryOption({
        name: BinaryOptions.Options.PAGINATION,
        value: BinaryOptions.Values.pagination.PAGER
      });
      expect(option.toString()).to.eq(`paginate * with ${BinaryOptions.Values.pagination.PAGER}`);
    });
  });
});
