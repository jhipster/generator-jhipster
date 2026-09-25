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
import type { CstElement, CstNode, IToken } from 'chevrotain';

import type { JDLLocation } from './types/parsed.ts';

const isCstNode = (element: CstElement): element is CstNode => 'children' in element;

/** A token inserted by error recovery has no position. */
const isPositioned = (token: IToken) => !Number.isNaN(token.startOffset);

/**
 * The first or the last positioned token of a rule, its sub rules included. The elements of a label are in source order, so only the
 * first (or last) element of each label is a candidate: a rule is not walked whole.
 */
function edgeToken(children: Record<string, CstElement[] | undefined>, last: boolean): IToken | undefined {
  let edge: IToken | undefined;
  for (const elements of Object.values(children)) {
    if (!elements) continue;
    // A recovered element has no position, try the next one of the label.
    for (let index = 0; index < elements.length; index++) {
      const element = elements[last ? elements.length - 1 - index : index];
      let token: IToken | undefined;
      if (isCstNode(element)) {
        token = edgeToken(element.children, last);
      } else if (isPositioned(element)) {
        token = element;
      }
      if (token) {
        if (!edge || (last ? token.startOffset > edge.startOffset : token.startOffset < edge.startOffset)) edge = token;
        break;
      }
    }
  }
  return edge;
}

/** The source range of a token. */
export const tokenLocation = (token: IToken): JDLLocation => ({
  startOffset: token.startOffset,
  endOffset: token.endOffset!,
  startLine: token.startLine!,
  startColumn: token.startColumn!,
  endLine: token.endLine!,
  endColumn: token.endColumn!,
});

/** The source range of the tokens of a rule, its sub rules included; undefined when it has none, a recovered rule. */
export function spanLocation(children: Record<string, CstElement[] | undefined>): JDLLocation | undefined {
  const first = edgeToken(children, false);
  const last = edgeToken(children, true);
  if (!first || !last) return undefined;
  return {
    startOffset: first.startOffset,
    endOffset: last.endOffset!,
    startLine: first.startLine!,
    startColumn: first.startColumn!,
    endLine: last.endLine!,
    endColumn: last.endColumn!,
  };
}

/** The position of a node for an error message, in the form the parser reports it; empty when the node was not parsed. */
export const errorLocation = (location: JDLLocation | undefined): string =>
  location ? `\n\tat line: ${location.startLine}, column: ${location.startColumn}` : '';

/**
 * Attach the location to a node of the AST. It is not enumerable so that the AST keeps its shape: a config is a record whose
 * entries are its options, and comparing or serializing a node ignores where it was written.
 */
export function setLocation<T extends object>(node: T, location: JDLLocation | undefined): T {
  Object.defineProperty(node, 'location', { value: location, enumerable: false, writable: true, configurable: true });
  return node;
}

/** Attach another location to a node, not enumerable for the same reason as {@link setLocation}. */
export function setOtherLocation<T extends object>(node: T, name: string, location: JDLLocation | undefined): T {
  Object.defineProperty(node, name, { value: location, enumerable: false, writable: true, configurable: true });
  return node;
}

/** Attach the locations of the keys of a record node, not enumerable for the same reason as {@link setLocation}. */
/** Add the key locations of a node merged into another one, the first location of a key wins. */
export function mergeKeyLocations(target: object, keyLocations: Record<string, JDLLocation | undefined> | undefined): void {
  const merged = {
    ...(keyLocations ?? {}),
    ...((target as { keyLocations?: Record<string, JDLLocation | undefined> }).keyLocations ?? {}),
  };
  setKeyLocations(target, merged);
}

export function setKeyLocations<T extends object>(node: T, keyLocations: Record<string, JDLLocation | undefined>): T {
  Object.defineProperty(node, 'keyLocations', { value: keyLocations, enumerable: false, writable: true, configurable: true });
  return node;
}
