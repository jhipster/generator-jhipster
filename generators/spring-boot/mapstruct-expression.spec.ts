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
import { readFileSync } from 'node:fs';

import ejs from 'ejs';
import { uniq, uniqWith, upperFirst } from 'lodash-es';

import { parseFromContent } from '../../lib/jdl/core/readers/jdl-reader.ts';
import { createRuntime } from '../../lib/jdl/core/runtime.ts';

const template = readFileSync(
  new URL('./templates/src/main/java/_package_/_entityPackage_/service/mapper/_entityClass_Mapper.java.ejs', import.meta.url),
  'utf8',
);

describe('spring-boot - MapstructExpression escaping', () => {
  const runtime = createRuntime();

  for (const related of [false, true]) {
    it(`should render escaped expressions for ${related ? 'related' : 'direct'} fields`, () => {
      const parsed = parseFromContent(
        String.raw`entity StreamRights {
  @MapstructExpression("java(s.getId() + \" | \" + s.getName())")
  details String
}`,
        runtime,
      );
      const expression = parsed.entities[0].body?.[0].annotations?.[0].optionValue;
      if (typeof expression !== 'string') {
        throw new Error('Expected a parsed MapstructExpression string.');
      }
      const expressionField = { propertyName: 'details', mapstructExpression: expression };
      const otherEntity = {
        entityClass: 'Owner',
        entityInstance: 'owner',
        persistClass: 'Owner',
        persistInstance: 'owner',
        dtoClass: 'OwnerDTO',
        entityAbsoluteClass: 'com.example.Owner',
        entityAbsolutePackage: 'com.example',
        primaryKey: { fields: [{ propertyName: 'id' }] },
      };
      const relationship = {
        relationshipName: 'owner',
        propertyName: 'owner',
        otherEntityField: 'details',
        ownerSide: true,
        otherEntity,
        relatedField: expressionField,
      };
      const source = ejs.render(
        template,
        {
          entityAbsolutePackage: 'com.example',
          entityAbsoluteClass: 'com.example.StreamRights',
          entityClass: 'StreamRights',
          persistClass: 'StreamRights',
          dtoClass: 'StreamRightsDTO',
          dtoInstance: 'streamRightsDTO',
          embedded: false,
          fluentMethods: false,
          primaryKey: { ids: [{ name: 'id' }] },
          fields: related ? [] : [expressionField],
          restProperties: related ? [relationship] : [],
          otherEntities: related ? [otherEntity] : [],
          relationship,
        },
        { context: { _: { uniq, uniqWith, upperFirst } } },
      );

      expect(source).toMatchSnapshot();
      const expressionLiteral = /expression = ("(?:[^"\\]|\\.)*")/.exec(source)?.[1];
      if (!expressionLiteral) {
        throw new Error('Expected a generated Java expression literal.');
      }
      expect(JSON.parse(expressionLiteral)).toBe(expression);
    });
  }
});
