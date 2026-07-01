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

import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { minimatch } from 'minimatch';
import { simpleGit } from 'simple-git';

import { testIntegrationRelativeFolder } from '../../constants.ts';

const clientPatterns = (client: 'angular' | 'react' | 'vue') => [
  `.github/workflows/${client}.yml`,
  join(testIntegrationRelativeFolder, `workflow-samples/${client}.json`),
];

const patterns = {
  angular: ['generators/angular/**'],
  angularWorkflow: clientPatterns('angular'),
  base: ['lib/**', 'generators/*', 'generators/{base*,bootstrap*,git,jdl,project-name}/**'],
  ci: ['.github/{actions,workflows}/**', join(testIntegrationRelativeFolder, '{,jdl}samples/**')],
  client: ['generators/{client,init,javascript-simple-application}/**'],
  common: ['generators/{app,common,docker,languages}/**'],
  devBlueprint: ['.blueprint/generate-sample/**', '.blueprint/github-build-matrix/**'],
  devserverWorkflow: ['.github/workflows/devserver.yml'],
  e2e: ['generators/cypress/**'],
  generateBlueprint: ['generators/{generate-blueprint,javascript-simple-application,ci-cd/generators/bootstrap}/**'],
  graalvm: [
    'generators/java-simple-application/generators/graalvm/**',
    'generators/spring-boot/*',
    'generators/spring-boot/{resources,templates,generators/bootstrap,generators/data-relational,generators/liquibase,generators/jwt}/**',
    'generators/liquibase/**',
  ],
  java: ['generators/{java,java-simple-application,liquibase,server,spring*}/**'],
  react: ['generators/react/**'],
  reactWorkflow: clientPatterns('react'),
  springBootDefaults: [
    'generators/spring-boot/*',
    'generators/spring-boot/{resources,templates,generators/bootstrap,generators/data-relational,generators/liquibase,generators/jwt}/**',
    'generators/{java,java-simple-application,liquibase,server}/**',
  ],
  sonarPr: ['.github/actions/sonar/**'],
  workspaces: ['generators/{docker-compose,kubernetes*,workspaces}/**'],
  vue: ['generators/vue/**'],
  vueWorkflow: clientPatterns('vue'),
};

const someFileMatchesSomePattern = (files: string[], patterns: string[], ignore?: string) =>
  patterns.some(pattern =>
    files.some(file => minimatch(file, pattern, { dot: true }) && (!ignore || !minimatch(file, ignore, { dot: true }))),
  );

export const detectChanges = (files: string[]) =>
  Object.fromEntries(Object.entries(patterns).map(([key, pattern]) => [key, someFileMatchesSomePattern(files, pattern)])) as Record<
    keyof typeof patterns,
    boolean
  >;

export const getGitChanges = async (options: { allTrue?: boolean } = {}): Promise<Record<keyof typeof patterns, boolean>> => {
  if (options.allTrue) {
    return Object.fromEntries(Object.keys(patterns).map(key => [key, true])) as Record<keyof typeof patterns, boolean>;
  }

  const git = simpleGit({ baseDir: fileURLToPath(new URL('../../', import.meta.url).href) });
  const summary = await git.diffSummary({ '@~1': null });
  const files = summary.files.map(({ file }) => file);
  return detectChanges(files);
};
