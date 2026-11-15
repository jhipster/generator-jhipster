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
import { before, describe, expect, it } from 'esmocha';
import { basename } from 'node:path';

import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.ts';

import Generator from './generator.ts';

import { defaultHelpers as helpers, runResult } from '#testing';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with maven', () => {
    before(async () => {
      await helpers.runJHipster('server').withJHipsterConfig({ buildTool: 'maven', skipClient: true });
    });

    it('should match the liquibase-maven-plugin snapshot', () => {
      const pom = runResult.fs.read(`${runResult.cwd}/pom.xml`);
      expect(/<artifactId>liquibase-maven-plugin<\/artifactId>[\s\S]*?<\/plugin>/.exec(pom)?.[0]).toMatchSnapshot();
    });
  });

  describe('with gradle', () => {
    before(async () => {
      await helpers.runJHipster('server').withJHipsterConfig({ buildTool: 'gradle', skipClient: true });
    });

    it('should match the gradle liquibase file snapshot', () => {
      expect(runResult.getSnapshot('**/gradle/liquibase.gradle')).toMatchSnapshot();
    });
    it('should not set contexts in the main activity, since generate-changelog writes them to the changesets', () => {
      const gradle = runResult.fs.read(`${runResult.cwd}/gradle/liquibase.gradle`);
      expect(/^ {4}main \{[\s\S]*?^ {4}\}/m.exec(gradle)?.[0]).not.toContain('contexts');
    });
    it('should exclude the test-only table from the diff', () => {
      runResult.assertFileContent('gradle/liquibase.gradle', 'excludeObjects "(?i)jhi_date_time_wrapper"');
    });
  });
});
