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
import { after, before, describe, expect, it } from 'esmocha';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import type { GitHubMatrixOutput } from '../../../lib/ci/index.ts';

import { buildMatrix } from './build-matrix.ts';
import { allChanges, detectChanges } from './git-changes.ts';

const samplesOf = async (workflow: string, files: string[]) =>
  ((await buildMatrix({ workflow, changes: detectChanges(files) })) as GitHubMatrixOutput).include.map(sample => sample['job-name']);

describe('build-matrix', () => {
  describe('buildMatrix', () => {
    it('should run no sample of a client workflow for an unrelated change', async () => {
      expect(await samplesOf('angular', ['README.md'])).toEqual([]);
    });

    it('should run the samples of a client workflow for a change of its generator', async () => {
      const samples = await samplesOf('angular', ['generators/angular/generator.ts']);
      expect(samples.length).toBeGreaterThan(0);
      expect(samples).toEqual(expect.arrayContaining([expect.stringMatching(/^ng-default /)]));
    });

    it('should run the group of the graalvm workflow for a change of its generator', async () => {
      expect(await samplesOf('graalvm', ['generators/java-simple-application/generators/graalvm/generator.ts'])).toEqual([
        'maven',
        'maven-reactive(true)',
        'gradle',
        'gradle-reactive(true)',
      ]);
    });

    it('should describe the jobs of the generators workflow with a disabled flag', async () => {
      expect(await buildMatrix({ workflow: 'generators', changes: detectChanges(['generators/graalvm/x']) })).toMatchObject({
        'database-changelog': { disabled: true },
        graalvm: { disabled: true },
      });
      expect(await buildMatrix({ workflow: 'generators', changes: allChanges() })).toMatchObject({
        'database-changelog': { disabled: false },
        'generate-blueprint': { disabled: false },
        graalvm: { disabled: false },
      });
    });

    describe('with revisions', () => {
      let baseDir: string;
      const commit = (file: string) => {
        mkdirSync(dirname(join(baseDir, file)), { recursive: true });
        writeFileSync(join(baseDir, file), file);
        execFileSync('git', ['add', '.'], { cwd: baseDir });
        execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@test', 'commit', '-q', '-m', file], { cwd: baseDir });
      };

      before(() => {
        baseDir = mkdtempSync(join(tmpdir(), 'build-matrix-'));
        execFileSync('git', ['init', '-q'], { cwd: baseDir });
        commit('README.md');
        commit('generators/java-simple-application/generators/graalvm/generator.ts');
        commit('docs/other.md');
      });

      after(() => rmSync(baseDir, { recursive: true }));

      const graalvmSamples = async (revisions?: string | string[]) =>
        ((await buildMatrix({ workflow: 'graalvm', baseDir, revisions })) as GitHubMatrixOutput).include.length;

      it('should compare the last commit by default', async () => {
        expect(await graalvmSamples()).toBe(0);
      });

      it('should compare the given revisions', async () => {
        expect(await graalvmSamples('HEAD~2...HEAD')).toBe(4);
        expect(await graalvmSamples(['HEAD~2', 'HEAD~1'])).toBe(4);
      });
    });
  });
});
