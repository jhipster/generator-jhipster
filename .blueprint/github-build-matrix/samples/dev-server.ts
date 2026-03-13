import type { GitHubMatrixGroup } from '../../../lib/ci/index.ts';

export const devServerMatrix = {
  angular: {
    'ng-default-esbuild': {
      sample: 'samples/ng-default',
      args: '--sample-yorc-folder --entities-sample sqllight --client-bundler esbuild',
      os: 'macos-latest',
    },
    'ng-default-webpack': {
      sample: 'samples/ng-default',
      args: '--auth oauth2 --sample-yorc-folder --entities-sample sqllight --client-bundler webpack',
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
