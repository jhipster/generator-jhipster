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

import type { JDLNodeKind } from './types/parsed.ts';

export type { JDLNodeKind } from './types/parsed.ts';

/**
 * The properties of each kind of node that hold its child nodes, in the order they are visited. A property may hold a node,
 * an array of nodes, or a record whose values are nodes or records of nodes (the options, by name and by value).
 */
export const visitorKeys: Readonly<Record<JDLNodeKind, readonly string[]>> = {
  JDL: ['constants', 'applications', 'deployments', 'entities', 'enums', 'relationships', 'options', 'useOptions'],
  Constants: [],
  Application: ['config', 'namespaceConfigs', 'entitiesOptions', 'options', 'useOptions'],
  ApplicationConfig: [],
  NamespaceConfig: [],
  ApplicationEntities: [],
  Deployment: [],
  Entity: ['annotations', 'body'],
  Field: ['annotations', 'validations'],
  Annotation: [],
  Validation: [],
  Enum: ['values'],
  EnumValue: [],
  Relationship: ['from', 'to', 'options'],
  RelationshipSide: [],
  RelationshipOptions: ['global', 'source', 'destination'],
  Option: [],
  UseOption: [],
};

/**
 * Attach the kind to a node of the AST. It is not enumerable, like the location, so that the AST keeps its shape; and it is
 * not `type`, which a field and an annotation already have.
 */
export function setKind<T extends object>(node: T, kind: JDLNodeKind): T {
  Object.defineProperty(node, 'kind', { value: kind, enumerable: false, writable: true, configurable: true });
  return node;
}

/** The kind of a node of the AST, undefined for any other value. */
export const getKind = (value: unknown): JDLNodeKind | undefined =>
  typeof value === 'object' && value !== null ? (value as { kind?: JDLNodeKind }).kind : undefined;

export type JDLNode = object & { readonly kind: JDLNodeKind };

/** Every node a property value holds: the node itself, the nodes of an array, or of a record, in order. */
function collectNodes(value: unknown, nodes: JDLNode[]): void {
  if (typeof value !== 'object' || value === null) return;
  if (getKind(value)) {
    nodes.push(value as JDLNode);
  } else if (Array.isArray(value)) {
    for (const item of value) collectNodes(item, nodes);
  } else {
    for (const item of Object.values(value)) collectNodes(item, nodes);
  }
}

/** The child nodes of a node, in the order of its visitor keys. */
export function getChildNodes(node: JDLNode): JDLNode[] {
  const nodes: JDLNode[] = [];
  for (const key of visitorKeys[node.kind]) {
    collectNodes((node as Record<string, unknown>)[key], nodes);
  }
  return nodes;
}

export type JDLNodeVisitor = {
  enter?: (node: JDLNode, parent: JDLNode | undefined) => void;
  leave?: (node: JDLNode, parent: JDLNode | undefined) => void;
};

/** Visit a node and its descendants, depth first. */
export function walkJDL(node: JDLNode, visitor: JDLNodeVisitor, parent?: JDLNode): void {
  visitor.enter?.(node, parent);
  for (const child of getChildNodes(node)) {
    walkJDL(child, visitor, node);
  }
  visitor.leave?.(node, parent);
}
