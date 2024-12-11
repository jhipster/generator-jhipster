import type { GitHubMatrixGroup } from '../../../lib/testing/index.js';

export const devServerMatrix = {
  angular: {
    'ng-default-esbuild': {
      sample: 'samples/ng-default',
      args: '--sample-yorc-folder --entities-sample sqllight --client-bundler experimentalEsbuild --build gradle',
      os: 'macos-latest',
    },
    'ng-default-webpack': {
      sample: 'samples/ng-default',
      args: '--sample-yorc-folder --entities-sample sqllight --client-bundler webpack',
    },
  },
  react: {
    'react-default': {
      sample: 'samples/react-default',
      args: '--sample-yorc-folder --entities-sample sqllight',
      os: 'macos-latest',
    },
  },
  vue: {
    'vue-default': {
      sample: 'samples/vue-default',
      args: '--sample-yorc-folder --entities-sample sqllight',
    },
  },
} satisfies Record<string, GitHubMatrixGroup>;
