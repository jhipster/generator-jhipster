import { join } from 'node:path';
import BaseGenerator from 'generator-jhipster/generators/base';
import { convertToGitHubMatrix, getGithubOutputFile, getGithubSamplesGroup, setGithubTaskOutput } from 'generator-jhipster/testing';

export default class extends BaseGenerator {
  /** @type {string} */
  samplesFolder;
  /** @type {string} */
  samplesGroup;
  /** @type {object} */
  matrix;

  constructor(args, opts, features) {
    super(args, opts, { ...features, queueCommandTasks: true, jhipsterBootstrap: false });
  }

  get [BaseGenerator.WRITING]() {
    return this.asWritingTaskGroup({
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
