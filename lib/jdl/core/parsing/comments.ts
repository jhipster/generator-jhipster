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

import type { JDLComment } from './api.ts';
import { getStatementChildren } from './statements.ts';
import type { JDLLocation } from './types/parsed.ts';

/**
 * The comments of a node printed on its own, a statement, a field, an enum value, a relationship or a statement of an
 * application: they are printed with it.
 */
export type JDLNodeComments = {
  /** The comments before the node, from the previous node or the start of the block. */
  leading: JDLComment[];
  /** The comment ending the line the node ends on. */
  trailing?: JDLComment;
  /** The comments after the last node of a block, up to its end. */
  after: JDLComment[];
};

const locationOf = (node: object): JDLLocation | undefined => (node as { location?: JDLLocation }).location;

/** The comments of a node; none for a node the parser did not build. */
export const getNodeComments = (node: object): JDLNodeComments | undefined => (node as { comments?: JDLNodeComments }).comments;

function nodeComments(node: object): JDLNodeComments {
  let comments = getNodeComments(node);
  if (!comments) {
    comments = { leading: [], after: [] };
    Object.defineProperty(node, 'comments', { value: comments, enumerable: false, writable: true, configurable: true });
  }
  return comments;
}

/**
 * Gives each comment to the node it is about: the comment ending the line of a node is its trailing one, a comment
 * before a node one of its leading ones, and a comment after the last node of a block one of the comments after it.
 * A comment inside a node goes to the nodes that node holds; one inside a field or another node without such nodes is
 * left out. Not enumerable, like the locations.
 * @param statements - the statements of a jdl, as the parser keeps them.
 * @param comments - the comments of the jdl, but the javadocs, which are documentation or statements.
 */
export function attachComments(statements: readonly object[], comments: readonly JDLComment[]): void {
  const inside = new Map<object, JDLComment[]>();
  const located = statements.filter(node => locationOf(node));
  for (const comment of comments) {
    const { startOffset, endOffset, startLine } = comment.location;
    const holder = located.find(node => locationOf(node)!.startOffset <= startOffset && endOffset <= locationOf(node)!.endOffset);
    if (holder) {
      inside.set(holder, [...(inside.get(holder) ?? []), comment]);
      continue;
    }
    const previous = located.findLast(node => locationOf(node)!.endOffset < startOffset);
    const next = located.find(node => locationOf(node)!.startOffset > endOffset);
    if (previous && locationOf(previous)!.endLine === startLine && !nodeComments(previous).trailing) {
      nodeComments(previous).trailing = comment;
    } else if (next) {
      nodeComments(next).leading.push(comment);
    } else if (previous) {
      nodeComments(previous).after.push(comment);
    }
  }
  for (const [holder, holderComments] of inside) {
    attachComments(getStatementChildren(holder), holderComments);
  }
}
