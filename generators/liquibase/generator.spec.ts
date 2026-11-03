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
import { before, describe, expect, it } from 'expect-node';
import { basename } from 'node:path';

import Generator from './generator.ts';

import { shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import { defaultHelpers as helpers, runResult } from '#testing';

const generator = basename(import.meta.dirname);

const getLiquibaseMavenPlugin = (): string => {
  const pom = runResult.fs.read(`${runResult.cwd}/pom.xml`);
  const plugin = /<plugin>\s*<groupId>org\.liquibase<\/groupId>\s*<artifactId>liquibase-maven-plugin<\/artifactId>[\s\S]*?<\/plugin>/.exec(
    pom,
  )?.[0];
  if (!plugin) throw new Error('liquibase-maven-plugin not found in pom.xml');
  return plugin;
};

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with maven', () => {
    before(async () => {
      await helpers.runJHipster('app').withJHipsterConfig({ buildTool: 'maven', skipClient: true });
    });

    it('should match the liquibase-maven-plugin snapshot', () => {
      expect(getLiquibaseMavenPlugin()).toMatchSnapshot();
    });
    it('should add the hibernate extension with hibernate pinned to the application version', () => {
      const plugin = getLiquibaseMavenPlugin();
      expect(plugin).toContain('<artifactId>liquibase-hibernate7</artifactId>');
      expect(plugin).toMatch(/<artifactId>hibernate-core<\/artifactId>\s*<version>\$\{hibernate.version\}<\/version>/);
      expect(plugin).toMatch(/<artifactId>hibernate-envers<\/artifactId>\s*<version>\$\{hibernate.version\}<\/version>/);
    });
  });

  describe('with maven and a reactive application', () => {
    before(async () => {
      await helpers.runJHipster('app').withJHipsterConfig({ buildTool: 'maven', skipClient: true, reactive: true });
    });

    it('should match the liquibase-maven-plugin snapshot', () => {
      expect(getLiquibaseMavenPlugin()).toMatchSnapshot();
    });
    it('should not add the hibernate extension, which needs JPA entities', () => {
      const plugin = getLiquibaseMavenPlugin();
      expect(plugin).not.toContain('liquibase-hibernate');
      expect(plugin).not.toContain('hibernate-core');
      expect(plugin).not.toContain('hibernate-envers');
    });
  });

  describe('with gradle', () => {
    before(async () => {
      await helpers.runJHipster('app').withJHipsterConfig({ buildTool: 'gradle', skipClient: true });
    });

    it('should match the gradle liquibase file snapshot', () => {
      expect(runResult.getSnapshot('**/gradle/liquibase.gradle')).toMatchSnapshot();
    });
    it('should find the changelogs and the entities for the gradle tasks', () => {
      runResult.assertFileContent('gradle/liquibase.gradle', 'searchPath ".,src/main/resources/"');
      runResult.assertFileContent('gradle/liquibase.gradle', 'liquibaseRuntime sourceSets.main.output');
      runResult.assertFileContent('gradle/liquibase.gradle', 'liquibaseRuntime "org.liquibase.ext:liquibase-hibernate7:');
    });
  });

  describe('with gradle and a reactive application', () => {
    before(async () => {
      await helpers.runJHipster('app').withJHipsterConfig({ buildTool: 'gradle', skipClient: true, reactive: true });
    });

    it('should match the gradle liquibase file snapshot', () => {
      expect(runResult.getSnapshot('**/gradle/liquibase.gradle')).toMatchSnapshot();
    });
    it('should not add the hibernate reference, which needs JPA entities', () => {
      runResult.assertFileContent('gradle/liquibase.gradle', 'searchPath ".,src/main/resources/"');
      runResult.assertNoFileContent('gradle/liquibase.gradle', 'sourceSets.main.output');
      runResult.assertNoFileContent('gradle/liquibase.gradle', 'liquibase-hibernate');
    });
  });
});
