import { join } from 'path';
import _ from 'lodash';
import BaseGenerator from '../../generators/base/index.mjs';
import { getPackageRoot } from '../../lib/index.mjs';
import command from './command.mjs';
import { defaultSamplesFolder, promptSamplesFolder, samplesFolderConfig } from '../support.mjs';

const { merge } = _;

export default class extends BaseGenerator {
  sampleName;

  get [BaseGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async initializeOptions() {
        this.parseJHipsterArguments(command.arguments);
        this.parseJHipsterOptions(command.options);
      },
    });
  }

  get [BaseGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup({
      promptSamplesFolder,
    });
  }

  get [BaseGenerator.WRITING]() {
    return this.asEndTaskGroup({
      async generateCodeWorkspace() {
        this.addSampleToCodeWorkspace(this.sampleName);
      },
    });
  }

  getCodeWorkspacePath() {
    return join(this._globalConfig.get(samplesFolderConfig) ?? defaultSamplesFolder, 'jhipster-samples.code-workspace');
  }

  /**
   * Merge value to an existing JSON and write to destination
   */
  addSampleToCodeWorkspace(sampleName) {
    this.editFile(this.getCodeWorkspacePath(), { create: true }, content => {
      const data = content ? JSON.parse(content) : {};
      merge(data, {
        folders: [
          {
            path: getPackageRoot(),
          },
        ],
        settings: {
          'debug.javascript.terminalOptions': {
            skipFiles: ['node_modules/**', 'dist/**'],
          },
        },
        launch: {
          version: '0.2.0',
          inputs: [],
          configurations: [],
        },
      });
      if (this.sampleName && !data.folders.find(folder => folder.path === sampleName)) {
        data.folders.push({
          path: this.sampleName,
        });
      }

      return JSON.stringify(data, null, 2);
    });
  }
}
