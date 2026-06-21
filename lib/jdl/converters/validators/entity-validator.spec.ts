/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { before, describe, expect, it } from 'esmocha';

import { JDLEntity } from '../../core/models/index.ts';

import EntityValidator from './entity-validator.ts';

describe('jdl - EntityValidator', () => {
  let validator: EntityValidator;

  before(() => {
    validator = new EntityValidator();
  });

  describe('validate', () => {
    describe('when not passing an entity', () => {
      it('should fail', () => {
        // @ts-expect-error invalid api test
        expect(() => validator.validate()).toThrow(/^No entity\.$/);
      });
    });
    describe('when passing an entity', () => {
      describe('with every required attribute', () => {
        it('should not fail', () => {
          expect(() =>
            validator.validate(
              new JDLEntity({
                name: 'A',
              }),
            ),
          ).not.toThrow();
        });
      });
      describe('without any attribute', () => {
        it('should fail', () => {
          // @ts-expect-error invalid api test
          expect(() => validator.validate({})).toThrow(/^The entity attribute name was not found\.$/);
        });
      });
    });
  });
});
