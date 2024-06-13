import { existsSync, appendFileSync } from 'node:fs';
import os from 'node:os';
import BaseGenerator from 'generator-jhipster/generators/base';
import { setGithubTaskOutput } from 'generator-jhipster/testing';
import { buildMatrix } from './build-matrix.mjs';

export default class extends BaseGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, jhipsterBootstrap: false });
  }

  get [BaseGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async buildMatrix() {
        const matrix = await buildMatrix(this.templatePath('../../generate-sample/templates/samples'));
        setGithubTaskOutput('matrix', matrix);
      },
    });
  }
}
