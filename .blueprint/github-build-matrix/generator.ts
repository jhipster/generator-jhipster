import BaseGenerator from '../../generators/base/index.js';
import { setGithubTaskOutput } from '../../lib/testing/index.js';
import { convertToGitHubMatrix } from './support/github-ci-matrix.js';
import { testcontainersMatrix } from './support/testcontainers.js';

export default class extends BaseGenerator {
  workflow;

  constructor(args, opts, features) {
    super(args, opts, { ...features, jhipsterBootstrap: true });
  }

  get [BaseGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async buildMatrix() {
        if (this.workflow === 'testcontainers') {
          setGithubTaskOutput('matrix', JSON.stringify(convertToGitHubMatrix(testcontainersMatrix), null, 2));
        }
      },
    });
  }
}
