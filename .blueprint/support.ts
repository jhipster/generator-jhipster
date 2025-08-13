import type CoreGenerator from '../generators/base-core/index.ts';

import { defaultSamplesFolder } from './constants.ts';

export const samplesFolderConfig = 'samplesFolder';

export { defaultSamplesFolder };

export const promptSamplesFolder = async function (this: CoreGenerator) {
  await this.prompt(
    {
      name: samplesFolderConfig,
      message: 'Where the samples folder is located?',
      default: defaultSamplesFolder,
      type: 'input',
    },
    this._globalConfig,
  );
};
