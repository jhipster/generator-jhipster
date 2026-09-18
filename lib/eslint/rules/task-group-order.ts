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
 * The order the generator runs the priorities in.
 *
 * No single list holds all of them: the application list drops `postPreparing`, and the workspaces priorities
 * live in their own list. Each list is folded into the application one, every missing priority taking the place
 * it holds relative to the neighbours it shares with it.
 */
const priorityOrder: string[] = [...PRIORITY_NAMES_LIST];
const foldIn = (priorities: readonly string[]): void => {
  priorities.forEach((priority, index) => {
    if (priorityOrder.includes(priority)) return;
    const previous = priorities
      .slice(0, index)
      .reverse()
      .find(candidate => priorityOrder.includes(candidate));
    priorityOrder.splice(previous === undefined ? 0 : priorityOrder.indexOf(previous) + 1, 0, priority);
  });
};
foldIn(CORE_PRIORITY_NAMES_LIST);
foldIn(WORKSPACES_PRIORITY_NAMES_LIST);

/** Position of each priority in the order the generator runs them. */
const priorityIndex = new Map<string, number>(priorityOrder.map((priority, index) => [priority, index]));

/** `PREPARING_EACH_ENTITY` is how a delegating getter names the priority its computed key resolves to. */
const priorityByConstantName = new Map<string, string>(Object.entries({ ...PRIORITY_NAMES, ...WORKSPACES_PRIORITY_NAMES }));

/** Ranks are compared, never shown; the gaps only keep the three groups apart. */
const TASK_GROUP_RANK = 100;
const OTHER_RANK = 1000;

type Member = { rank: number; name: string; group: 'lifecycle' | 'taskGroup' | 'other' };

/**
 * Where a member belongs, from either its name or, for a delegating getter, the constant its computed key reads.
 */
const classify = (node: any): Member | undefined => {
  const { key, computed, kind, static: isStatic } = node;
  if (isStatic || kind === 'constructor') return undefined;

  if (computed) {
    if (key?.type !== 'MemberExpression' || key.property?.type !== 'Identifier') return undefined;
    const priority = priorityByConstantName.get(key.property.name);
    return priority === undefined ? undefined : (
        { rank: TASK_GROUP_RANK + priorityIndex.get(priority)!, name: priority, group: 'taskGroup' }
      );
  }

  if (key?.type !== 'Identifier') return undefined;
  const { name } = key;

  const lifecycle = LIFECYCLE_METHODS.indexOf(name);
  if (lifecycle !== -1) return { rank: lifecycle, name, group: 'lifecycle' };

  const priority = priorityIndex.get(name);
  if (priority !== undefined) return { rank: TASK_GROUP_RANK + priority, name, group: 'taskGroup' };

  return { rank: OTHER_RANK, name, group: 'other' };
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

        // A method that is neither a lifecycle hook nor a task group belongs after them, so report the method
        // itself rather than everything it pushed out of place.
        const lastOrdered = members.findLastIndex(({ member }) => member.group !== 'other');
        members.forEach(({ node: memberNode, member }, index) => {
          if (member.group === 'other' && index < lastOrdered) {
            context.report({ node: memberNode.key, messageId: 'otherLast', data: { name: member.name } });
          }
        });

        let highest: Member | undefined;
        for (const { node: memberNode, member } of members) {
          if (member.group === 'other') continue;
          if (highest && member.rank < highest.rank) {
            context.report({
              node: memberNode.key,
              messageId: messageIdFor(member, highest),
              data: { name: member.name, previous: highest.name },
            });
          } else {
            highest = member;
          }
        }
      },
    };
  },
};

export default rule;
