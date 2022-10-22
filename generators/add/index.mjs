/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import BaseGenerator from '../base/index.mjs';
import { GENERATOR_ADD } from '../generator-list.mjs';

/**
 * @experimental
 */
export default class AddGenerator extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

    this.argument('generators', {
      type: Array,
      required: false,
      description: 'Generators to regenerate',
    });

    // eslint-disable-next-line no-useless-return
    if (this.options.help) return;
  }

  async _beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_ADD);
    }
  }

  get initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      loadRuntimeOptions() {
        this.loadRuntimeOptions();
      },
    };
  }

  get [BaseGenerator.INITIALIZING]() {
    if (this.delegateToBlueprint) return {};
    return this.initializing;
  }

  get composing() {
    return {
      async composing() {
        for (const generator of this.arguments) {
          await this.composeWithJHipster(generator, [], { add: true });
        }
      },
    };
  }

  get [BaseGenerator.COMPOSING]() {
    if (this.fromBlueprint) return {};
    return this.composing;
  }
}
