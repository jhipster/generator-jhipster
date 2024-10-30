import { join } from 'node:path';

import BaseGenerator from '../../generators/base/index.js';
import { getGithubIssue, setGithubTaskOutput, prepareSample } from '../../lib/testing/index.js';
import { promptSamplesFolder } from '../support.mjs';
import { GENERATOR_APP, GENERATOR_JDL, GENERATOR_WORKSPACES } from '../../generators/generator-list.js';
import { extractDataFromInfo, type InfoData } from '../../generators/info/support/index.js';
import EnvironmentBuilder from '../../cli/environment-builder.mjs';

const YO_RC_OUTPUT = 'yo-rc';
const ENTITIES_JDL_OUTPUT = 'entities-jdl';
const RESULT_OUTPUT = 'result';
const VALID_OUTPUT = 'valid';
const CONTAINS_SAMPLE = 'contains-sample';

const BLANK = 'blank';
const VALID = 'valid';
const ERROR = 'error';
const SUCCESS = 'successfully generated';

export default class extends BaseGenerator {
  issue!: string;
  projectFolder!: string;
  owner!: string;
  codeWorkspace!: boolean;
  repository!: string;
  data!: InfoData;

  constructor(args, options, features) {
    super(args, options, { queueCommandTasks: true, ...features });
  }

  get [BaseGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup({
      async promptOptions() {
        if (this.codeWorkspace) {
          await promptSamplesFolder.call(this);
        }
      },
    });
  }

  get [BaseGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup({
      async generateSample() {
        const issue = await getGithubIssue({ owner: this.owner, repository: this.repository, issue: this.issue });

        this.projectFolder = this.destinationPath(
          this.projectFolder ?? join(this._globalConfig.get('samplesFolder'), `issues/${this.issue}`),
        );

        this.data = extractDataFromInfo(issue.body ?? '');
        if (this.data.yoRcBlank) {
          setGithubTaskOutput(YO_RC_OUTPUT, BLANK);
        } else {
          setGithubTaskOutput(YO_RC_OUTPUT, this.data.yoRcValid ? VALID : ERROR);
        }

        setGithubTaskOutput(ENTITIES_JDL_OUTPUT, this.data.jdlEntitiesDefinitions ? VALID : BLANK);
        setGithubTaskOutput(CONTAINS_SAMPLE, Boolean(this.data.jdlDefinitions || this.data.yoRcContent));
        setGithubTaskOutput(VALID_OUTPUT, this.data.yoRcValid);

        for (const file of await prepareSample(this.projectFolder, this.data.files)) {
          this.writeDestination(file.filename, file.content);
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.asEndTaskGroup({
      async generateSample() {
        const envOptions = { cwd: this.projectFolder, logCwd: this.destinationPath() };
        const generatorOptions = { ...this.options, skipPriorities: ['prompting'], skipInstall: true, experimental: true };
        delete generatorOptions.sharedData;

        const { workspacesFolders, jdlEntitiesDefinitions, yoRcContent, jdlDefinitions } = this.data;
        if (jdlEntitiesDefinitions) {
          try {
            await EnvironmentBuilder.run(
              [`jhipster:${GENERATOR_JDL}`],
              { ...generatorOptions, inline: jdlEntitiesDefinitions, jsonOnly: true },
              envOptions,
            );
          } catch (error) {
            setGithubTaskOutput(ENTITIES_JDL_OUTPUT, ERROR);
            throw error;
          }
        }
        if (yoRcContent) {
          await EnvironmentBuilder.run(
            [`jhipster:${workspacesFolders ? GENERATOR_WORKSPACES : GENERATOR_APP}`],
            { ...generatorOptions, ...(workspacesFolders ? { workspacesFolders, generateApplications: true } : {}) },
            envOptions,
          );
        } else if (jdlDefinitions) {
          const applications = (jdlDefinitions.match(/application\s*\{/g) || []).length;
          const workspaceOpts = applications > 1 ? { workspaces: true, monorepository: true } : {};
          await EnvironmentBuilder.run(
            [`jhipster:${GENERATOR_JDL}`],
            { ...generatorOptions, ...workspaceOpts, inline: jdlDefinitions },
            envOptions,
          );
        }
        setGithubTaskOutput(RESULT_OUTPUT, SUCCESS);

        if (this.codeWorkspace) {
          await this.composeWithJHipster('@jhipster/jhipster-dev:code-workspace', {
            generatorOptions: {
              samplePath: this.projectFolder,
            } as any,
          });
        }
      },
    });
  }
}
