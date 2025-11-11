import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { minimatch } from 'minimatch';
import { simpleGit } from 'simple-git';

import { testIntegrationRelativeFolder } from '../../constants.ts';

export const getGitChanges = async (options: { allTrue?: boolean } = {}) => {
  let hasPatternChanges: (pattern: string, ignore?: string) => boolean;
  if (options.allTrue) {
    hasPatternChanges = () => true;
  } else {
    const git = simpleGit({ baseDir: fileURLToPath(new URL('../../', import.meta.url).href) });
    const summary = await git.diffSummary({ '@~1': null });
    const files = summary.files.map(({ file }) => file);
    hasPatternChanges = (pattern: string, ignore?: string) =>
      files.some(file => minimatch(file, pattern, { dot: true }) && (!ignore || !minimatch(file, ignore, { dot: true })));
  }

  const hasClientWorkflowChanges = (client: 'angular' | 'react' | 'vue') =>
    hasPatternChanges(`.github/workflows/${client}.yml`) ||
    hasPatternChanges(join(testIntegrationRelativeFolder, `workflow-samples/${client}.json`));
  return {
    angular: hasPatternChanges('generators/angular/**'),
    angularWorkflow: hasClientWorkflowChanges('angular'),
    base:
      hasPatternChanges('lib/**') ||
      hasPatternChanges('generators/*') ||
      hasPatternChanges('generators/{base*,bootstrap*,git,jdl,project-name}/**'),
    ci: hasPatternChanges('.github/{actions,workflows}/**') || hasPatternChanges(join(testIntegrationRelativeFolder, '{,jdl}samples/**')),
    devBlueprint: hasPatternChanges('.blueprint/**'),
    devserverWorkflow: hasPatternChanges('.github/workflows/devserver.yml'),
    common: hasPatternChanges('generators/{app,common,docker,languages}/**'),
    client: hasPatternChanges('generators/{client,init,javascript}/**'),
    e2e: hasPatternChanges('generators/cypress/**'),
    java: hasPatternChanges(
      'generators/{cucumber,feign-client,gatling,gradle,java,liquibase,maven,server,spring*}/**',
      'generators/java-simple-application/generators/graalvm/**',
    ),
    graalvm: hasPatternChanges('generators/java-simple-application/generators/graalvm/**'),
    react: hasPatternChanges('generators/react/**'),
    reactWorkflow: hasClientWorkflowChanges('react'),
    workspaces: hasPatternChanges('generators/{docker-compose,kubernetes*,workspaces}/**'),
    vue: hasPatternChanges('generators/vue/**'),
    vueWorkflow: hasClientWorkflowChanges('vue'),
    sonarPr: hasPatternChanges('.github/actions/sonar/**'),
  };
};
