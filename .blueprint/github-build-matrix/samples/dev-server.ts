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
