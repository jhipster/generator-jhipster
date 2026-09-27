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
import type { CstNode, IToken } from 'chevrotain';

import type { JDLLocation } from './types/parsed.ts';

/** The source range of a token. */
export const tokenLocation = (token: IToken): JDLLocation => ({
  startOffset: token.startOffset,
  endOffset: token.endOffset!,
  startLine: token.startLine!,
  startColumn: token.startColumn!,
  endLine: token.endLine!,
  endColumn: token.endColumn!,
});

/**
 * The source range of a node of the CST, as the parser tracks it; undefined for a node without token, an empty rule or a
 * rule recovered from an error.
 */
export function nodeLocation(node: CstNode | undefined): JDLLocation | undefined {
  const location = node?.location;
  if (!location || !(location.startOffset >= 0) || !(location.endOffset! >= 0)) return undefined;
  return {
    startOffset: location.startOffset,
    endOffset: location.endOffset!,
    startLine: location.startLine!,
    startColumn: location.startColumn!,
    endLine: location.endLine!,
    endColumn: location.endColumn!,
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

/** A key written again in a key/value block, where it is written: the block keeps the first one. */
export type JDLDuplicatedKey = { key: string; location?: JDLLocation };

/** Sets the keys a key/value block writes again; not enumerable, like the key locations. */
export function setDuplicatedKeys<T extends object>(node: T, duplicatedKeys: JDLDuplicatedKey[]): T {
  Object.defineProperty(node, 'duplicatedKeys', { value: duplicatedKeys, enumerable: false, writable: true, configurable: true });
  return node;
}

export const getDuplicatedKeys = (node: object): JDLDuplicatedKey[] =>
  (node as { duplicatedKeys?: JDLDuplicatedKey[] }).duplicatedKeys ?? [];

/**
 * Fills a key/value block, its config or deployment options: the first value of a key is kept, the keys written again are
 * set apart with where they are written.
 */
export function setKeyValues<T extends Record<string, any>>(
  node: T,
  entries: { key: string; value: unknown; location?: JDLLocation }[],
): T {
  const keyLocations: Record<string, JDLLocation | undefined> = {};
  const duplicatedKeys: JDLDuplicatedKey[] = [];
  for (const { key, value, location } of entries) {
    if (key in keyLocations) {
      duplicatedKeys.push({ key, location });
      continue;
    }
    (node as Record<string, unknown>)[key] = value;
    keyLocations[key] = location;
  }
  return setDuplicatedKeys(setKeyLocations(node, keyLocations), duplicatedKeys);
}
