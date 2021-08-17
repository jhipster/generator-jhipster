/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const { expect } = require('chai');

const JDLObject = require('../../../../jdl/models/jdl-object');
const JDLEntity = require('../../../../jdl/models/jdl-entity');
const JDLUnaryOption = require('../../../../jdl/models/jdl-unary-option');
const JDLBinaryOption = require('../../../../jdl/models/jdl-binary-option');
const UnaryOptions = require('../../../../jdl/jhipster/unary-options');
const BinaryOptions = require('../../../../jdl/jhipster/binary-options');
const { convert } = require('../../../../jdl/converters/jdl-to-json/jdl-to-json-option-converter');
const logger = require('../../../../jdl/utils/objects/logger');
const { MapperTypes, PaginationTypes, ServiceTypes } = require('../../../../jdl/jhipster/entity-options');
const { COUCHBASE } = require('../../../../jdl/jhipster/search-engine-types');

const { MAPSTRUCT } = MapperTypes;
const { PAGINATION } = PaginationTypes;
const { SERVICE_IMPL } = ServiceTypes;

describe('JDLToJSONOptionConverter', () => {
  describe('convert', () => {
    context('when not passing a JDL option holder', () => {
      it('should fail', () => {
        expect(() => convert()).to.throw(/^A JDL object or application must be passed to convert JDL options to JSON\.$/);
      });
    });
    context('when passing a JDL option holder', () => {
      context('when there is no option', () => {
        let returned;

        before(() => {
          const jdlObject = new JDLObject();
          returned = convert(jdlObject);
        });

        it('should return an empty map', () => {
          expect(returned.size).to.equal(0);
        });
      });
      context('with options', () => {
        let convertedOptions;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          const options = [
            new JDLUnaryOption({
              name: UnaryOptions.EMBEDDED,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: UnaryOptions.NO_FLUENT_METHOD,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: UnaryOptions.FILTER,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: UnaryOptions.READ_ONLY,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: UnaryOptions.SKIP_CLIENT,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: UnaryOptions.SKIP_SERVER,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.ANGULAR_SUFFIX,
              value: 'suffix',
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.CLIENT_ROOT_FOLDER,
              value: '../client_root_folder',
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.DTO,
              value: BinaryOptions.Values.dto.MAPSTRUCT,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.MICROSERVICE,
              value: 'myMs',
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.PAGINATION,
              value: BinaryOptions.Values.pagination.PAGINATION,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.SEARCH,
              value: BinaryOptions.Values.search.COUCHBASE,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.SERVICE,
              value: BinaryOptions.Values.service.SERVICE_IMPL,
              entityNames: ['A'],
            }),
          ];
          jdlObject.addEntity(entityA);
          options.forEach(option => jdlObject.addOption(option));
          const returned = convert(jdlObject);
          convertedOptions = returned.get('A');
        });

        it('should convert the options', () => {
          expect(convertedOptions).to.deep.equal({
            angularJSSuffix: 'suffix',
            clientRootFolder: '../client_root_folder',
            dto: MAPSTRUCT,
            embedded: true,
            fluentMethods: false,
            jpaMetamodelFiltering: true,
            microserviceName: 'myMs',
            pagination: PAGINATION,
            readOnly: true,
            searchEngine: COUCHBASE,
            service: SERVICE_IMPL,
            skipClient: true,
            skipServer: true,
          });
        });
      });
      context('when setting the DTO option without the service option', () => {
        let convertedOptions;
        let loggerSpy;

        before(() => {
          loggerSpy = sinon.spy(logger, 'info');
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          jdlObject.addEntity(entityA);
          jdlObject.addOption(
            new JDLBinaryOption({
              name: BinaryOptions.Options.DTO,
              value: BinaryOptions.Values.dto.MAPSTRUCT,
              entityNames: ['A'],
            })
          );
          const returnedMap = convert(jdlObject);
          convertedOptions = returnedMap.get('A');
        });

        after(() => {
          loggerSpy.restore();
        });

        it('should log the automatic setting of the option', () => {
          expect(loggerSpy.getCall(0).args[0]).to.equal(
            "The dto option is set for A, the 'serviceClass' value for the 'service' is gonna be set for this entity if " +
              'no other value has been set.'
          );
        });
        it('should set the service option to serviceClass', () => {
          expect(convertedOptions).to.deep.equal({
            dto: 'mapstruct',
            service: 'serviceClass',
          });
        });
      });
      context('when setting the filtering option without the service option', () => {
        let convertedOptions;
        let loggerSpy;

        before(() => {
          loggerSpy = sinon.spy(logger, 'info');
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          jdlObject.addEntity(entityA);
          jdlObject.addOption(
            new JDLUnaryOption({
              name: UnaryOptions.FILTER,
              entityNames: ['A'],
            })
          );
          const returnedMap = convert(jdlObject);
          convertedOptions = returnedMap.get('A');
        });

        after(() => {
          loggerSpy.restore();
        });

        it('should log the automatic setting of the option', () => {
          expect(loggerSpy.getCall(0).args[0]).to.equal(
            "The filter option is set for A, the 'serviceClass' value for the 'service' is gonna be set for this " +
              'entity if no other value has been set.'
          );
        });
        it('should set the service option to serviceClass', () => {
          expect(convertedOptions).to.deep.equal({
            jpaMetamodelFiltering: true,
            service: 'serviceClass',
          });
        });
      });
      context('when the searching option is set with exclusions', () => {
        let convertedOptions;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          jdlObject.addEntity(entityA);
          jdlObject.addOption(
            new JDLUnaryOption({
              name: BinaryOptions.Options.SEARCH,
              values: BinaryOptions.Values.search.COUCHBASE,
              entityNames: ['*'],
              excludedNames: ['A'],
            })
          );
          const returnedMap = convert(jdlObject);
          convertedOptions = returnedMap.get('A');
        });

        it('should prevent the entities from being searched', () => {
          expect(convertedOptions).to.deep.equal({ searchEngine: false });
        });
      });
    });
  });
});
