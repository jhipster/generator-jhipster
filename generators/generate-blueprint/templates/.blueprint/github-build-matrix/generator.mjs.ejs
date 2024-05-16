import { existsSync, appendFileSync } from 'node:fs';
import os from 'node:os';
import BaseGenerator from 'generator-jhipster/generators/base';
import { buildMatrix } from './build-matrix.mjs';

export default class extends BaseGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, jhipsterBootstrap: false });
  }

  get [BaseGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async buildMatrix() {
        const matrix = await buildMatrix(this.templatePath('../../generate-sample/templates/samples'));
        const matrixoutput = `matrix<<EOF${os.EOL}${JSON.stringify(matrix)}${os.EOL}EOF${os.EOL}`;
        const filePath = process.env['GITHUB_OUTPUT'];
        console.log(matrixoutput);
        if (filePath && existsSync(filePath)) {
          appendFileSync(filePath, matrixoutput, { encoding: 'utf8' });
        }
      },
    });
  }
}
