import { extendMatrix, fromMatrix } from '../../../lib/testing/index.js';
import { convertOptionsToJDL } from '../support/jdl.js';

export const graalvmMatrix = Object.fromEntries(
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
);
