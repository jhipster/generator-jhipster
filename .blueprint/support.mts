import CoreGenerator from '../generators/base-core/index.mjs';
import { defaultSamplesFolder } from './constants.js';

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
