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
  devBlueprint: ['.blueprint/**'],
  devserverWorkflow: ['.github/workflows/devserver.yml'],
  e2e: ['generators/cypress/**'],
  graalvm: ['generators/java-simple-application/generators/graalvm/**'],
  java: ['generators/{java,java-simple-application,liquibase,server,spring*}/**'],
  react: ['generators/react/**'],
  reactWorkflow: clientPatterns('react'),
  sonarPr: ['.github/workflows/sonar-pr.yml'],
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
