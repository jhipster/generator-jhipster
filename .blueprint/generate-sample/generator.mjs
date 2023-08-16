import BaseGenerator from '../../generators/base/index.mjs';
import command from './command.mjs';
import { generateSample } from './support/generate-sample.js';
import { promptSamplesFolder } from '../support.mjs';

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
          promptSamplesFolder.call(this);
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.asEndTaskGroup({
      async generateSample() {
        await generateSample(this.sampleName, {
          destSamplesFolder: this._globalConfig.get('samplesFolder'),
          destProjectFolder: this.projectFolder ?? this.global ? undefined : process.cwd(),
        });
        if (this.global) {
          await this.composeWithJHipster('@jhipster/jhipster-dev:code-workspace', {
            generatorOptions: {
              sampleName: this.sampleName,
            },
          });
        }
      },
    });
  }
}
