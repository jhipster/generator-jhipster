/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import { createNeedleCallback } from '../../base/support/needles.js';
import type { LiquibaseChangelog, LiquibaseChangelogSection } from '../types.js';

const changelogType = {
  base: 'liquibase-add-changelog',
  incremental: 'liquibase-add-incremental-changelog',
  constraints: 'liquibase-add-constraints-changelog',
};

const addLiquibaseChangelogToMasterCallback = ({ changelogName, needle }: LiquibaseChangelog & { needle: string }) =>
  createNeedleCallback({
    needle,
    contentToAdd: `<include file="config/liquibase/changelog/${changelogName}.xml" relativeToChangelogFile="false"/>`,
  });

export const addLiquibaseChangelogCallback = ({ changelogName, section = 'base' }: LiquibaseChangelogSection) =>
  addLiquibaseChangelogToMasterCallback({ needle: changelogType[section], changelogName });

export const addLiquibaseIncrementalChangelogCallback = ({ changelogName }: LiquibaseChangelog) =>
  addLiquibaseChangelogCallback({ changelogName, section: 'incremental' });

export const addLiquibaseConstraintsChangelogCallback = ({ changelogName }: LiquibaseChangelog) =>
  addLiquibaseChangelogCallback({ changelogName, section: 'constraints' });
