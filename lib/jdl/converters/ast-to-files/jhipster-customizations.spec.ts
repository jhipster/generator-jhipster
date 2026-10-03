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

import { getDefaultRuntime } from '../../../jdl-config/jdl-runtime.ts';
import { parse, performJDLPostParsingTasks } from '../../core/parsing/index.ts';

import { convertAstToFiles } from './ast-to-files.ts';
import { jhipsterCustomizations } from './jhipster-customizations.ts';

const runtime = getDefaultRuntime();

const convert = (jdl: string) =>
  convertAstToFiles(performJDLPostParsingTasks(parse(jdl, runtime, { onWarning: () => {} })), runtime, jhipsterCustomizations);

describe('jdl - jhipsterCustomizations', () => {
  it('should name an application without base name jhipster', () => {
    expect(convert('application {\n  config { applicationType monolith }\n}')).toEqual({
      files: { 'jhipster/.yo-rc.json': { 'generator-jhipster': { baseName: 'jhipster', applicationType: 'monolith', entities: [] } } },
      relativeRoot: 'jhipster',
    });
  });

  it('should name a blueprint and its namespace config after its package', () => {
    expect(
      convert('application {\n  config { baseName shop blueprints [foo, generator-jhipster-bar] }\n  config(foo) { flag true }\n}').files[
        'shop/.yo-rc.json'
      ],
    ).toEqual({
      'generator-jhipster-foo': { flag: true },
      'generator-jhipster': {
        baseName: 'shop',
        blueprints: [{ name: 'generator-jhipster-foo' }, { name: 'generator-jhipster-bar' }],
        entities: [],
      },
    });
  });

  it('should make a relationship naming no field bidirectional', () => {
    const { files } = convert('entity A\nentity B\nrelationship OneToMany { A to B }');
    expect(Object.values(files).map(entity => entity.relationships)).toEqual([
      [
        {
          relationshipSide: 'left',
          relationshipType: 'one-to-many',
          otherEntityName: 'b',
          otherEntityRelationshipName: 'a',
          relationshipName: 'b',
        },
      ],
      [
        {
          relationshipSide: 'right',
          relationshipType: 'many-to-one',
          otherEntityName: 'a',
          otherEntityRelationshipName: 'b',
          relationshipName: 'a',
        },
      ],
    ]);
  });

  it('should keep a relationship naming a field unidirectional', () => {
    const { files } = convert('entity A\nentity B\nrelationship ManyToOne { A{b} to B }');
    expect(files['.jhipster/B.json'].relationships).toEqual([]);
  });
});
