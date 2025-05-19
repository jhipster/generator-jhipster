import { camelCase, upperFirst } from 'lodash-es';
import BaseGenerator from '../../generators/base-core/index.js';

export default class extends BaseGenerator {
  generatorNamespace;

  constructor(args, options, features) {
    super(args, options, { queueCommandTasks: true, ...features });
  }

  get [BaseGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async writing() {
        const { generatorNamespace } = this;
        const namespaceParts = generatorNamespace.split('/');
        await this.writeFiles({
          sections: {
            generatorFiles: [
              {
                renameTo: (data, filePath) => `${data.generatorPath}/${filePath}`,
                templates: ['command.ts', 'generator.spec.ts', 'generator.ts', 'index.ts'],
              },
            ],
          },
          context: {
            generatorNamespace,
            generatorClass: upperFirst(camelCase(generatorNamespace.split('/').pop())),
            generatorPath: `generators/${namespaceParts.join('/generators/')}`,
            generatorRelativePath: '../'.repeat((namespaceParts.length - 1) * 2 + 1),
          },
        });
      },
    });
  }
}
