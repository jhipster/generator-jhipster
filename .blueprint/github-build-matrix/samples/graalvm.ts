import type { GitHubMatrixGroup } from '../../../lib/testing/github-matrix.ts';
import { extendMatrix, fromMatrix } from '../../../lib/testing/support/matrix-utils.ts';
import { convertOptionsToJDL } from '../support/jdl.ts';

export default Object.fromEntries(
  Object.entries(
    extendMatrix(
      fromMatrix({
        buildTool: ['maven', 'gradle'],
        reactive: [undefined, true],
      }),
      {},
    ),
  ).map(([key, value]) => [
    key,
    {
      'java-version': '21',
      jdl: convertOptionsToJDL({ ...value, graalvmSupport: true }),
    },
  ]),
) satisfies GitHubMatrixGroup;
