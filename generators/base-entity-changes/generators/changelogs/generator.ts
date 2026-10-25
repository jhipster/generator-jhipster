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
import BaseApplicationGenerator from '../../../base-application/index.ts';

import { CHANGELOGS_CUSTOM_OBJECT, getEntityChangelogs } from './support/index.ts';
import type { EntityChangelogObject } from './types.ts';

/**
 * Records the changelogs of the entities of an application as objects of type \`changelog\` (see
 * getEntityChangelogs), and gives them as the \`changelogs\` custom object to the generators composing this one.
 */
export default class ChangelogsGenerator extends BaseApplicationGenerator {
  declare readonly customObjectNames: readonly ['changelogs'];

  constructor(args: any, options: any, features: any) {
    super(args, options, { ...features, customObjects: [{ name: CHANGELOGS_CUSTOM_OBJECT }] });
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }
    await this.dependsOnBootstrap('base-application');
  }

  get [BaseApplicationGenerator.objectPriority(CHANGELOGS_CUSTOM_OBJECT, 'loading')]() {
    return {
      // The changelogs recorded when they are loaded, before the generators composing this one use them.
      recordChangelogs: ({ changelogs }: { changelogs: EntityChangelogObject[] }) => {
        this.log.debug(`${changelogs.length} entity changelogs`);
      },
    };
  }

  /** The changelogs of the application (see getEntityChangelogs). */
  get changelogs(): EntityChangelogObject[] {
    return getEntityChangelogs(this);
  }
}
