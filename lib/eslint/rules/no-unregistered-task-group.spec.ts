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

import rule from './no-unregistered-task-group.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } });

ruleTester.run('no-unregistered-task-group', rule, {
  valid: [
    // The getter of the priority returns the task group.
    `class G {
      get end() {}
      get [BaseApplicationGenerator.END]() {
        return this.delegateTasksToBlueprint(() => this.end);
      }
    }`,
    // A task group read through \`this\` runs from wherever it is read.
    `class G {
      get preparingEachEntity() {}
      get [BaseApplicationGenerator.PREPARING]() {
        return { ...this.preparingEachEntity };
      }
    }`,
    // Registered by its computed key alone.
    `class G {
      get writing() {}
      get [BaseApplicationGenerator.WRITING]() {
        return this.asWritingTaskGroup(this.delegateToBlueprint ? {} : super.writing);
      }
    }`,
    // Getters that are not task groups are left alone.
    `class G {
      get someAccessor() {}
    }`,
    // Each class is considered on its own: the outer class reads the task group.
    `class A {
      get writing() {}
      get [Base.WRITING]() {
        class B {}
        return this.writing;
      }
    }`,
  ],
  invalid: [
    {
      code: `class G {
        get [BaseApplicationGenerator.POST_WRITING]() {
          return this.asPostWritingTaskGroup(this.delegateToBlueprint ? {} : this.postWriting);
        }
        get end() {
          return this.asEndTaskGroup({});
        }
      }`,
      errors: [{ messageId: 'unregistered', data: { name: 'end', constant: 'END' } }],
    },
    {
      // The computed getter of another class does not register it.
      code: `class A {
        get writing() {}
      }
      class B {
        get [Base.WRITING]() {
          return this.writing;
        }
      }`,
      errors: [{ messageId: 'unregistered', data: { name: 'writing', constant: 'WRITING' } }],
    },
  ],
});
