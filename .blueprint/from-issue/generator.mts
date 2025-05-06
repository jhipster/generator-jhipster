import { join } from 'node:path';

import BaseGenerator from '../../generators/base/index.js';
import { getGithubIssue, setGithubTaskOutput, prepareSample, appendToSummary } from '../../lib/testing/index.js';
import { promptSamplesFolder } from '../support.mjs';
import { GENERATOR_APP, GENERATOR_JDL, GENERATOR_WORKSPACES } from '../../generators/generator-list.js';
import { extractDataFromInfo, markdownDetails, type InfoData } from '../../generators/info/support/index.js';
import EnvironmentBuilder from '../../cli/environment-builder.mjs';

const YO_RC_OUTPUT = 'yo-rc';
const ENTITIES_JDL_OUTPUT = 'entities-jdl';
const RESULT_OUTPUT = 'result';
const VALID_OUTPUT = 'valid';
const SUMMARY_OUTPUT = 'summary';
const FOOTER_OUTPUT = 'footer';
const DIFFS_OUTPUT = 'diffs';

const CONTAINS_SAMPLE = 'contains-sample';

const BLANK = 'blank';
const VALID = 'valid';
const VALID_EMOJI = ':heavy_check_mark:';
const ERROR = 'error';
const ERROR_EMOJI = ':x:';
const SUCCESS = 'successfully generated';

const generateSummary = (data: InfoData, { applicationGenerated, issue }: { applicationGenerated: boolean; issue: string }) => `
| ${issue} | Value |
| --- | --- |${data.yoRcBlank ? `` : `\n| **.yo-rc.json** | ${data.yoRcValid ? VALID_EMOJI : ERROR_EMOJI} |`}${
  (data.jdlApplications ?? 0) > 0 ? `\n| **JDL** | ${VALID_EMOJI} |` : ``
}
| **Entities JDL** | ${data.jdlEntitiesDefinitions ? VALID_EMOJI : '-'} |
| --- | --- |
| **Application Generation** | ${applicationGenerated ? VALID_EMOJI : ERROR_EMOJI} |
`;

const generateFooter = (data: InfoData) =>
  data.files.map(info => markdownDetails({ title: info.filename, codeType: 'jdl', content: info.content })).join('\n\n');

const generateDiffOutput = (title: string, content: string) => markdownDetails({ title, codeType: 'diff', content });

export default class extends BaseGenerator {
  projectFolder!: string;
  issue!: string;
  codeWorkspace!: boolean;

  issueNumber!: string;
  owner!: string;
  repository!: string;

  data!: InfoData;
  logCwd = this.destinationPath();

  summaryData = '';
  summaryFooter = '';
  summaryDiffs = '';

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
        const issue = await getGithubIssue({ owner: this.owner, repository: this.repository, issue: this.issueNumber });

        if (this.projectFolder || this._globalConfig.get('samplesFolder')) {
          this.destinationRoot(
            this.destinationPath(this.projectFolder ?? join(this._globalConfig.get('samplesFolder'), `issues/${this.issueNumber}`)),
          );
        }

        this.data = extractDataFromInfo(issue.body ?? '');
        if (this.data.yoRcBlank) {
          setGithubTaskOutput(YO_RC_OUTPUT, BLANK);
        } else {
          setGithubTaskOutput(YO_RC_OUTPUT, this.data.yoRcValid ? VALID : ERROR);
        }

        setGithubTaskOutput(ENTITIES_JDL_OUTPUT, this.data.jdlEntitiesDefinitions ? VALID : BLANK);
        setGithubTaskOutput(CONTAINS_SAMPLE, Boolean(this.data.jdlDefinitions || this.data.yoRcContent));
        setGithubTaskOutput(VALID_OUTPUT, this.data.yoRcValid);
        this.summaryFooter = generateFooter(this.data);
        setGithubTaskOutput(FOOTER_OUTPUT, this.summaryFooter);

        for (const file of await prepareSample(
          this.destinationPath(),
          this.data.files.filter(file => ['yo-rc', 'json'].includes(file.type)),
        )) {
          this.writeDestination(file.filename, file.content);
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.asEndTaskGroup({
      async generateSample() {
        const envOptions = { cwd: this.destinationPath(), logCwd: this.logCwd };
        const generatorOptions = { ...this.options, skipPriorities: ['prompting'], skipInstall: true, experimental: true, force: true };
        delete generatorOptions.sharedData;

        const { workspacesFolders, jdlEntitiesDefinitions, yoRcContent, jdlApplications = 0, files } = this.data;
        try {
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
          } else if (jdlApplications > 0) {
            const workspaceOpts = jdlApplications > 1 ? { workspaces: true, monorepository: true } : {};
            const diffs: string[] = [];
            for (const file of files.filter(file => file.type === 'jdl')) {
              await EnvironmentBuilder.run(
                [`jhipster:${GENERATOR_JDL}`],
                { ...generatorOptions, ...workspaceOpts, inline: file.content },
                envOptions,
              );
              const git = this.createGit();
              const status = await git.status();
              if (!status.isClean()) {
                await git.add('.').commit(`chore: generate application from ${file.filename}`);
                const { all } = await this.spawn('git', ['diff', '--no-color', '@~1'], { stdio: 'pipe', all: true });
                if (all) {
                  this.log(all);
                  diffs.push(generateDiffOutput(`diff ${file.filename}`, all));
                }
              }
            }
            this.summaryDiffs = diffs.join('\n\n');
            setGithubTaskOutput(DIFFS_OUTPUT, this.summaryDiffs);
          }
        } catch (error) {
          this.summaryData = generateSummary(this.data, { applicationGenerated: false, issue: this.issue });
          setGithubTaskOutput(SUMMARY_OUTPUT, this.summaryData);
          this.appendSummary();
          throw error;
        }

        setGithubTaskOutput(RESULT_OUTPUT, SUCCESS);
        this.summaryData = generateSummary(this.data, { applicationGenerated: true, issue: this.issue });
        setGithubTaskOutput(SUMMARY_OUTPUT, this.summaryData);
        this.appendSummary();

        if (this.codeWorkspace) {
          await this.composeWithJHipster('@jhipster/jhipster-dev:code-workspace', {
            generatorOptions: {
              samplePath: this.destinationPath(),
            } as any,
          });
        }
      },
    });
  }

  appendSummary() {
    appendToSummary(this.summaryData + this.summaryDiffs + this.summaryFooter);
  }
}
