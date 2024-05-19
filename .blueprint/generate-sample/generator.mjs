import { extname } from 'path';
import { transform } from '@yeoman/transform';
import BaseGenerator from '../../generators/base/index.js';
import { packageJson } from '../../lib/index.js';
import { generateSample, entitiesByType } from './support/index.js';
import { promptSamplesFolder } from '../support.mjs';
import { GENERATOR_APP, GENERATOR_JDL } from '../../generators/generator-list.js';

export default class extends BaseGenerator {
  sampleName;
  global;
  projectFolder;
  projectVersion;
  entitiesSample;
  sampleYorcFolder;

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

  get [BaseGenerator.CONFIGURING]() {
    return this.asConfiguringTaskGroup({
      async configureCommand() {
        await this.configureCurrentJHipsterCommandConfig();
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.asEndTaskGroup({
      async generateJdlSample() {
        if (extname(this.sampleName) !== '.jdl') return;

        await this.composeWithJHipster(GENERATOR_JDL, {
          generatorArgs: [this.templatePath('samples', this.sampleName)],
          generatorOptions: { projectVersion: this.projectVersion, destinationPath: this.projectFolder },
        });
      },
      async generateSample() {
        if (extname(this.sampleName) === '.jdl' || this.sampleYorcFolder) return;

        const sample = await generateSample(this.sampleName, {
          destProjectFolder: this.projectFolder,
          fork: false,
        });

        // Cleanup mem-fs files. Reload them from disk.
        await this.pipeline(
          { refresh: true, pendingFiles: false },
          transform(() => {}),
        );

        let generatorOptions = {
          projectVersion: this.projectVersion,
          destinationPath: this.projectFolder,
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
              generatorOptions: { jsonOnly: true, destinationPath: this.projectFolder },
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
          /*
          this.copyTemplate(
            entitiesFiles.map(entity => `.jhipster/${entity}.json`),
            this.projectFolder,
            { noGlob: true, fromBasePath: this.templatePath('../../../test-integration/samples/') },
          );
          */
          entitiesFiles.forEach(entity =>
            this.copyTemplate(
              `../../../test-integration/samples/.jhipster/${entity}.json`,
              `${this.projectFolder}/.jhipster/${entity}.json`,
              { noGlob: true },
            ),
          );
        }
        await this.composeWithJHipster(GENERATOR_APP, { generatorOptions: { destinationPath: this.projectFolder } });
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
