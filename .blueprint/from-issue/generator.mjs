import { Octokit } from 'octokit';
import { setOutput } from '@actions/core';
import BaseGenerator from '../../generators/base/index.js';
import { promptSamplesFolder } from '../support.mjs';
import { join } from 'path';
import { GENERATOR_APP, GENERATOR_JDL } from '../../generators/generator-list.js';
import { GENERATOR_JHIPSTER } from '../../generators/generator-constants.js';
import { CLI_NAME } from '../../cli/utils.mjs';
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
  issue;
  projectFolder;
  owner;
  codeWorkspace;
  repository;
  yoRcContent;
  jdlEntities;

  get [BaseGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async parseCommand() {
        await this.parseCurrentJHipsterCommand();
      },
    });
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
        const octokit = new Octokit();
        // Gets the owner, repo and issue_number from a string such as, "jhipster/generator-jhipster#12345"
        if (this.issue.includes('#')) {
          let split = this.issue.split('/');
          this.owner = split[0];
          split = split[1].split('#');
          this.repo = split[0];
          this.issue = split[1];
        }
        const issue = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
          owner: this.owner,
          repo: this.repository,
          issue_number: this.issue,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });

        const regexp = /<summary>(?<title>(?:(?!<\/summary>).)+)<\/summary>\s+<pre>(?<body>(?:(?!<\/pre>).)+)/gs;
        let match;
        let containsSample = false;
        let valid = false;
        while ((match = regexp.exec(issue.data.body)) !== null) {
          if (match.groups.title.includes('.yo-rc.json file')) {
            containsSample = true;
            try {
              if (match.groups.body) {
                const yoRcContent = JSON.parse(match.groups.body);
                this.yoRcContent = yoRcContent[GENERATOR_JHIPSTER] ? yoRcContent : { [GENERATOR_JHIPSTER]: yoRcContent };
                setOutput(YO_RC_OUTPUT, VALID);
                valid = true;
              } else {
                setOutput(YO_RC_OUTPUT, BLANK);
              }
            } catch {
              setOutput(YO_RC_OUTPUT, ERROR);
            }
          } else if (match.groups.title.includes('JDL entity definitions')) {
            containsSample = true;
            this.jdlEntities = match.groups.body?.trim();
            setOutput(ENTITIES_JDL_OUTPUT, this.jdlEntities ? VALID : BLANK);
          }
        }
        setOutput(CONTAINS_SAMPLE, containsSample);
        setOutput(VALID_OUTPUT, valid);

        this.projectFolder = this.projectFolder ?? join(this._globalConfig.get('samplesFolder'), `issues/${this.issue}`);
        if (this.yoRcContent) {
          const yoRcFile = join(this.projectFolder, '.yo-rc.json');
          try {
            const { jwtSecretKey } = this.readDestinationJSON(yoRcFile)?.[GENERATOR_JHIPSTER];
            this.yoRcContent[GENERATOR_JHIPSTER].jwtSecretKey = jwtSecretKey;
          } catch {}

          this.writeDestinationJSON(yoRcFile, this.yoRcContent);
        }
        if (this.jdlEntities) {
          this.writeDestination(this.destinationPath(this.projectFolder, 'entities.jdl'), this.jdlEntities);
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.asEndTaskGroup({
      async generateSample() {
        if (this.jdlEntities) {
          try {
            await this.runNonInteractive({
              cwd: this.projectFolder,
              inline: this.jdlEntities,
              generatorOptions: {
                jsonOnly: true,
              },
            });
          } catch (error) {
            setOutput(ENTITIES_JDL_OUTPUT, ERROR);
            throw error;
          }
        }
        if (this.yoRcContent) {
          await this.runNonInteractive({ cwd: this.projectFolder });
        }
        setOutput(RESULT_OUTPUT, SUCCESS);

        if (this.codeWorkspace) {
          await this.composeWithJHipster('@jhipster/jhipster-dev:code-workspace', {
            generatorOptions: {
              samplePath: this.projectFolder,
            },
          });
        }
      },
    });
  }

  async runNonInteractive({ cwd, inline, generatorOptions: customOptions }) {
    const envOptions = { cwd, logCwd: this.destinationPath() };
    const generatorOptions = { ...this.options, skipPriorities: ['prompting'], skipInstall: true, inline, ...customOptions };
    delete generatorOptions.sharedData;
    const envBuilder = await EnvironmentBuilder.createDefaultBuilder(envOptions);
    const env = envBuilder.getEnvironment();
    await env.run([`${CLI_NAME}:${inline ? GENERATOR_JDL : GENERATOR_APP}`], generatorOptions);
  }
}
