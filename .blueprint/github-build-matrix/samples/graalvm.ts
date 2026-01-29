import type { GitHubMatrixGroup } from '../../../lib/ci/index.ts';
import { extendMatrix, fromMatrix } from '../../../lib/ci/index.ts';
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
      'java-version': '25',
      jdl: convertOptionsToJDL({ ...value, graalvmSupport: true }),
    },
  ]),
) satisfies GitHubMatrixGroup;
