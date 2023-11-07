import BaseGenerator from '../../generators/base/index.mjs';
import command from './command.mjs';
import { generateSample } from './support/generate-sample.js';
import { promptSamplesFolder } from '../support.mjs';
import { GENERATOR_APP, GENERATOR_JDL } from '../../generators/generator-list.mjs';

export default class extends BaseGenerator {
  sampleName;
  global;
  projectFolder;

  get [BaseGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async initializeOptions() {
        this.parseJHipsterArguments(command.arguments);
        this.parseJHipsterOptions(command.options);
      },
    });
  }

  get [BaseGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup({
      async promptOptions() {
        if (this.global) {
          await promptSamplesFolder.call(this);
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.asEndTaskGroup({
      async generateSample() {
        const sample = await generateSample(this.sampleName, {
          destSamplesFolder: this._globalConfig.get('samplesFolder'),
          destProjectFolder: this.projectFolder ?? this.global ? undefined : process.cwd(),
          fork: false,
        });

        // Cleanup mem-fs files. Reload them from disk.
        await this.pipeline({ refresh: true, filter: () => true, pendingFiles: false });

        let generatorOptions = {};
        if (sample.sample.workspaces && sample.sample.workspaces !== 'false') {
          generatorOptions = { ...generatorOptions, workspaces: true, monorepository: true };
        }
        if (sample.generator === 'jdl') {
          await this.composeWithJHipster(GENERATOR_JDL, {
            generatorArgs: sample.jdlFiles,
            generatorOptions,
          });
        } else {
          if (sample.jdlFiles) {
            await this.composeWithJHipster(GENERATOR_JDL, {
              generatorArgs: sample.jdlFiles,
              generatorOptions: { jsonOnly: true },
            });
          }
          await this.composeWithJHipster(GENERATOR_APP, { generatorOptions });
        }
      },
      async updateVscodeWorkspace() {
        if (this.global) {
          await this.composeWithJHipster('@jhipster/jhipster-dev:code-workspace', {
            generatorOptions: {
              samplePath: this.sampleName,
            },
          });
        }
      },
    });
  }
}
