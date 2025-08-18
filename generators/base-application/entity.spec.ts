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

import { expect } from 'esmocha';

import { mutateMockedCompleteData, mutateMockedData } from '../../lib/testing/index.ts';

import { mutateEntity, mutateRelationship, mutateRelationshipWithEntity } from './entity.ts';

describe('mutation object test', () => {
  it('expects mutateRelationship to match snapshot', () => {
    expect(mutateMockedData(mutateRelationship)).toMatchSnapshot();
  });
  it("expects mutateRelationship to don't override existing properties", () => {
    expect(Object.keys(mutateMockedCompleteData(mutateRelationship))).toHaveLength(0);
  });
  it('expects mutateRelationshipWithEntity to match snapshot', () => {
    expect(mutateMockedData(mutateRelationshipWithEntity)).toMatchSnapshot();
  });
  it("expects mutateRelationshipWithEntity to don't override existing properties", () => {
    expect(Object.keys(mutateMockedCompleteData(mutateRelationshipWithEntity))).toHaveLength(0);
  });
  it('expects mutateEntity to match snapshot', () => {
    expect(mutateMockedData(mutateEntity)).toMatchSnapshot();
  });
  it("expects mutateEntity to don't override existing properties", () => {
    expect(Object.keys(mutateMockedCompleteData(mutateEntity))).toHaveLength(0);
  });
});
