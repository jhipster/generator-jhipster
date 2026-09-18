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

/** Position of each priority in the order the generator runs them. */
const priorityIndex = new Map<string, number>(PRIORITY_NAMES_LIST.map((priority, index) => [priority, index]));

/** `PREPARING_EACH_ENTITY` is how a delegating getter names the priority its computed key resolves to. */
const priorityByConstantName = new Map<string, string>(Object.entries(PRIORITY_NAMES));

/**
 * The priority a getter belongs to, from either `get preparingEachEntity()` or
 * `get [SomeGenerator.PREPARING_EACH_ENTITY]()`. Returns undefined for anything else, which is left alone.
 */
const priorityOf = (node: any): string | undefined => {
  const { key, computed } = node;
  if (!computed) {
    return key?.type === 'Identifier' && priorityIndex.has(key.name) ? key.name : undefined;
  }
  if (key?.type === 'MemberExpression' && key.property?.type === 'Identifier') {
    return priorityByConstantName.get(key.property.name);
  }
  return undefined;
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Declare generator task group getters in the order the priorities run',
      recommended: true,
    },
    schema: [],
    messages: {
      outOfOrder: "'{{ priority }}' runs before '{{ previous }}', so it must be declared before it.",
    },
  },
  create(context) {
    return {
      ClassBody(node: any) {
        let highest = -1;
        let highestPriority = '';
        for (const member of node.body) {
          if (member.type !== 'MethodDefinition' || member.kind !== 'get') continue;
          const priority = priorityOf(member);
          if (priority === undefined) continue;

          const index = priorityIndex.get(priority)!;
          if (index < highest) {
            context.report({
              node: member.key,
              messageId: 'outOfOrder',
              data: { priority, previous: highestPriority },
            });
          } else {
            highest = index;
            highestPriority = priority;
          }
        }
      },
    };
  },
};

export default rule;
