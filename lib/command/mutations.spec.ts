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
import { describe, expect, it } from 'esmocha';

import { mutateData } from '../utils/object.ts';

import { getEntityDerivedPropertyMutations } from './mutations.ts';

describe('lib - command - mutations', () => {
  describe('getEntityDerivedPropertyMutations', () => {
    const entityConfigs = {
      readOnly: { jdl: { type: 'unary' } },
      service: { choices: ['serviceClass', 'serviceImpl', 'no'], jdl: { type: 'binary' } },
      pagination: { choices: ['pagination', 'infinite-scroll', 'no'], jdl: { type: 'binary' } },
    } as const;

    it('should derive a flag for each choice and one for any choice but no', () => {
      const entity: Record<string, any> = { service: 'serviceImpl', pagination: 'no' };
      mutateData(entity, getEntityDerivedPropertyMutations(entityConfigs));
      expect(entity).toEqual({
        service: 'serviceImpl',
        serviceServiceClass: false,
        serviceServiceImpl: true,
        serviceNo: false,
        serviceAny: true,
        pagination: 'no',
        paginationPagination: false,
        paginationInfiniteScroll: false,
        paginationNo: true,
        paginationAny: false,
      });
    });

    it('should keep the flags already set', () => {
      const entity: Record<string, any> = { pagination: 'pagination', paginationAny: false };
      mutateData(entity, getEntityDerivedPropertyMutations({ pagination: entityConfigs.pagination }));
      expect(entity.paginationAny).toBe(false);
    });
  });
});
