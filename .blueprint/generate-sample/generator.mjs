import { extname } from 'path';
import { transform } from '@yeoman/transform';
import BaseGenerator from '../../generators/base/index.js';
import { packageJson } from '../../lib/index.js';
import { generateSample } from './support/generate-sample.js';
import { promptSamplesFolder } from '../support.mjs';
import { GENERATOR_APP, GENERATOR_JDL } from '../../generators/generator-list.js';

export default class extends BaseGenerator {
  sampleName;
  global;
  projectFolder;
  projectVersion;

  get [BaseGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async parseCommand() {
        await this.parseCurrentJHipsterCommand();
      },
      projectVersion() {
        this.projectVersion = `${packageJson.version}-git`;
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
      async generateJdlSample() {
        if (extname(this.sampleName) !== '.jdl') return;

        await this.composeWithJHipster(GENERATOR_JDL, {
          generatorArgs: [this.templatePath('samples', this.sampleName)],
          generatorOptions: { projectVersion: this.projectVersion },
        });
      },
      async generateSample() {
        if (extname(this.sampleName) === '.jdl') return;

        const sample = await generateSample(this.sampleName, {
          destSamplesFolder: this._globalConfig.get('samplesFolder'),
          destProjectFolder: this.projectFolder ?? this.global ? undefined : process.cwd(),
          fork: false,
        });

        // Cleanup mem-fs files. Reload them from disk.
        await this.pipeline(
          { refresh: true, pendingFiles: false },
          transform(() => {}),
        );

        let generatorOptions = { projectVersion: this.projectVersion, ...sample.sample.generatorOptions };
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
