import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import BaseGenerator from '../../generators/base/index.js';
import { getGithubOutputFile, setGithubTaskOutput } from '../../lib/testing/index.js';
import { getPackageRoot } from '../../lib/index.js';
import { BUILD_JHIPSTER_BOM, JHIPSTER_BOM_BRANCH, JHIPSTER_BOM_CICD_VERSION } from '../../test-integration/integration-test-constants.js';
import type { GitHubMatrix, GitHubMatrixRecord } from './support/github-ci-matrix.js';
import { convertToGitHubMatrix } from './support/github-ci-matrix.js';
import { dockerComposeMatrix } from './samples/docker-compose-integration.js';
import { getGitChanges } from './support/git-changes.js';
import { devServerMatrix } from './samples/dev-server.js';
import type { eventNameChoices, workflowChoices } from './command.js';

type JHipsterGitHubMatrix = GitHubMatrix & {
  name: string;
  'app-sample'?: string;
  'build-jhipster-bom'?: boolean;
  'gradle-cache'?: boolean;
  'jhipster-bom-cicd-version'?: string;
  'jhipster-bom-branch'?: string;
  'sonar-analyse'?: 'true' | 'false';
  workspaces?: 'true' | 'false';
  'skip-frontend-tests'?: 'true' | 'false';
  'skip-backend-tests'?: 'true' | 'false';
};

type JHipsterGitHubInputMatrix = JHipsterGitHubMatrix & {
  generatorOptions: Record<string, any>;
};

export default class extends BaseGenerator {
  workflow!: (typeof workflowChoices)[number];
  eventName?: (typeof eventNameChoices)[number];
  matrix!: string;

  constructor(args, opts, features) {
    super(args, opts, { queueCommandTasks: true, ...features, jhipsterBootstrap: false });
  }

  get [BaseGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async buildMatrix() {
        // Push events requires a base commit for diff. Diff cannot be checked by @~1 if PR was merged with a rebase.
        const useChanges = this.eventName === 'pull_request';
        const changes = await getGitChanges({ allTrue: !useChanges });
        const { base, common, devBlueprint, client, e2e, java, workspaces } = changes;
        const hasWorkflowChanges = changes[`${this.workflow}Workflow`];

        let matrix: GitHubMatrixRecord = {};
        let randomEnvironment = false;
        if (this.workflow === 'docker-compose-integration') {
          matrix = dockerComposeMatrix;
        } else if (this.workflow === 'devserver') {
          if (devBlueprint || hasWorkflowChanges || client) {
            matrix = { ...devServerMatrix.angular, ...devServerMatrix.react, ...devServerMatrix.vue };
          } else {
            for (const client of ['angular', 'react', 'vue']) {
              if (changes[client]) {
                Object.assign(matrix, devServerMatrix[client]);
              }
            }
          }
        } else if (['angular', 'react', 'vue'].includes(this.workflow)) {
          const hasClientFrameworkChanges = changes[this.workflow];
          const enableAllTests = base || common || hasWorkflowChanges || devBlueprint;
          const enableBackendTests = enableAllTests || java;
          const enableFrontendTests = enableAllTests || client || hasClientFrameworkChanges;
          const enableE2eTests = enableBackendTests || enableFrontendTests || e2e || workspaces;
          const enableAnyTest = enableE2eTests;

          randomEnvironment = true;
          if (enableAnyTest) {
            const content = await readFile(join(getPackageRoot(), `test-integration/workflow-samples/${this.workflow}.json`));
            const parsed: { include: JHipsterGitHubInputMatrix[] } = JSON.parse(content.toString());
            matrix = Object.fromEntries(
              parsed.include.map((sample): [string, JHipsterGitHubMatrix] => {
                const { 'job-name': jobName = sample.name, 'sonar-analyse': sonarAnalyse, generatorOptions } = sample;
                const enableSonar = sonarAnalyse === 'true';
                const workspaces = generatorOptions?.workspaces ? 'true' : 'false';
                if (enableSonar && workspaces === 'true') {
                  throw new Error('Sonar is not supported with workspaces');
                }
                return [
                  jobName,
                  {
                    // Force tests if sonar is enabled
                    'skip-backend-tests': `${!(enableBackendTests || enableSonar)}`,
                    // Force tests if sonar is enabled
                    'skip-frontend-tests': `${!(enableFrontendTests || enableSonar)}`,
                    'gradle-cache': generatorOptions?.workspaces || jobName.includes('gradle') ? true : undefined,
                    ...sample,
                    sample: jobName,
                    workspaces,
                    'build-jhipster-bom': BUILD_JHIPSTER_BOM,
                    'jhipster-bom-branch': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_BRANCH : undefined,
                    'jhipster-bom-cicd-version': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_CICD_VERSION : undefined,
                  },
                ];
              }),
            );
          }
        }

        this.matrix = JSON.stringify(convertToGitHubMatrix(matrix, { randomEnvironment }), null, 2);
        const githubOutputFile = getGithubOutputFile();
        this.log.info('matrix', this.matrix);
        if (githubOutputFile) {
          setGithubTaskOutput('matrix', this.matrix);
        }
      },
    });
  }
}
