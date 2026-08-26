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

import { beforeEach, describe, expect, it } from 'esmocha';

import type { Entity as SpringBootEntity, Field as SpringBootField } from '../types.d.ts';

import { prepareMapstructField } from './prepare-field.ts';

describe('prepareField', () => {
  describe('prepareMapstructField', () => {
    const testEntity = Object.freeze({ name: 'Entity' }) as unknown as SpringBootEntity;
    const mapstructField = Object.freeze({
      fieldName: 'name',
      fieldType: 'String',
      mapstructExpression: 'java()',
    }) as unknown as SpringBootField;

    describe('with dto != mapstruct and @MapstructExpression', () => {
      it('should fail', () => {
        expect(() => prepareMapstructField({ ...testEntity, dto: 'any' }, { ...mapstructField })).toThrow(
          /^@MapstructExpression requires an Entity with mapstruct dto \[Entity.name\].$/,
        );
      });
    });
    describe('with dto == mapstruct and @MapstructExpression', () => {
      let field: any;
      beforeEach(() => {
        field = prepareMapstructField({ ...testEntity, dto: 'mapstruct' }, { ...mapstructField });
      });
      it('should set field as transient and readonly', () => {
        expect(field.transient).toBe(true);
        expect(field.readonly).toBe(true);
      });
    });
  });
});
