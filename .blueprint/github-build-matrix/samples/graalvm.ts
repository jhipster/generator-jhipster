import type { GitHubMatrixGroup } from '../../../lib/testing/github-matrix.js';
import { extendMatrix, fromMatrix } from '../../../lib/testing/support/matrix-utils.js';
import { convertOptionsToJDL } from '../support/jdl.js';

export default Object.fromEntries(
  [
    ...Object.entries(
      extendMatrix(
        fromMatrix({
          buildTool: ['maven', 'gradle'],
          reactive: [undefined, true],
        }),
        {},
      ),
    ),
  ].map(([key, value]) => [
    key,
    {
      'java-version': '21',
      jdl: convertOptionsToJDL({ ...value, graalvmSupport: true }),
    },
  ]),
) satisfies GitHubMatrixGroup;
