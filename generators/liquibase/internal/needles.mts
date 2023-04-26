/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { createNeedleCallback } from '../../base/support/needles.mjs';
import { LiquibaseChangelog } from '../types.mjs';

const addLiquibaseChangelogToMasterCallback = ({ changelogName, needle }: LiquibaseChangelog & { needle: string }) =>
  createNeedleCallback({
    needle,
    contentToAdd: `<include file="config/liquibase/changelog/${changelogName}.xml" relativeToChangelogFile="false"/>`,
  });

export const addLiquibaseChangelogCallback = ({ changelogName }: LiquibaseChangelog) =>
  addLiquibaseChangelogToMasterCallback({ needle: 'liquibase-add-changelog', changelogName });

export const addLiquibaseIncrementalChangelogCallback = ({ changelogName }: LiquibaseChangelog) =>
  addLiquibaseChangelogToMasterCallback({ needle: 'liquibase-add-incremental-changelog', changelogName });

export const addLiquibaseConstraintsChangelogCallback = ({ changelogName }: LiquibaseChangelog) =>
  addLiquibaseChangelogToMasterCallback({ needle: 'liquibase-add-constraints-changelog', changelogName });
