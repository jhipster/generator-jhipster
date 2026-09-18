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
import type { Rule } from 'eslint';

import { PRIORITY_NAMES, PRIORITY_NAMES_LIST } from '../../../generators/base-application/priorities.ts';
import { PRIORITY_NAMES_LIST as CORE_PRIORITY_NAMES_LIST } from '../../../generators/base-core/priorities.ts';
import {
  PRIORITY_NAMES as WORKSPACES_PRIORITY_NAMES,
  PRIORITY_NAMES_LIST as WORKSPACES_PRIORITY_NAMES_LIST,
} from '../../../generators/base-workspaces/priorities.ts';

/**
 * Methods the environment calls while the generator is being set up, in the order it calls them.
 * They run before any priority, so they are declared before the task groups.
 */
const LIFECYCLE_METHODS = ['beforeQueue', 'postConstruct', '_postConstruct'];

/**
 * The orders the generator runs the priorities in.
 *
 * No single list holds all of them: the application list drops `postPreparing`, and the workspaces priorities
 * live in their own. Two priorities are only comparable when a list holds both — `postPreparing` and
 * `preparingWorkspaces` never meet, and nothing in the code says which of them runs first.
 */
const priorityLists: readonly (readonly string[])[] = [PRIORITY_NAMES_LIST, CORE_PRIORITY_NAMES_LIST, WORKSPACES_PRIORITY_NAMES_LIST];

const knownPriorities = new Set<string>(priorityLists.flat());

/** `PREPARING_EACH_ENTITY` is how a delegating getter names the priority its computed key resolves to. */
const priorityByConstantName = new Map<string, string>(
  Object.entries({ ...PRIORITY_NAMES, ...WORKSPACES_PRIORITY_NAMES }) as [string, string][],
);

/** Whether some list puts `priority` before `other`. Unrelated priorities are left alone. */
const runsBefore = (priority: string, other: string): boolean =>
  priorityLists.some(list => {
    const index = list.indexOf(priority);
    const otherIndex = list.indexOf(other);
    return index !== -1 && otherIndex !== -1 && index < otherIndex;
  });

/** Lifecycle methods come first and plain methods last; the task groups in between order among themselves. */
const GROUP_ORDER = { lifecycle: 0, taskGroup: 1, other: 2 } as const;

type Member = { name: string; group: keyof typeof GROUP_ORDER; lifecycleIndex?: number };

/**
 * Where a member belongs, from either its name or, for a delegating getter, the constant its computed key reads.
 */
const classify = (node: any): Member | undefined => {
  const { key, computed, kind, static: isStatic } = node;
  if (isStatic || kind === 'constructor') return undefined;

  if (computed) {
    if (key?.type !== 'MemberExpression' || key.property?.type !== 'Identifier') return undefined;
    const priority = priorityByConstantName.get(key.property.name);
    return priority === undefined ? undefined : { name: priority, group: 'taskGroup' };
  }

  if (key?.type !== 'Identifier') return undefined;
  const { name } = key;

  const lifecycle = LIFECYCLE_METHODS.indexOf(name);
  if (lifecycle !== -1) return { name, group: 'lifecycle', lifecycleIndex: lifecycle };

  if (knownPriorities.has(name)) return { name, group: 'taskGroup' };

  return { name, group: 'other' };
};

/**
 * Whether `member` is declared too late, having to come before `previous`.
 *
 * A task group sitting after a plain method is left out: the plain method is the one that moves, and it is
 * reported on its own, so reporting the task groups too would bury it under everything it pushed out of place.
 */
const mustPrecede = (member: Member, previous: Member): boolean => {
  if (member.group === 'taskGroup' && previous.group === 'other') return false;
  if (GROUP_ORDER[member.group] !== GROUP_ORDER[previous.group]) {
    return GROUP_ORDER[member.group] < GROUP_ORDER[previous.group];
  }
  if (member.group === 'lifecycle') return member.lifecycleIndex! < previous.lifecycleIndex!;
  return member.group === 'taskGroup' && runsBefore(member.name, previous.name);
};

const messageIdFor = (member: Member, previous: Member): keyof typeof messages => {
  if (member.group === 'lifecycle') return previous.group === 'lifecycle' ? 'lifecycleOrder' : 'lifecycleFirst';
  if (member.group === 'taskGroup') return previous.group === 'taskGroup' ? 'taskGroupOrder' : 'taskGroupBeforeOther';
  return 'otherLast';
};

const messages = {
  lifecycleOrder: "'{{ name }}' is called before '{{ previous }}', so it must be declared before it.",
  lifecycleFirst: "'{{ name }}' runs before any priority, so it must be declared before the task groups.",
  taskGroupOrder: "'{{ name }}' runs before '{{ previous }}', so it must be declared before it.",
  taskGroupBeforeOther: "'{{ name }}' is a task group, so it must be declared before the methods that are not.",
  otherLast: "'{{ name }}' is not a task group, so it must be declared after them.",
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Declare generator members in the order they run: lifecycle methods, task groups, then the rest',
      recommended: true,
    },
    schema: [],
    messages,
  },
  create(context) {
    return {
      ClassBody(node: any) {
        const members = node.body
          .filter((member: any) => member.type === 'MethodDefinition')
          .map((member: any) => ({ node: member, member: classify(member) }))
          .filter((entry: any) => entry.member) as { node: any; member: Member }[];

        const lastOrdered = members.findLastIndex(({ member }) => member.group !== 'other');

        members.forEach(({ node: memberNode, member }, index) => {
          // Compared against every member before it, since the priorities are only partially ordered: a list
          // that holds both says which runs first, and priorities that never share a list are left alone.
          const offendedByOther = index < lastOrdered ? members[lastOrdered] : undefined;
          const offended =
            member.group === 'other' ?
              offendedByOther
            : members.slice(0, index).find(({ member: previous }) => mustPrecede(member, previous));
          if (offended) {
            context.report({
              node: memberNode.key,
              messageId: messageIdFor(member, offended.member),
              data: { name: member.name, previous: offended.member.name },
            });
          }
        });
      },
    };
  },
};

export default rule;
