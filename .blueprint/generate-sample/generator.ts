import assert from 'node:assert';
import { basename, extname, resolve } from 'node:path';

import { globSync } from 'tinyglobby';

import BaseGenerator from '../../generators/base-core/index.ts';
import type { Config } from '../../generators/base-core/types.ts';
import { GENERATOR_APP, GENERATOR_INFO, GENERATOR_JDL } from '../../generators/generator-list.ts';
import { packageJson } from '../../lib/index.ts';
import { promptSamplesFolder } from '../support.ts';

import { entitiesByType, generateSample } from './support/index.ts';

export default class extends BaseGenerator<Config & { entities: string[] }> {
  sampleName!: string;
  global?: boolean;
  projectFolder!: string;
  projectVersion?: string;
  entitiesSample!: string;
  sampleYorcFolder?: boolean;
  sampleOnly?: boolean;
  sample?: Awaited<ReturnType<typeof generateSample>>;

  get [BaseGenerator.INITIALIZING]() {
    return this.asAnyTaskGroup({
      projectVersion() {
        this.projectVersion = `${packageJson.version}-git`;
      },
    });
  }

  get [BaseGenerator.PROMPTING]() {
    return this.asAnyTaskGroup({
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

  get [BaseGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async copySample() {
        if (extname(this.sampleName) === '.jdl') {
          this.copyTemplate(`samples/${this.sampleName}`, this.sampleName);
        } else if (this.sampleYorcFolder) {
          this.copyTemplate(`test-integration/${this.sampleName}/.yo-rc.json`, '.yo-rc.json');
          const entitiesFiles = entitiesByType[this.entitiesSample];
          if (entitiesFiles) {
            this.jhipsterConfig.entities = entitiesFiles;
            this.log.info(`Copying entities ${this.entitiesSample} (${entitiesFiles})`);
            this.copyTemplate(
              entitiesFiles.map(entity => `.jhipster/${entity}.json`),
              this.projectFolder,
              { noGlob: true, fromBasePath: this.templatePath('test-integration/samples/') },
            );
          }
        } else {
          this.sample = await generateSample(this.sampleName, {
            destProjectFolder: this.projectFolder,
            entity: this.entitiesSample,
            memFs: this.fs,
          });
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.asAnyTaskGroup({
      async generateJdlSample() {
        if (extname(this.sampleName) !== '.jdl' || this.sampleOnly) return;

        await this.composeWithJHipster(GENERATOR_JDL, {
          generatorArgs: [this.sampleName],
          generatorOptions: { projectVersion: this.projectVersion, destinationRoot: this.projectFolder },
        });
      },
      async generateSample() {
        if (extname(this.sampleName) === '.jdl' || this.sampleYorcFolder || this.sampleOnly) return;

        const sample = this.sample;
        assert.ok(sample, `Sample ${this.sampleName} not found`);

        let generatorOptions: any = {
          projectVersion: this.projectVersion,
          destinationRoot: this.projectFolder,
          ...sample.sample.generatorOptions,
        };
        if (sample.sample.workspaces && sample.sample.workspaces !== 'false') {
          generatorOptions = { ...generatorOptions, workspaces: true, monorepository: true };
        }
        if (sample.generator === 'jdl') {
          const files = globSync('*.jdl');
          await this.composeWithJHipster(GENERATOR_JDL, {
            generatorArgs: files,
            generatorOptions,
          });
        } else {
          if (sample.jdlFiles) {
            const files = globSync('*.jdl');
            await this.composeWithJHipster(GENERATOR_JDL, {
              generatorArgs: files,
              generatorOptions: { jsonOnly: true, destinationRoot: this.projectFolder },
            });
          }
          await this.composeWithJHipster(GENERATOR_APP, { generatorOptions });
        }
      },
      async generateYoRcSample() {
        if (!this.sampleYorcFolder || this.sampleOnly) return;

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
