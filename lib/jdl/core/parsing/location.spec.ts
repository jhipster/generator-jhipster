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

import { getDefaultRuntime } from '../../../jdl-config/jdl-runtime.ts';
import { parseFromContent } from '../readers/jdl-reader.ts';

import type { JDLLocation, ParsedJDLApplications } from './types/parsed.ts';

const content = `/** The answer */
MAX = 42

application {
  config {
    baseName jhipster
    clientFramework angular
  }
  config(myNamespace) {
    someKey someValue
  }
  entities A
}

deployment {
  deploymentType docker-compose
  appsFolders [jhipster]
}

/** An entity */
@ChangelogDate(20200101000000)
entity A (a_table) {
  /** A field */
  @Id name String required maxlength(MAX)
  age Integer
}

enum Kind {
  FIRST,
  SECOND (second)
}

relationship OneToMany {
  A{children} to @Id A{parent required} with builtInEntity
}

relationship ManyToOne {
  A{first} to A,
  A{second} to A
}

use mapstruct for A
`;

/** The source a location covers. */
const text = (location?: JDLLocation) => location && content.slice(location.startOffset, location.endOffset + 1);

describe('jdl - AST locations', () => {
  let ast: ParsedJDLApplications;

  before(() => {
    ast = parseFromContent(content, getDefaultRuntime());
  });

  it('locates the constants', () => {
    expect(text(ast.constants.keyLocations?.MAX)).toBe('MAX = 42');
  });

  it('locates an application and its config keys', () => {
    const [application] = ast.applications;
    expect(text(application.location)).toMatch(/^application \{[\s\S]*entities A\n\}$/);
    expect(text(application.config.keyLocations?.baseName)).toBe('baseName jhipster');
    expect(text(application.config.keyLocations?.clientFramework)).toBe('clientFramework angular');
    expect(text(application.namespaceConfigs?.myNamespace.keyLocations?.someKey)).toBe('someKey someValue');
  });

  it('locates a deployment and its keys', () => {
    const [deployment] = ast.deployments;
    expect(text(deployment.location)).toMatch(/^deployment \{[\s\S]*\]\n\}$/);
    expect(text(deployment.keyLocations?.deploymentType)).toBe('deploymentType docker-compose');
    expect(text(deployment.keyLocations?.appsFolders)).toBe('appsFolders [jhipster]');
  });

  it('locates an entity, its annotations, fields and validations', () => {
    const [entity] = ast.entities;
    expect(text(entity.location)).toMatch(/^\/\*\* An entity \*\/\n@ChangelogDate[\s\S]*age Integer\n\}$/);
    expect(text(entity.annotations![0].location)).toBe('@ChangelogDate(20200101000000)');
    const [name, age] = entity.body!;
    expect(text(name.location)).toBe('/** A field */\n  @Id name String required maxlength(MAX)');
    expect(text(name.annotations![0].location)).toBe('@Id');
    expect(name.validations.map(validation => text(validation.location))).toEqual(['required', 'maxlength(MAX)']);
    expect(text(age.location)).toBe('age Integer');
  });

  it('locates an enum and its values', () => {
    const [kind] = ast.enums;
    expect(text(kind.location)).toMatch(/^enum Kind \{[\s\S]*\}$/);
    expect(kind.values.map(value => text(value.location))).toEqual(['FIRST', 'SECOND (second)']);
  });

  it('locates a relationship, its sides and options', () => {
    const [oneToMany] = ast.relationships;
    expect(text(oneToMany.location)).toBe('A{children} to @Id A{parent required} with builtInEntity');
    expect(text(oneToMany.from.location)).toBe('A{children}');
    expect(text(oneToMany.to.location)).toBe('A{parent required}');
    expect(text(oneToMany.options.destination[0].location)).toBe('@Id');
    expect(text(oneToMany.options.global[0].location)).toBe('builtInEntity');
  });

  it('locates each relationship of a declaration of several', () => {
    expect(ast.relationships.slice(1).map(relationship => text(relationship.location))).toEqual(['A{first} to A', 'A{second} to A']);
  });

  it('locates a use statement', () => {
    expect(text(ast.useOptions[0].location)).toBe('use mapstruct for A');
  });

  it('keeps the locations out of the enumerable shape of the AST', () => {
    const [deployment] = ast.deployments;
    expect(Object.keys(deployment)).not.toContain('location');
    expect(Object.keys(deployment)).not.toContain('keyLocations');
    expect(Object.keys(ast.applications[0].config)).not.toContain('keyLocations');
    expect(JSON.stringify(ast)).not.toContain('Offset');
  });
});
