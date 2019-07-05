/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const { JPA_DERIVED_IDENTIFIER, exists } = require('../../../../lib/core/jhipster/relationship_options');

describe('RelationshipOptions', () => {
  describe('exists', () => {
    describe('when the option does not exist', () => {
      it('returns false', () => {
        expect(exists('toto')).to.be.false;
      });
    });
    describe('when the option exists', () => {
      it('returns true', () => {
        expect(exists(JPA_DERIVED_IDENTIFIER)).to.be.true;
      });
    });
  });
});
