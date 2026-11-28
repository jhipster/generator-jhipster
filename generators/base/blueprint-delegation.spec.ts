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

import { before, describe, exnode, expect, it } from 'expect-node';

import BaseGenerator from './index.ts';

import { defaultHelpers as helpers } from '#testing';

type Calls = { core: ReturnType<typeof exnode.fn>; undelegated: ReturnType<typeof exnode.fn>; blueprint: ReturnType<typeof exnode.fn> };

const createGenerators = (
  calls: Calls,
  { undelegatedPriorities, sbsBlueprint }: { undelegatedPriorities?: string[]; sbsBlueprint?: boolean } = {},
) => {
  // A generator of JHipster whose priority getters do not call delegateTasksToBlueprint.
  class CoreTestGenerator extends BaseGenerator {
    static override undelegatedPriorities = undelegatedPriorities;

    async beforeQueue() {
      await this.composeWithBlueprints();
    }

    get [BaseGenerator.DEFAULT]() {
      return { core: () => calls.core() };
    }

    get [BaseGenerator.WRITING]() {
      return { undelegated: () => calls.undelegated() };
    }
  }

  class BlueprintTestGenerator extends BaseGenerator {
    constructor(args: any, options: any, features: any) {
      super(args, options, features);
      this.sbsBlueprint = sbsBlueprint ?? false;
    }

    get [BaseGenerator.DEFAULT]() {
      return { blueprint: () => calls.blueprint() };
    }
  }

  return { CoreTestGenerator, BlueprintTestGenerator };
};

const runWithBlueprint = async (calls: Calls, settings?: Parameters<typeof createGenerators>[1], generatorName = 'delegation-test') => {
  const { CoreTestGenerator, BlueprintTestGenerator } = createGenerators(calls, settings);
  await helpers
    .run(CoreTestGenerator, { namespace: `jhipster:${generatorName}` })
    .withJHipsterGenerators({ useDefaultMocks: true })
    .withGenerators([[BlueprintTestGenerator, { namespace: `jhipster-foo:${generatorName}` }]])
    .withOptions({ blueprint: ['foo'] });
};

const createCalls = (): Calls => ({ core: exnode.fn(), undelegated: exnode.fn(), blueprint: exnode.fn() });

describe('generator - base - automatic delegation to the blueprint', () => {
  describe('with a blueprint replacing the generator', () => {
    const calls = createCalls();
    before(() => runWithBlueprint(calls));

    it('runs the tasks of the blueprint', () => {
      expect(calls.blueprint).toHaveBeenCalledTimes(1);
    });

    it('does not run the tasks of the generator, its priority getters delegating or not', () => {
      expect(calls.core).not.toHaveBeenCalled();
      expect(calls.undelegated).not.toHaveBeenCalled();
    });
  });

  describe('with a priority the generator does not delegate', () => {
    const calls = createCalls();
    before(() => runWithBlueprint(calls, { undelegatedPriorities: ['writing'] }));

    it('runs the tasks of that priority only', () => {
      expect(calls.undelegated).toHaveBeenCalledTimes(1);
      expect(calls.core).not.toHaveBeenCalled();
      expect(calls.blueprint).toHaveBeenCalledTimes(1);
    });
  });

  describe('with a side-by-side blueprint', () => {
    const calls = createCalls();
    before(() => runWithBlueprint(calls, { sbsBlueprint: true }));

    it('runs the tasks of the generator and of the blueprint', () => {
      expect(calls.core).toHaveBeenCalledTimes(1);
      expect(calls.undelegated).toHaveBeenCalledTimes(1);
      expect(calls.blueprint).toHaveBeenCalledTimes(1);
    });
  });

  // A bootstrap prepares the data the other generators read: its blueprint complements it.
  for (const generatorName of ['delegation-test:bootstrap', 'delegation-test:database-bootstrap']) {
    describe(`with a blueprint of the bootstrap ${generatorName}`, () => {
      const calls = createCalls();
      before(() => runWithBlueprint(calls, {}, generatorName));

      it('runs the tasks of the bootstrap and of the blueprint', () => {
        expect(calls.core).toHaveBeenCalledTimes(1);
        expect(calls.undelegated).toHaveBeenCalledTimes(1);
        expect(calls.blueprint).toHaveBeenCalledTimes(1);
      });
    });
  }
});
