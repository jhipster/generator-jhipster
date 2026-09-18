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
import { describe, it } from 'esmocha';

import { RuleTester } from 'eslint';

import rule from './task-group-order.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } });

ruleTester.run('task-group-order', rule, {
  valid: [
    // Declared in the order the priorities run.
    `class G {
      get configuring() {}
      get composing() {}
      get preparingEachEntity() {}
      get preparingEachEntityRelationship() {}
    }`,
    // A task group and the delegating getter of the same priority sit together.
    `class G {
      get preparingEachEntity() {}
      get [Base.PREPARING_EACH_ENTITY]() {}
      get preparingEachEntityRelationship() {}
      get [Base.PREPARING_EACH_ENTITY_RELATIONSHIP]() {}
    }`,
    // Getters that are not task groups are not ordered by this rule.
    `class G {
      get writing() {}
      get supportedLanguages() {}
      get someHelper() {}
    }`,
    // Each class is considered on its own.
    `class A {
      get writing() {}
    }
    class B {
      get initializing() {}
    }`,
  ],
  invalid: [
    {
      code: `class G {
        get preparingEachEntityRelationship() {}
        get preparingEachEntity() {}
      }`,
      errors: [{ messageId: 'outOfOrder', data: { priority: 'preparingEachEntity', previous: 'preparingEachEntityRelationship' } }],
    },
    {
      code: `class G {
        get configuringEachEntity() {}
        get composing() {}
      }`,
      errors: [{ messageId: 'outOfOrder', data: { priority: 'composing', previous: 'configuringEachEntity' } }],
    },
    {
      // The computed key of a delegating getter resolves to the same priority as its task group.
      code: `class G {
        get [Base.POST_WRITING_ENTITIES]() {}
        get [Base.POST_WRITING]() {}
      }`,
      errors: [{ messageId: 'outOfOrder', data: { priority: 'postWriting', previous: 'postWritingEntities' } }],
    },
  ],
});
