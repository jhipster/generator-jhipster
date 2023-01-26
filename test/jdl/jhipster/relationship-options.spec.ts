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

/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { relationshipOptions } from '../../../jdl/jhipster/index.mjs';

const { JPA_DERIVED_IDENTIFIER, exists } = relationshipOptions;

describe('jdl - RelationshipOptions', () => {
  describe('exists', () => {
    describe('when the option does not exist', () => {
      it('should return false', () => {
        expect(exists('toto')).to.be.false;
      });
    });
    describe('when the option exists', () => {
      it('should return true', () => {
        expect(exists(JPA_DERIVED_IDENTIFIER)).to.be.true;
      });
    });
  });
});
