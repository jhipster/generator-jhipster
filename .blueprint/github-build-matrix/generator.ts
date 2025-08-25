import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import BaseGenerator from '../../generators/base-core/index.ts';
import { getPackageRoot } from '../../lib/index.ts';
import { getGithubSamplesGroup } from '../../lib/testing/github-group.ts';
import type { GitHubMatrixGroup } from '../../lib/testing/github-matrix.ts';
import { convertToGitHubMatrix } from '../../lib/testing/github-matrix.ts';
import { getGithubOutputFile, setGithubTaskOutput } from '../../lib/testing/github.ts';
import type { JHipsterGitHubInputMatrix, WorkflowSamples } from '../../lib/testing/workflow-samples.ts';

import type { eventNameChoices, workflowChoices } from './command.ts';
import { devServerMatrix } from './samples/dev-server.ts';
import { getGitChanges } from './support/git-changes.ts';
import { BUILD_JHIPSTER_BOM, JHIPSTER_BOM_BRANCH, JHIPSTER_BOM_CICD_VERSION } from './support/integration-test-constants.ts';

export default class extends BaseGenerator {
  workflow!: (typeof workflowChoices)[number];
  eventName?: (typeof eventNameChoices)[number];
  matrix!: string;

  get [BaseGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async buildMatrix() {
        // Push events requires a base commit for diff. Diff cannot be checked by @~1 if PR was merged with a rebase.
        const useChanges = this.eventName === 'pull_request';
        const changes = await getGitChanges({ allTrue: !useChanges });
        const { base, common, devBlueprint, client, e2e, graalvm, java, workspaces } = changes;
        const hasWorkflowChanges = Boolean((changes as Record<string, boolean>)[`${this.workflow}Workflow`]);

        let matrix: GitHubMatrixGroup = {};
        let randomEnvironment = false;
        if (this.workflow === 'docker-compose-integration') {
          const { samples, warnings } = await getGithubSamplesGroup(this.templatePath('../samples/'), this.workflow);
          matrix = samples;
          if (warnings.length) {
            this.log.warn(warnings.join('\n'));
          }
        } else if (this.workflow === 'graalvm') {
          if (hasWorkflowChanges || java || graalvm) {
            const { samples, warnings } = await getGithubSamplesGroup(this.templatePath('../samples/'), this.workflow);
            matrix = samples;
            if (warnings.length) {
              this.log.warn(warnings.join('\n'));
            }
          }
        } else if (this.workflow === 'devserver') {
          if (devBlueprint || hasWorkflowChanges || client) {
            matrix = { ...devServerMatrix.angular, ...devServerMatrix.react, ...devServerMatrix.vue };
          } else {
            for (const client of ['angular', 'react', 'vue']) {
              if ((changes as Record<string, boolean>)[client]) {
                Object.assign(matrix, (devServerMatrix as Record<string, GitHubMatrixGroup>)[client]);
              }
            }
          }
        } else if (['angular', 'react', 'vue'].includes(this.workflow)) {
          const hasClientFrameworkChanges = changes[this.workflow];
          const hasSonarPrChanges = changes.sonarPr && this.workflow === 'angular';
          const enableAllTests = base || common || hasWorkflowChanges || devBlueprint;
          const enableBackendTests = enableAllTests || java;
          const enableFrontendTests = enableAllTests || client || hasClientFrameworkChanges;
          const enableE2eTests = enableBackendTests || enableFrontendTests || e2e || workspaces;
          const enableAnyTest = enableE2eTests;

          randomEnvironment = true;
          if (enableAnyTest || hasSonarPrChanges) {
            const content = await readFile(join(getPackageRoot(), `test-integration/workflow-samples/${this.workflow}.json`));
            const parsed: WorkflowSamples = JSON.parse(content.toString());
            matrix = Object.fromEntries(
              parsed.include
                .filter(sample => enableAnyTest || sample['sonar-analyse'])
                .map((sample): [string, JHipsterGitHubInputMatrix] => {
                  const { 'job-name': jobName = sample.name, 'sonar-analyse': sonarAnalyse, generatorOptions } = sample;
                  const enableSonar = sonarAnalyse === 'true';
                  const workspaces = generatorOptions?.workspaces ? 'true' : 'false';
                  if (enableSonar && workspaces === 'true') {
                    throw new Error('Sonar is not supported with workspaces');
                  }
                  return [
                    jobName,
                    {
                      'skip-compare': `${changes.sonarPr && enableSonar}`,
                      // Force tests if sonar is enabled
                      'skip-backend-tests': `${!(enableBackendTests || enableSonar)}`,
                      // Force tests if sonar is enabled
                      'skip-frontend-tests': `${!(enableFrontendTests || enableSonar)}`,
                      'gradle-cache': generatorOptions?.workspaces || jobName.includes('gradle') ? true : undefined,
                      ...sample,
                      sample: sample.name ?? jobName,
                      workspaces,
                    },
                  ];
                }),
            );
          }
        }

        Object.values(matrix).forEach(job => {
          Object.assign(job, {
            'build-jhipster-bom': BUILD_JHIPSTER_BOM,
            'jhipster-bom-branch': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_BRANCH : undefined,
            'jhipster-bom-cicd-version': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_CICD_VERSION : undefined,
          });
        });

        const { useVersionPlaceholders } = this;
        this.matrix = JSON.stringify(convertToGitHubMatrix(matrix, { randomEnvironment, useVersionPlaceholders }), null, 2);
        const githubOutputFile = getGithubOutputFile();
        this.log.info('matrix', this.matrix);
        if (githubOutputFile) {
          setGithubTaskOutput('matrix', this.matrix);
        }
      },
    });
  }
}
