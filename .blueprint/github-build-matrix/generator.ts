import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import BaseGenerator from '../../generators/base-core/index.js';
import type { GitHubMatrix, GitHubMatrixGroup } from '../../lib/testing/index.js';
import { convertToGitHubMatrix, getGithubOutputFile, getGithubSamplesGroup, setGithubTaskOutput } from '../../lib/testing/index.js';
import { getPackageRoot } from '../../lib/index.js';
import { BUILD_JHIPSTER_BOM, JHIPSTER_BOM_BRANCH, JHIPSTER_BOM_CICD_VERSION } from '../../test-integration/integration-test-constants.js';
import type { JHipsterGeneratorOptions } from '../../lib/types/application/options.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType, DeprecatedBaseApplicationSource } from '../../lib/types/application/application.js';
import type { BaseApplicationControl } from '../../generators/base-application/types.js';
import type { TemporaryControlToMoveToDownstream } from '../../generators/base/types.js';
import type { TaskTypes as DefaultTaskTypes } from '../../generators/base-application/tasks.js';
import type BaseApplicationSharedData from '../../generators/base-application/shared-data.js';
import type { BaseApplicationConfiguration, BaseApplicationFeatures } from '../../generators/base-application/api.js';
import type { ApplicationConfiguration } from '../../lib/types/application/yo-rc.js';
import type { eventNameChoices, workflowChoices } from './command.js';
import { devServerMatrix } from './samples/dev-server.js';
import { getGitChanges } from './support/git-changes.js';

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
  'skip-compare'?: 'true' | 'false';
  'skip-backend-tests'?: 'true' | 'false';
};

type JHipsterGitHubInputMatrix = JHipsterGitHubMatrix & {
  generatorOptions: Record<string, any>;
};

export default class<
  // FIXME For the ones that are trying to fix the types, remove the equals and look at the consequences
  Options extends JHipsterGeneratorOptions = JHipsterGeneratorOptions,
  Field extends DeprecatedField = DeprecatedField,
  PK extends DeprecatedPrimarykey<Field> = DeprecatedPrimarykey<Field>,
  Relationship extends DeprecatedRelationship<any> = DeprecatedRelationship<any>,
  // @ts-ignore
  Entity extends DeprecatedEntity<Field, PK, Relationship> = DeprecatedEntity<Field, PK, Relationship>,
  Application extends ApplicationType<Field, PK, Relationship> = ApplicationType<Field, PK, Relationship>,
  Sources extends DeprecatedBaseApplicationSource<Field, Relationship, Application> = DeprecatedBaseApplicationSource<
    Field,
    Relationship,
    Application
  >,
  Control extends BaseApplicationControl = TemporaryControlToMoveToDownstream,
  TaskTypes extends DefaultTaskTypes<Field, PK, Relationship, Entity, Application, Sources, Control> = DefaultTaskTypes<
    Field,
    PK,
    Relationship,
    Entity,
    Application,
    Sources,
    Control
  >,
  SharedData extends BaseApplicationSharedData<Field, PK, Relationship, Entity, Application, Sources, Control> = BaseApplicationSharedData<
    Field,
    PK,
    Relationship,
    Entity,
    Application,
    Sources,
    Control
  >,
  Configuration extends BaseApplicationConfiguration = ApplicationConfiguration,
  Features extends BaseApplicationFeatures = BaseApplicationFeatures,
> extends BaseGenerator<Options, Entity, Application, Sources, Control, TaskTypes, SharedData, Configuration, Features> {
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
        const hasWorkflowChanges = changes[`${this.workflow}Workflow`];

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
              if (changes[client]) {
                Object.assign(matrix, devServerMatrix[client]);
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
            const parsed: { include: JHipsterGitHubInputMatrix[] } = JSON.parse(content.toString());
            matrix = Object.fromEntries(
              parsed.include
                .map((sample): [string, JHipsterGitHubMatrix] | undefined => {
                  const { 'job-name': jobName = sample.name, 'sonar-analyse': sonarAnalyse, generatorOptions } = sample;
                  const enableSonar = sonarAnalyse === 'true';
                  const workspaces = generatorOptions?.workspaces ? 'true' : 'false';
                  if (enableSonar && workspaces === 'true') {
                    throw new Error('Sonar is not supported with workspaces');
                  }
                  if (!enableAnyTest && !sonarAnalyse) return undefined;
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
                })
                .filter(Boolean) as [string, JHipsterGitHubMatrix][],
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
