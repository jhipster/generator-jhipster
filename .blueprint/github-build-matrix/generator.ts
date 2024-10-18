import BaseGenerator from '../../generators/base/index.js';
import { setGithubTaskOutput } from '../../lib/testing/index.js';
import { convertToGitHubMatrix } from './support/github-ci-matrix.js';
import { dockerComposeMatrix } from './samples/docker-compose-integration.js';
import { getGitChanges } from './support/git-changes.js';
import { devServerMatrix } from './samples/dev-server.js';

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
        } else if (this.workflow === 'dev-server') {
          const { devBlueprint, devserverCi, client, angular, react, vue } = await getGitChanges();
          const matrix = {};
          if (devBlueprint || devserverCi || client || angular) {
            // Object.assign(matrix, devServerMatrix.angular);
          }
          if (devBlueprint || devserverCi || client || react) {
            Object.assign(matrix, devServerMatrix.react);
          }
          if (devBlueprint || devserverCi || client || vue) {
            Object.assign(matrix, devServerMatrix.vue);
          }
          const githubMatrix = convertToGitHubMatrix(matrix);
          setGithubTaskOutput('matrix', JSON.stringify(githubMatrix, null, 2));
          setGithubTaskOutput('empty-matrix', githubMatrix.include.length === 0);
        }
      },
    });
  }
}
