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

import { jestExpect } from 'mocha-expect-snapshot';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
import { expect } from 'chai';

import JDLObject from '../../../../jdl/models/jdl-object.js';
import { JDLEntity } from '../../../../jdl/models/index.mjs';
import JDLUnaryOption from '../../../../jdl/models/jdl-unary-option.js';
import JDLBinaryOption from '../../../../jdl/models/jdl-binary-option.js';
import { unaryOptions, binaryOptions } from '../../../../jdl/jhipster/index.mjs';
import { convert } from '../../../../jdl/converters/jdl-to-json/jdl-to-json-option-converter.js';
import logger from '../../../../jdl/utils/objects/logger.js';

describe('jdl - JDLToJSONOptionConverter', () => {
  describe('convert', () => {
    context('when not passing a JDL option holder', () => {
      it('should fail', () => {
        // @ts-expect-error
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
              name: unaryOptions.EMBEDDED,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: unaryOptions.NO_FLUENT_METHOD,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: unaryOptions.FILTER,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: unaryOptions.READ_ONLY,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: unaryOptions.SKIP_CLIENT,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: unaryOptions.SKIP_SERVER,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.ANGULAR_SUFFIX,
              value: 'suffix',
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.CLIENT_ROOT_FOLDER,
              value: '../client_root_folder',
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.DTO,
              value: binaryOptions.Values.dto.MAPSTRUCT,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.MICROSERVICE,
              value: 'myMs',
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.PAGINATION,
              value: binaryOptions.Values.pagination.PAGINATION,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.SEARCH,
              value: binaryOptions.Values.search.COUCHBASE,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.SERVICE,
              value: binaryOptions.Values.service.SERVICE_IMPL,
              entityNames: ['A'],
            }),
          ];
          jdlObject.addEntity(entityA);
          options.forEach(option => jdlObject.addOption(option));
          const returned: any = convert(jdlObject);
          convertedOptions = returned.get('A');
        });

        it('should convert the options', () => {
          jestExpect(convertedOptions).toMatchInlineSnapshot(`
{
  "angularJSSuffix": "suffix",
  "clientRootFolder": "../client_root_folder",
  "dto": "mapstruct",
  "embedded": true,
  "fluentMethods": false,
  "jpaMetamodelFiltering": true,
  "microserviceName": "myMs",
  "pagination": "pagination",
  "readOnly": true,
  "searchEngine": "couchbase",
  "service": "serviceImpl",
  "skipClient": true,
  "skipServer": true,
}
`);
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
              name: binaryOptions.Options.DTO,
              value: binaryOptions.Values.dto.MAPSTRUCT,
              entityNames: ['A'],
            })
          );
          const returnedMap: any = convert(jdlObject);
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
          jestExpect(convertedOptions).toMatchInlineSnapshot(`
{
  "dto": "mapstruct",
  "service": "serviceClass",
}
`);
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
              name: unaryOptions.FILTER,
              entityNames: ['A'],
            })
          );
          const returnedMap: any = convert(jdlObject);
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
          jestExpect(convertedOptions).toMatchInlineSnapshot(`
{
  "jpaMetamodelFiltering": true,
  "service": "serviceClass",
}
`);
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
              name: binaryOptions.Options.SEARCH,
              values: binaryOptions.Values.search.COUCHBASE,
              entityNames: ['*'],
              excludedNames: ['A'],
            })
          );
          const returnedMap: any = convert(jdlObject);
          convertedOptions = returnedMap.get('A');
        });

        it('should prevent the entities from being searched', () => {
          jestExpect(convertedOptions).toMatchInlineSnapshot(`
{
  "searchEngine": "no",
}
`);
        });
      });
    });
  });
});
