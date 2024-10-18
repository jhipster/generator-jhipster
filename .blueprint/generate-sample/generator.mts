import { basename, extname, resolve } from 'path';
import { transform } from '@yeoman/transform';
import BaseGenerator from '../../generators/base/index.js';
import { packageJson } from '../../lib/index.js';
import { promptSamplesFolder } from '../support.mjs';
import { GENERATOR_APP, GENERATOR_INFO, GENERATOR_JDL } from '../../generators/generator-list.js';
import { entitiesByType, generateSample } from './support/index.js';
import assert from 'assert';

export default class extends BaseGenerator {
  sampleName;
  global;
  projectFolder;
  projectVersion;
  entitiesSample;
  sampleYorcFolder;

  constructor(args, options, features) {
    super(args, options, { queueCommandTasks: true, ...features });
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
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
        } else if (!process.env.CI && !this.projectFolder && basename(process.cwd()) !== this.sampleName) {
          const answers = await this.prompt([
            {
              type: 'confirm',
              name: 'confirmProjectFolder',
              message: `Do you wan't to generate the sample in a folder named ${this.sampleName}?`,
              default: true,
            },
          ]);
          if (answers.confirmProjectFolder) {
            this.projectFolder = resolve(this.sampleName);
          }
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
          generatorOptions: { projectVersion: this.projectVersion, destinationRoot: this.projectFolder },
        });
      },
      async generateSample() {
        if (extname(this.sampleName) === '.jdl' || this.sampleYorcFolder) return;

        const sample = await generateSample(this.sampleName, {
          destProjectFolder: this.projectFolder,
          fork: false,
          entity: this.entitiesSample,
        });
        assert.ok(sample, `Sample ${this.sampleName} not found`);

        // Cleanup mem-fs files. Reload them from disk.
        await this.pipeline(
          { refresh: true, pendingFiles: false },
          transform(() => undefined),
        );

        let generatorOptions = {
          projectVersion: this.projectVersion,
          destinationRoot: this.projectFolder,
          ...sample.sample.generatorOptions,
        };
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
              generatorOptions: { jsonOnly: true, destinationRoot: this.projectFolder },
            });
          }
          await this.composeWithJHipster(GENERATOR_APP, { generatorOptions });
        }
      },
      async generateYoRcSample() {
        if (!this.sampleYorcFolder) return;
        this.copyTemplate(`../../../test-integration/${this.sampleName}/.yo-rc.json`, '.yo-rc.json');
        const entitiesFiles = entitiesByType[this.entitiesSample];
        if (entitiesFiles) {
          this.jhipsterConfig.entities = entitiesFiles;
          this.log.info(`Copying entities ${this.entitiesSample} (${entitiesFiles})`);
          this.copyTemplate(
            entitiesFiles.map(entity => `.jhipster/${entity}.json`),
            this.projectFolder,
            { noGlob: true, fromBasePath: this.templatePath('../../../test-integration/samples/') },
          );
        }
        await this.composeWithJHipster(GENERATOR_APP, { generatorOptions: { destinationRoot: this.projectFolder } });
      },
      async updateVscodeWorkspace() {
        if (this.global) {
          await this.composeWithJHipster('@jhipster/jhipster-dev:code-workspace', {
            generatorOptions: {
              samplePath: this.sampleName,
            },
          } as any);
        }
      },
      async info() {
        await this.composeWithJHipster(GENERATOR_INFO, { generatorOptions: { destinationRoot: this.projectFolder } });
      },
    });
  }
}
