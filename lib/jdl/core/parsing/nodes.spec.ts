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

import { parseJDL } from './api.ts';
import { type JDLNode, getKind, visitorKeys, walkJDL } from './nodes.ts';
import type { JDLLocation, ParsedJDLApplications } from './types/parsed.ts';

const content = `MAX = 42

application {
  config {
    baseName jhipster
    blueprints [my-blueprint]
  }
  config(my-blueprint) {
    someKey someValue
  }
  entities A
  dto A with mapstruct
  readOnly A
  use elasticsearch for A
}

deployment {
  deploymentType docker-compose
  appsFolders [jhipster]
}

@ChangelogDate(20200101000000)
entity A {
  @Id name String required maxlength(MAX)
}

enum Kind {
  FIRST
}

relationship OneToMany {
  A{children} to @Id A{parent} with builtInEntity
}

paginate A with pagination
skipClient A
use mapstruct for A
`;

/** Every object reachable through the enumerable properties, as a snapshot or a JSON would see the AST. */
function reachableObjects(value: unknown, objects: object[] = []): object[] {
  if (typeof value === 'object' && value !== null) {
    objects.push(value);
    for (const item of Object.values(value)) reachableObjects(item, objects);
  }
  return objects;
}

describe('jdl - AST nodes', () => {
  let ast: ParsedJDLApplications;
  let visited: { node: JDLNode; parent?: JDLNode }[];
  const text = (location?: JDLLocation) => location && content.slice(location.startOffset, location.endOffset + 1);

  before(() => {
    const result = parseJDL(content, getDefaultRuntime());
    expect(result.diagnostics.filter(({ severity }) => severity === 'error')).toEqual([]);
    ast = result.ast!;
    visited = [];
    walkJDL(ast as JDLNode, { enter: (node, parent) => visited.push({ node, parent }) });
  });

  it('gives every kind to a node of a jdl that has them all', () => {
    expect(new Set(visited.map(({ node }) => node.kind))).toEqual(new Set(Object.keys(visitorKeys)));
  });

  it('visits every located object of the AST once', () => {
    const located = reachableObjects(ast).filter(object => 'location' in object || 'keyLocations' in object);
    const nodes: object[] = visited.map(({ node }) => node);
    expect(located.filter(object => !nodes.includes(object))).toEqual([]);
    expect(new Set(nodes).size).toBe(nodes.length);
  });

  it('visits a node after its parent, with its parent', () => {
    const field = visited.find(({ node }) => node.kind === 'Field')!;
    expect(field.parent?.kind).toBe('Entity');
    expect(text((field.node as { location?: JDLLocation }).location)).toBe('@Id name String required maxlength(MAX)');
    expect(visited.filter(({ node }) => node.kind === 'Validation').map(({ parent }) => parent?.kind)).toEqual(['Field', 'Field']);
    expect(visited.filter(({ node }) => node.kind === 'Option').map(({ parent }) => parent?.kind)).toEqual([
      'Application',
      'Application',
      'JDL',
      'JDL',
    ]);
  });

  it('keeps the kind out of the enumerable properties', () => {
    const entity = ast.entities[0];
    expect(getKind(entity)).toBe('Entity');
    expect(Object.keys(entity)).not.toContain('kind');
    expect(JSON.stringify(ast)).not.toContain('"kind"');
    // The field type is not the kind.
    expect(entity.body![0]).toMatchObject({ type: 'String', kind: 'Field' });
  });
});
