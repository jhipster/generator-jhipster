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
  BaseApplicationSources,
} from '../../generators/base-application/types.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType, DeprecatedBaseApplicationSource } from '../../lib/types/application/application.js';
import type { TemporaryControlToMoveToDownstream } from '../../generators/base/types.js';
import type { TaskTypes as DefaultTaskTypes } from '../../generators/base-application/tasks.js';
import type BaseApplicationSharedData from '../../generators/base-application/shared-data.js';
import type { ApplicationConfiguration } from '../../lib/types/application/yo-rc.js';

export default class<
  // FIXME For the ones that are trying to fix the types, remove the equals and look at the consequences
  Options extends BaseApplicationOptions = JHipsterGeneratorOptions,
  Field extends BaseApplicationField = DeprecatedField,
  PK extends BaseApplicationPrimaryKey<Field> = DeprecatedPrimarykey<Field>,
  Relationship extends BaseApplicationRelationship<any> = DeprecatedRelationship<any>,
  // @ts-ignore
  Entity extends BaseApplicationEntity<Field, PK, Relationship> = DeprecatedEntity<Field, PK, Relationship>,
  Application extends BaseApplicationApplication<Field, PK, Relationship, Entity> = ApplicationType,
  Sources extends DeprecatedBaseApplicationSource<Field, Relationship, Application> = DeprecatedBaseApplicationSource<
    Field,
    Relationship,
    Application
  >,
  Control extends BaseApplicationControl = TemporaryControlToMoveToDownstream,
  TaskTypes extends DefaultTaskTypes<Field, PK, Relationship, Entity, Application, Sources, Control> = DefaultTaskTypes<
    Field,
    PK,
    Relationship,
    Entity,
    Application,
    Sources,
    Control
  >,
  SharedData extends BaseApplicationSharedData<Field, PK, Relationship, Entity, Application, Sources, Control> = BaseApplicationSharedData<
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
> extends BaseGenerator<Options, Entity, Application, Sources, Control, TaskTypes, SharedData, Configuration, Features> {
  generatorNamespace;

  constructor(args, options, features) {
    super(args, options, { queueCommandTasks: true, ...features });
  }

  get [BaseGenerator.WRITING]() {
    return this.asWritingTaskGroup({
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
