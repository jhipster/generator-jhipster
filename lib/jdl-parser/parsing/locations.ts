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
import type { CstChildrenDictionary, CstNode, IToken } from 'chevrotain';

/** Offsets are UTF-16 offsets, lines and columns are one-based. */
export type SourcePosition = { offset: number; line: number; column: number };
/** Half-open source range: start is included, end is excluded. */
export type SourceRange = { start: SourcePosition; end: SourcePosition };

export const isSourceToken = (token: IToken | undefined): token is IToken =>
  !!token && !token.isInsertedInRecovery && Number.isFinite(token.startOffset) && Number.isFinite(token.endOffset);

export const tokensIn = (value: CstNode | CstChildrenDictionary): IToken[] => {
  const children = 'children' in value && !Array.isArray(value.children) ? value.children : value;
  return Object.values(children).flatMap(elements =>
    (elements as (IToken | CstNode)[]).flatMap(element => {
      if ('children' in element) return tokensIn(element);
      return isSourceToken(element) ? [element] : [];
    }),
  );
};

export const tokenRange = (token: IToken): SourceRange => ({
  start: { offset: token.startOffset, line: token.startLine ?? 1, column: token.startColumn ?? 1 },
  end: {
    offset: token.endOffset! + 1,
    line: token.endLine ?? token.startLine ?? 1,
    column: (token.endColumn ?? token.startColumn ?? 0) + 1,
  },
});

/** Recovery tokens have NaN offsets and must never extend the source range. */
export const sourceRange = (value: CstNode | CstChildrenDictionary): SourceRange => {
  const tokens = tokensIn(value);
  if (!tokens.length) return { start: { offset: 0, line: 1, column: 1 }, end: { offset: 0, line: 1, column: 1 } };
  const first = tokens.reduce((a, b) => (a.startOffset <= b.startOffset ? a : b));
  const last = tokens.reduce((a, b) => (a.endOffset! >= b.endOffset! ? a : b));
  return { start: tokenRange(first).start, end: tokenRange(last).end };
};
