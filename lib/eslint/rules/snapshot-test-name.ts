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

const testFunctions = new Set(['it', 'test']);
const snapshotMatcher = /\.toMatch(?:Inline)?Snapshot\s*\(/;

const isTestCall = (callee: any): boolean => {
  if (callee.type === 'Identifier') return testFunctions.has(callee.name);
  return callee.type === 'MemberExpression' && callee.object.type === 'Identifier' && testFunctions.has(callee.object.name);
};

const titleOf = (node: any): string | undefined => {
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node?.type === 'TemplateLiteral') return node.quasis.map((quasi: any) => quasi.value.cooked ?? quasi.value.raw).join('');
  return undefined;
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: "Require 'snapshot' in the name of a test that compares a snapshot, so a name pattern selects every snapshot test",
      recommended: true,
    },
    schema: [],
    messages: {
      missing: "The test compares a snapshot: put 'snapshot' in its name, like '{{ title }} - snapshot'.",
    },
  },
  create(context) {
    return {
      CallExpression(node: any) {
        if (!isTestCall(node.callee)) return;
        const [titleNode, callback] = node.arguments;
        const title = titleOf(titleNode);
        if (title === undefined || /snapshot/i.test(title)) return;
        if (callback?.type !== 'ArrowFunctionExpression' && callback?.type !== 'FunctionExpression') return;
        if (!snapshotMatcher.test(context.sourceCode.getText(callback))) return;
        context.report({ node: titleNode, messageId: 'missing', data: { title } });
      },
    };
  },
};

export default rule;
