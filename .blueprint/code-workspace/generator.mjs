import { join } from 'path';
import { merge } from 'lodash-es';
import BaseGenerator from '../../generators/base/index.js';
import { getPackageRoot } from '../../lib/index.js';
import { defaultSamplesFolder, promptSamplesFolder, samplesFolderConfig } from '../support.mjs';

export default class extends BaseGenerator {
  samplePath;

  constructor(args, options, features) {
    super(args, options, { queueCommandTasks: true, ...features });
  }

  get [BaseGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup({
      promptSamplesFolder,
    });
  }

  get [BaseGenerator.WRITING]() {
    return this.asEndTaskGroup({
      async generateCodeWorkspace() {
        this.addSampleToCodeWorkspace(this.samplePath);
      },
    });
  }

  getCodeWorkspacePath() {
    return join(this._globalConfig.get(samplesFolderConfig) ?? defaultSamplesFolder, 'jhipster-samples.code-workspace');
  }

  /**
   * Merge value to an existing JSON and write to destination
   */
  addSampleToCodeWorkspace(samplePath) {
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
      if (samplePath && !data.folders.find(folder => folder.path === samplePath)) {
        data.folders.push({
          path: samplePath,
        });
      }

      return JSON.stringify(data, null, 2);
    });
  }
}
