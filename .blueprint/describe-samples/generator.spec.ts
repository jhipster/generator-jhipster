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
import { basename, join } from 'node:path';

import Generator from './generator.ts';

import { shouldSupportFeatures } from '#test-support';
import { defaultHelpers as helpers, typedResult } from '#testing';

const runResult = typedResult<Generator>();
const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  describe('without arguments', () => {
    before(async () => {
      await helpers.runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true }).withOptions({ json: true });
    });

    it('should describe the samples of every workflow', () => {
      const workflows = new Set(runResult.generator.samples.map(sample => sample.workflow));
      expect([...workflows]).toEqual([
        'angular',
        'devserver',
        'graalvm',
        'react',
        'docker-compose-integration',
        'vue',
        'daily-couchbase',
        'daily-elasticsearch',
        'daily-monolith-oauth2',
        'daily-ms-jwt',
        'daily-ms-oauth2',
        'daily-neo4j',
        'daily-ng-gradle-nosql',
        'daily-ng-gradle-sql',
        'daily-ng-maven-nosql',
        'daily-ng-maven-sql',
        'daily-no-database',
        'daily-react-gradle-nosql',
        'daily-react-gradle-sql',
        'daily-react-maven-nosql',
        'daily-react-maven-sql',
        'daily-vue-gradle-nosql',
        'daily-vue-gradle-sql',
        'daily-vue-maven-nosql',
        'daily-vue-maven-sql',
      ]);
      for (const sample of runResult.generator.samples) {
        expect(sample.matrix).toEqual({ os: expect.any(String), node: expect.any(String), java: expect.any(String) });
        expect(sample.command).toContain('jhipster generate-sample ');
      }
    });

    it('should print json', () => {
      expect(JSON.parse(runResult.generator.format())).toHaveLength(runResult.generator.samples.length);
    });
  });

  describe('with workflow daily-neo4j', () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true })
        .withOptions({ workflow: 'daily-neo4j', json: true });
    });

    it('should describe the daily samples with the daily-builds environment', () => {
      expect(runResult.generator.samples.map(sample => sample.name)).toContain('daily-webflux-neo4j');
      const sample = runResult.generator.samples.find(sample => sample.name === 'daily-ngx-neo4j');
      expect(sample).toMatchObject({
        workflow: 'daily-neo4j',
        command: 'jhipster generate-sample daily-ngx-neo4j',
        entitiesSample: 'neo4j',
        yoRcFile: '.blueprint/generate-sample/templates/test-integration/daily-builds/ngx-neo4j/.yo-rc.json',
        matrix: { os: 'ubuntu-latest', node: expect.any(String), java: '25' },
      });
    });
  });

  describe('with a workflow', () => {
    before(async () => {
      await helpers.runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true }).withOptions({ workflow: 'angular' });
    });

    it('should list the workflow samples with their matrix values', () => {
      const { samples } = runResult.generator;
      expect(samples.every(sample => sample.workflow === 'angular')).toBe(true);
      const ngDefault = samples.find(sample => sample.name === 'ng-default')!;
      expect(ngDefault).toMatchObject({
        jobName: expect.stringMatching(/^ng-default \(n.*\/j.*\)$/),
        command: 'jhipster generate-sample ng-default',
        yoRcFile: '.blueprint/generate-sample/templates/test-integration/samples/ng-default/.yo-rc.json',
        config: expect.objectContaining({ clientFramework: 'angular', databaseType: 'sql' }),
        entitiesSample: 'sqlfull',
        matrix: { os: 'ubuntu-latest', node: expect.any(String), java: expect.any(String) },
      });
      expect(ngDefault.entityFiles).toContain('.blueprint/generate-sample/templates/test-integration/samples/.jhipster/BankAccount.json');
      expect(runResult.generator.format()).toMatch(/^workflow\s+sample\s+job\s+app sample\s+entities\s+jdl\s+os\s+node\s+java/);
    });
  });

  describe('with a sample', () => {
    before(async () => {
      await helpers.runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true }).withArguments('ng-default-additional');
    });

    it('should describe the jdl entities of the sample', () => {
      const [sample] = runResult.generator.samples;
      expect(sample.jdlEntity).toBe('*');
      expect(sample.jdlEntityFiles).toContain('.blueprint/generate-sample/templates/test-integration/samples/jdl-entities/custom-id.jdl');
      expect(sample.generatorOptions).toEqual({ removeNeedles: true, clientTestFramework: 'vitest' });
      expect(runResult.generator.format()).toContain('jdl entities:');
    });
  });

  describe('with a group sample', () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true })
        .withArguments('ng-default-module-federation');
    });

    it('should describe the sample path and args', () => {
      const [sample] = runResult.generator.samples;
      expect(sample).toMatchObject({
        workflow: 'devserver',
        command:
          'jhipster generate-sample samples/ng-default --auth oauth2 --sample-yorc-folder --entities-sample sqllight --microfrontend',
        entitiesSample: 'sqllight',
        config: expect.objectContaining({ clientFramework: 'angular' }),
      });
    });
  });

  describe('with an unknown sample', () => {
    it('should fail', async () => {
      await expect(
        helpers.runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true }).withArguments('unknown-sample'),
      ).rejects.toThrow('Sample unknown-sample not found');
    });
  });
});
