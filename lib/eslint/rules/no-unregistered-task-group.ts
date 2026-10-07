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

const knownPriorities = new Set<string>([PRIORITY_NAMES_LIST, CORE_PRIORITY_NAMES_LIST, WORKSPACES_PRIORITY_NAMES_LIST].flat());

/** `END` is how a delegating getter names the priority its computed key resolves to. */
const priorityByConstantName = new Map<string, string>(
  Object.entries({ ...PRIORITY_NAMES, ...WORKSPACES_PRIORITY_NAMES }) as [string, string][],
);

const constantByPriority = new Map([...priorityByConstantName].map(([constant, priority]) => [priority, constant]));

const propertyName = (node: any): string | undefined => {
  if (!node.computed) return node.property?.type === 'Identifier' ? node.property.name : undefined;
  return node.property?.type === 'Literal' && typeof node.property.value === 'string' ? node.property.value : undefined;
};

type ClassState = { taskGroups: any[]; registered: Set<string>; read: Set<string> };

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Report task groups that never run because no priority getter returns them',
      recommended: true,
    },
    schema: [],
    messages: {
      unregistered:
        "'{{ name }}' never runs: the generator looks its tasks up by the priority prefix, so declare the getter of the priority that returns it, like `get [BaseApplicationGenerator.{{ constant }}]() { return this.delegateTasksToBlueprint(() => this.{{ name }}); }`, or remove it.",
    },
  },
  create(context) {
    const classes: ClassState[] = [];

    return {
      ClassBody(node: any) {
        const state: ClassState = { taskGroups: [], registered: new Set(), read: new Set() };
        for (const member of node.body) {
          if (member.type !== 'MethodDefinition' || member.static) continue;
          if (member.computed) {
            // A getter keyed by a priority constant is the one the generator runs.
            if (member.key?.type === 'MemberExpression' && member.key.property?.type === 'Identifier') {
              const priority = priorityByConstantName.get(member.key.property.name);
              if (priority !== undefined) state.registered.add(priority);
            }
          } else if (member.kind === 'get' && member.key?.type === 'Identifier' && knownPriorities.has(member.key.name)) {
            state.taskGroups.push(member);
          }
        }
        classes.push(state);
      },
      'MemberExpression[object.type="ThisExpression"]'(node: any) {
        const name = propertyName(node);
        if (name !== undefined) classes.at(-1)?.read.add(name);
      },
      'ClassBody:exit'() {
        const { taskGroups, registered, read } = classes.pop()!;
        for (const member of taskGroups) {
          const { name } = member.key;
          if (registered.has(name) || read.has(name)) continue;
          context.report({
            node: member.key,
            messageId: 'unregistered',
            data: { name, constant: constantByPriority.get(name) ?? name },
          });
        }
      },
    };
  },
};

export default rule;
