/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { describe, it } from 'esmocha';
import { expect } from 'chai';
import FieldIssue from './field-issue.js';

describe('jdl - FieldIssue', () => {
  describe('new', () => {
    describe('when not passing any arg', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => new FieldIssue()).to.throw(/^An issue must at least have a rule name\.$/);
      });
    });
    describe('when not passing a rule name', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => new FieldIssue({})).to.throw(/^An issue must at least have a rule name\.$/);
      });
    });
    describe('when not passing an entity name', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => new FieldIssue({ ruleName: 'Toto' })).to.throw(/^A field name and its entity's name must be passed\.$/);
      });
    });
    describe('when not passing a field name', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => new FieldIssue({ ruleName: 'Toto', entityName: 'A' })).to.throw(
          /^A field name and its entity's name must be passed\.$/,
        );
      });
    });
  });
});
