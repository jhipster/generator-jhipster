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
import { jestExpect as expect } from 'mocha-expect-snapshot';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { testBlueprintSupport } from '../../test/support/tests.mjs';
import { defaultHelpers as helpers, result as runResult } from '../../test/support/helpers.mjs';
import { GENERATOR_JHIPSTER } from '../generator-constants.mjs';
import { GENERATOR_MAVEN } from '../generator-list.mjs';
import MavenGenerator from './generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.mjs');

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', () => {
    expect(GENERATOR_MAVEN).toBe(generator);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));
  describe('with valid configuration', () => {
    before(async () => {
      await helpers.run(generatorFile).withJHipsterConfig({
        baseName: 'existing',
        packageName: 'tech.jhipster',
      });
    });
    it('should generate only maven files', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
    it('should set buildTool config', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { buildTool: 'maven' } });
    });
  });
  describe('with empty configuration', () => {
    before(async () => {
      await helpers.run(generatorFile).withJHipsterConfig();
    });
    it('should generate only maven files', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
    it('should set buildTool config', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { buildTool: 'maven' } });
    });
  });

  describe('needles', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_MAVEN)
        .withJHipsterConfig({
          blueprints: [{ name: 'blueprint' }],
        })
        .withGenerators([
          [
            class extends MavenGenerator {
              get [MavenGenerator.PREPARING]() {
                return super.preparing;
              }

              get [MavenGenerator.POST_WRITING]() {
                return this.asPostWritingTaskGroup({
                  addProperty({ source }) {
                    source.addMavenDependency?.({ groupId: 'group', artifactId: 'artifact', version: 'initial' });
                    source.addMavenDependency?.({ groupId: 'group', artifactId: 'artifact' });
                    source.addMavenDependency?.({
                      groupId: 'group',
                      artifactId: 'artifact2',
                      additionalContent: `
<exclusions>
    <exclusion>
        <groupId>exclusionGroupId</groupId>
        <artifactId>exclusionArtifactId</artifactId>
    </exclusion>
</exclusions>`,
                    });
                    source.addMavenProperty?.({ property: 'foo', value: 'initial' });
                    source.addMavenProperty?.({ property: 'foo', value: 'bar' });
                    source.addMavenProperty?.({ property: 'foo2', value: 'bar2' });
                    source.addMavenProfile?.({ id: 'profileId', content: '<foo>initial</foo>' });
                    source.addMavenProfile?.({ id: 'profileId', content: '<foo>bar</foo>' });
                    source.addMavenProfile?.({ id: 'profileId2', content: '<foo2>bar2</foo2>' });
                  },
                });
              }
            },
            'jhipster-blueprint:maven',
          ],
        ]);
    });
    it('should add properties', () => {
      runResult.assertFileContent('pom.xml', '<foo>bar</foo>');
      runResult.assertFileContent('pom.xml', '<foo2>bar2</foo2>');
    });
    it('should add dependencies', () => {
      runResult.assertFileContent(
        'pom.xml',
        `
        <dependency>
            <groupId>group</groupId>
            <artifactId>artifact</artifactId>
        </dependency>
`
      );
      runResult.assertFileContent(
        'pom.xml',
        `
        <dependency>
            <groupId>group</groupId>
            <artifactId>artifact2</artifactId>
            <exclusions>
                <exclusion>
                    <groupId>exclusionGroupId</groupId>
                    <artifactId>exclusionArtifactId</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
`
      );
    });
    it('should add profiles', () => {
      runResult.assertFileContent(
        'pom.xml',
        `
        <profile>
            <id>profileId</id>
            <foo>bar</foo>
        </profile>
`
      );
      runResult.assertFileContent(
        'pom.xml',
        `
        <profile>
            <id>profileId2</id>
            <foo2>bar2</foo2>
        </profile>
`
      );
    });
    it('should match generated pom', () => {
      expect(runResult.getSnapshot('**/pom.xml')).toMatchSnapshot();
    });
  });
});
