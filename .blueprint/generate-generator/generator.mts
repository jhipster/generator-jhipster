import { camelCase, upperFirst } from 'lodash-es';
import BaseGenerator from '../../generators/base-core/index.js';

export default class extends BaseGenerator {
  generatorNamespace;

  get [BaseGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async writing() {
        const { generatorNamespace } = this;
        const namespaceParts = generatorNamespace.split('/');
        const devBlueprint = namespaceParts[0] === '@dev-blueprint';
        if (devBlueprint) {
          namespaceParts.shift();
        }
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
            generatorClass: upperFirst(camelCase([...namespaceParts].pop())),
            generatorPath: `${devBlueprint ? '.blueprint' : 'generators'}/${namespaceParts.join('/generators/')}`,
            generatorRelativePath: devBlueprint ? '../../generators/' : '../'.repeat((namespaceParts.length - 1) * 2 + 1),
          },
        });
      },
    });
  }
}
