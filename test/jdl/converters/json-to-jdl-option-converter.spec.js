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

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const { convertServerOptionsToJDL } = require('../../../jdl/converters/json-to-jdl-option-converter');
const JDLObject = require('../../../jdl/models/jdl-object');
const JDLUnaryOption = require('../../../jdl/models/jdl-unary-option');
const { SKIP_CLIENT } = require('../../../jdl/jhipster/unary-options');

describe('JSONToJDLOptionConverter', () => {
  describe('convertToServerOptions', () => {
    context('when not passing any argument', () => {
      let jdlObject;

      before(() => {
        jdlObject = convertServerOptionsToJDL();
      });

      it('should return an empty jdl object', () => {
        expect(jdlObject.getOptionQuantity()).to.equal(0);
      });
    });
    context('when passing a jdl object', () => {
      let jdlObject;

      before(() => {
        const previousJDLObject = new JDLObject();
        previousJDLObject.addOption(
          new JDLUnaryOption({
            name: SKIP_CLIENT,
          })
        );
        jdlObject = convertServerOptionsToJDL({ 'generator-jhipster': {} }, previousJDLObject);
      });

      it('should add the converted options', () => {
        expect(jdlObject.getOptionsForName(SKIP_CLIENT)).not.to.be.undefined;
      });
    });
  });
});
