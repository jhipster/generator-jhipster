/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { basename, extname, join, resolve } from 'node:path';

import BaseGenerator from '../../generators/base-core/index.ts';
import type { Config } from '../../generators/base-core/types.ts';
import { type SampleDescription, type SampleFile, defaultGithubEnvironment, extractSampleFiles } from '../../lib/ci/index.ts';
import { getPackageRoot, packageJson } from '../../lib/index.ts';
import { findSamples } from '../describe-samples/support/describe-samples.ts';
import { promptSamplesFolder } from '../support.ts';

const GENERATOR_JDL = 'jdl';
const GENERATOR_INFO = 'info';

/** The jwt secret key of the applications and the deployments of a jdl sample, which a deployment draws otherwise. */
const SAMPLE_JWT_SECRET_KEY = defaultGithubEnvironment['jwt-secret-key'];
/**
 * The secrets of a sample, which generates the same code each time: the secrets an application draws when it has none
 * are derived from its creation timestamp. A jdl sample may declare deployments, which have no creation timestamp: its
 * jwt secret key is fixed.
 */
const sampleSecrets = ({ jdl }: { jdl: boolean }) => ({
  reproducibleSecrets: true,
  ...(jdl ? { jwtSecretKey: SAMPLE_JWT_SECRET_KEY } : {}),
});
/** The password of the databases of the deployments of a sample, which a deployment draws otherwise. */
const SAMPLE_DB_RANDOM_PASSWORD = 'sample-db-password';

const packageRoot = getPackageRoot();

export default class extends BaseGenerator<Config & { entities: string[] }> {
  sampleName!: string;
  global?: boolean;
  projectFolder!: string;
  projectVersion?: string;
  sampleOnly?: boolean;
  /** The sample of the name, as describe-samples describes it. */
  sample?: SampleDescription;
  /** The files of the project of the sample, its inline jdl as files. */
  sampleFiles: SampleFile[] = [];

  get [BaseGenerator.INITIALIZING]() {
    return this.asAnyTaskGroup({
      projectVersion() {
        this.projectVersion = `${packageJson.version}-git`;
      },
      sampleSecrets() {
        // A sample generates the same code each time: the database password a deployment draws is fixed, for every
        // generator of the sample, the deployments of a workspace included.
        Object.assign(this.env.sharedOptions, {
          dbRandomPassword: SAMPLE_DB_RANDOM_PASSWORD,
        });
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
              message: `Do you want to generate the sample in a folder named ${this.sampleName}?`,
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
        } else {
          const [sample] = findSamples({ sampleName: this.sampleName });
          this.sample = sample;
          this.sampleFiles = extractSampleFiles(sample, { root: packageRoot });
          for (const file of this.sampleFiles) {
            const destination = join(this.projectFolder, file.destination);
            if ('source' in file) {
              this.fs.copy(file.source, destination);
            } else {
              this.fs.write(destination, file.contents);
            }
          }
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
          generatorOptions: { projectVersion: this.projectVersion, destinationRoot: this.projectFolder, ...sampleSecrets({ jdl: true }) },
        });
      },
      async generateSample() {
        if (extname(this.sampleName) === '.jdl' || this.sampleOnly) return;

        const { sample } = this;
        if (!sample) return;
        const generatorOptions: any = {
          projectVersion: this.projectVersion,
          destinationRoot: this.projectFolder,
          ...sampleSecrets({ jdl: sample.defaultCommand === GENERATOR_JDL }),
          ...(sample.environment ? { defaultEnvironment: sample.environment } : {}),
          ...(sample.war ? { defaultPackaging: 'war' } : {}),
          ...sample.generatorOptions,
        };
        // The jdl files of the project, the inline ones included, which the jdl generator concatenates.
        const jdlFiles = this.sampleFiles.map(file => file.destination).filter(destination => extname(destination) === '.jdl');
        if (jdlFiles.length > 0 && this.sampleFiles.some(file => file.destination === '.yo-rc.json')) {
          // The entities of an app sample written as jdl: with its .yo-rc.json, the jdl generator would generate the entities
          // of an existing project alone.
          await this.composeWithJHipster(GENERATOR_JDL, {
            generatorArgs: jdlFiles,
            generatorOptions: { ...generatorOptions, jsonOnly: true },
          });
          await this.composeWithJHipster(sample.defaultCommand, { generatorOptions });
          return;
        }
        await this.composeWithJHipster(jdlFiles.length > 0 ? GENERATOR_JDL : sample.defaultCommand, {
          generatorArgs: jdlFiles,
          generatorOptions,
        });
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
