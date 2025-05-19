import { camelCase, upperFirst } from 'lodash-es';
import BaseGenerator from '../../generators/base/index.js';
import type {
  BaseApplicationConfiguration,
  BaseApplicationFeatures,
  BaseApplicationOptions,
} from '../../generators/base-application/api.js';
import type { JHipsterGeneratorOptions } from '../../lib/types/application/options.js';
import type {
  BaseApplicationApplication,
  BaseApplicationControl,
  BaseApplicationEntity,
  BaseApplicationField,
  BaseApplicationPrimaryKey,
  BaseApplicationRelationship,
} from '../../generators/base-application/types.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType, DeprecatedBaseApplicationSource } from '../../lib/types/application/application.js';
import type { TaskTypes as DefaultTaskTypes } from '../../generators/base-application/tasks.js';
import type { ApplicationConfiguration } from '../../lib/types/application/yo-rc.js';
import { DeprecatedControl } from '../../lib/types/application/control.js';

export default class<
  // FIXME For the ones that are trying to fix the types, remove the equals and look at the consequences
  Options extends BaseApplicationOptions = JHipsterGeneratorOptions,
  Field extends DeprecatedField = DeprecatedField,
  PK extends DeprecatedPrimarykey<Field> = DeprecatedPrimarykey<Field>,
  Relationship extends DeprecatedRelationship<any> = DeprecatedRelationship<any>,
  Entity extends BaseApplicationEntity<Field, PK, Relationship> = DeprecatedEntity<Field, PK, Relationship>,
  Application extends BaseApplicationApplication<Field, PK, Relationship, Entity> = ApplicationType,
  Sources extends DeprecatedBaseApplicationSource<Field, Relationship, Application> = DeprecatedBaseApplicationSource<
    Field,
    Relationship,
    Application
  >,
  Control extends BaseApplicationControl = DeprecatedControl,
  TaskTypes extends DefaultTaskTypes<Field, PK, Relationship, Entity, Application, Sources, Control> = DefaultTaskTypes<
    Field,
    PK,
    Relationship,
    Entity,
    Application,
    Sources,
    Control
  >,
  Configuration extends BaseApplicationConfiguration = ApplicationConfiguration,
  Features extends BaseApplicationFeatures = BaseApplicationFeatures,
> extends BaseGenerator<Options, Entity, Application, Sources, Control, TaskTypes, Configuration, Features> {
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
