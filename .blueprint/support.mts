import BaseCoreGenerator from '../generators/base-core/index.js';
import { defaultSamplesFolder } from './constants.js';

export const samplesFolderConfig = 'samplesFolder';

export { defaultSamplesFolder };

export const promptSamplesFolder = async function (this: BaseCoreGenerator) {
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
