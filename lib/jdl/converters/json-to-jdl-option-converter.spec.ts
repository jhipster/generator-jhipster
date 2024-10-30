/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import { before, describe, it } from 'esmocha';
import { expect } from 'chai';
import JDLObject from '../core/models/jdl-object.js';
import JDLUnaryOption from '../core/models/jdl-unary-option.js';
import { unaryOptions } from '../core/built-in-options/index.js';
import { convertServerOptionsToJDL } from './json-to-jdl-option-converter.js';

const { SKIP_CLIENT } = unaryOptions;

describe('jdl - JSONToJDLOptionConverter', () => {
  describe('convertToServerOptions', () => {
    describe('when not passing any argument', () => {
      let jdlObject;

      before(() => {
        // @ts-expect-error
        jdlObject = convertServerOptionsToJDL();
      });

      it('should return an empty jdl object', () => {
        expect(jdlObject.getOptionQuantity()).to.equal(0);
      });
    });
    describe('when passing a jdl object', () => {
      let jdlObject;

      before(() => {
        const previousJDLObject = new JDLObject();
        previousJDLObject.addOption(
          new JDLUnaryOption({
            name: SKIP_CLIENT,
          }),
        );
        jdlObject = convertServerOptionsToJDL({ 'generator-jhipster': {} }, previousJDLObject);
      });

      it('should add the converted options', () => {
        expect(jdlObject.getOptionsForName(SKIP_CLIENT)).not.to.be.undefined;
      });
    });
  });
});
