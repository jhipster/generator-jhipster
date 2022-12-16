/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import { expect } from 'chai';
import { convertServerOptionsToJDL } from '../../../jdl/converters/json-to-jdl-option-converter.js';
import JDLObject from '../../../jdl/models/jdl-object.js';
import JDLUnaryOption from '../../../jdl/models/jdl-unary-option.js';
import UnaryOptions from '../../../jdl/jhipster/unary-options.js';

const { SKIP_CLIENT } = UnaryOptions;

describe('JSONToJDLOptionConverter', () => {
  describe('convertToServerOptions', () => {
    context('when not passing any argument', () => {
      let jdlObject;

      before(() => {
        // @ts-expect-error
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
