import { join } from 'node:path';

import { convertToGitHubMatrix, getGithubOutputFile, getGithubSamplesGroup, setGithubTaskOutput } from 'generator-jhipster/ci';
import BaseCoreGenerator from 'generator-jhipster/generators/base-core';

export default class extends BaseCoreGenerator {
  /** @type {string} */
  samplesFolder;
  /** @type {string} */
  samplesGroup;
  /** @type {object} */
  matrix;

  get [BaseCoreGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async buildMatrix() {
        const { samplesGroup = 'samples' } = this;
        const templatePath = this.templatePath('../../generate-sample/templates/');
        const samplesFolder = this.samplesFolder ? join(templatePath, this.samplesFolder) : templatePath;
        const { samples, warnings } = await getGithubSamplesGroup(samplesFolder, samplesGroup);
        if (warnings.length > 0) {
          this.log.info(warnings.join('\n'));
        }
        this.matrix = convertToGitHubMatrix(samples);
        const githubOutputFile = getGithubOutputFile();
        this.log.info('matrix', this.matrix);
        if (githubOutputFile) {
          setGithubTaskOutput('matrix', JSON.stringify(this.matrix));
        }
      },
    });
  }
}
