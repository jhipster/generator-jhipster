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

import { entityOptions } from '../../../lib/jhipster/index.ts';

import { generateEntityClientImports, generateTestEntityId } from './template-utils.ts';

const { MapperTypes } = entityOptions;

const NO_DTO = MapperTypes.NO;

describe('generator - client - support - template-utils', () => {
  describe('generateEntityClientImports', () => {
    describe('with relationships to entities', () => {
      const relationships = [
        {
          otherEntity: {
            clientRootFolder: '',
            entityAngularName: 'EntityA',
          },
          persistableRelationship: true,
        },
        {
          otherEntity: {
            clientRootFolder: '',
            entityAngularName: 'EntityB',
          },
          relationshipEagerLoad: true,
        },
        {
          otherEntity: {
            clientRootFolder: '',
            entityAngularName: 'EntityC',
          },
        },
      ];

      it('return only imports for relevant relationships for fields', () => {
        const imports = generateEntityClientImports(relationships as any, NO_DTO);
        expect(imports.has('IEntityA')).toBe(true);
        expect(imports.has('IEntityB')).toBe(true);
        expect(imports.size).toEqual(2);
      });
    });

    describe('with relationships from or to the User', () => {
      const relationships = [
        {
          otherEntity: {
            clientRootFolder: '',
            entityAngularName: 'User',
          },
          persistableRelationship: true,
        },
        {
          otherEntity: {
            clientRootFolder: '',
            entityAngularName: 'AnEntity',
          },
          persistableRelationship: true,
        },
      ];
      describe('when called with 2 distinct relationships without dto option', () => {
        it('return a Map with 2 imports', () => {
          const imports = generateEntityClientImports(relationships as any, NO_DTO);
          expect(imports.has('IUser')).toBe(true);
          expect(imports.has('IAnEntity')).toBe(true);
          expect(imports.size).toEqual(relationships.length);
        });
      });
      describe('when called with 2 identical relationships without dto option', () => {
        const relationships = [
          {
            otherEntity: {
              clientRootFolder: '',
              entityAngularName: 'User',
            },
            persistableRelationship: true,
          },
          {
            otherEntity: {
              clientRootFolder: '',
              entityAngularName: 'User',
            },
            persistableRelationship: true,
          },
        ];
        it('return a Map with 1 import', () => {
          const imports = generateEntityClientImports(relationships as any, NO_DTO);
          expect(imports.has('IUser')).toBe(true);
          expect(imports.size).toEqual(1);
        });
      });
    });
  });

  describe('generateTestEntityId', () => {
    describe('when called with int', () => {
      it('return 123', () => {
        expect(generateTestEntityId('Integer')).toBe(123);
      });
    });
    describe('when called with String', () => {
      it("return 'ABC'", () => {
        expect(generateTestEntityId('String')).toBe("'ABC'");
      });
    });
    describe('when called with UUID', () => {
      it("return '9fec3727-3421-4967-b213-ba36557ca194'", () => {
        expect(generateTestEntityId('UUID')).toBe("'9fec3727-3421-4967-b213-ba36557ca194'");
      });
    });
  });
});
