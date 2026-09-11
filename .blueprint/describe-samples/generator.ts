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
import BaseGenerator from '../../generators/base-core/index.ts';

import { type SampleDescription, WORKFLOWS, describeSamples, formatSample, formatSamplesList } from './support/describe-samples.ts';

export default class extends BaseGenerator {
  sampleName?: string;
  workflow?: string;
  json?: boolean;
  samples!: SampleDescription[];

  get [BaseGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async describe() {
        const samplesFolder = this.templatePath('../../github-build-matrix/samples/');
        const samples = await describeSamples({ workflow: this.workflow, samplesFolder });
        this.samples =
          this.sampleName ? samples.filter(sample => sample.name === this.sampleName || sample.jobName === this.sampleName) : samples;
        if (this.sampleName && this.samples.length === 0) {
          throw new Error(`Sample ${this.sampleName} not found in the ${this.workflow ?? WORKFLOWS.join(', ')} workflow samples`);
        }
        // Print on stdout so `--json` can be piped; `this.log` writes to stderr.
        // eslint-disable-next-line no-console
        console.log(this.format());
      },
    });
  }

  format(): string {
    if (this.json) {
      return JSON.stringify(this.sampleName ? this.samples[0] : this.samples, null, 2);
    }
    return this.sampleName ? this.samples.map(formatSample).join('\n\n') : formatSamplesList(this.samples);
  }
}
