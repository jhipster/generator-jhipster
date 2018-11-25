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

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const { convertServerOptionsToJDL } = require('../../../lib/converters/json_to_jdl_option_converter');
const JDLObject = require('../../../lib/core/jdl_object');
const JDLUnaryOption = require('../../../lib/core/jdl_unary_option');
const { SKIP_USER_MANAGEMENT, SKIP_CLIENT } = require('../../../lib/core/jhipster/unary_options');

describe('JSONToJDLOptionConverter', () => {
  describe('convertToServerOptions', () => {
    context('when not passing any argument', () => {
      let jdlObject;

      before(() => {
        jdlObject = convertServerOptionsToJDL();
      });

      it('returns an empty jdl object', () => {
        expect(jdlObject.getOptionQuantity()).to.equal(0);
      });
    });
    context('when not passing a jdl object', () => {
      let jdlObject;

      before(() => {
        jdlObject = convertServerOptionsToJDL({ 'generator-jhipster': { skipUserManagement: true } });
      });

      it('returns the converted options', () => {
        expect(jdlObject.getOptionsForName(SKIP_USER_MANAGEMENT)).not.to.be.undefined;
      });
    });
    context('when passing a jdl object', () => {
      let jdlObject;

      before(() => {
        const previousJDLObject = new JDLObject();
        previousJDLObject.addOption(
          new JDLUnaryOption({
            name: SKIP_CLIENT
          })
        );
        jdlObject = convertServerOptionsToJDL(
          { 'generator-jhipster': { skipUserManagement: true } },
          previousJDLObject
        );
      });

      it('adds the converted options', () => {
        expect(jdlObject.getOptionsForName(SKIP_USER_MANAGEMENT)).not.to.be.undefined;
        expect(jdlObject.getOptionsForName(SKIP_CLIENT)).not.to.be.undefined;
      });
    });
  });
});

/*
    context('when parsing app config file to JDL', () => {
      let jdlObject = null;

      before(() => {
        const yoRcJson = readJsonYoFile();
        jdlObject = parseServerOptions(yoRcJson['generator-jhipster']);
      });

      it('parses server options', () => {
        expect(
          jdlObject
            .getOptions()
            .filter(option => option.name === UnaryOptions.SKIP_CLIENT && option.entityNames.has('*')).length
        ).to.eq(1);
        expect(
          jdlObject
            .getOptions()
            .filter(option => option.name === UnaryOptions.SKIP_SERVER && option.entityNames.has('*')).length
        ).to.eq(1);
      });
    });
 */
