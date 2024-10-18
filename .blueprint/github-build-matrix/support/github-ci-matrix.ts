import { RECOMMENDED_JAVA_VERSION, RECOMMENDED_NODE_VERSION } from '../../../generators/index.js';

type GitHubMatrix = {
  os: string;
  'node-version': string;
  'java-version': string;
  'default-environment': string;
  'job-name': string;
  sample: string;
  args: string;
};

type GitHubMatrixOutput = {
  include: GitHubMatrix[];
};

export const defaultEnvironment = {
  os: 'ubuntu-latest',
  'node-version': RECOMMENDED_NODE_VERSION,
  'java-version': RECOMMENDED_JAVA_VERSION,
  'default-environment': 'prod',
};

export const defaultEnvironmentMatrix = {
  os: ['ubuntu-latest'],
  'node-version': [RECOMMENDED_NODE_VERSION],
  'java-version': [RECOMMENDED_JAVA_VERSION],
  'default-environment': ['prod'],
};

export const convertToGitHubMatrix = (matrix: Record<string, any>): GitHubMatrixOutput => {
  return {
    include: Object.entries(matrix).map(([key, value]) => ({
      'job-name': key,
      sample: key,
      ...defaultEnvironment,
      ...value,
    })),
  };
};
