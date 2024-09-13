import BaseGenerator from '../../generators/base/index.js';
import { setGithubTaskOutput } from '../../lib/testing/index.js';
import { convertToGitHubMatrix } from './support/github-ci-matrix.js';
import { dockerComposeMatrix } from './samples/docker-compose-integration.js';

export default class extends BaseGenerator {
  workflow;

  constructor(args, opts, features) {
    super(args, opts, { queueCommandTasks: true, ...features, jhipsterBootstrap: false });
  }

  get [BaseGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async buildMatrix() {
        if (this.workflow === 'docker-compose-integration') {
          setGithubTaskOutput('matrix', JSON.stringify(convertToGitHubMatrix(dockerComposeMatrix), null, 2));
        }
      },
    });
  }
}
