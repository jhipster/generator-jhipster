import { join } from 'path';
import BaseGenerator from '../../generators/base/index.js';
import { getPackageRoot } from '../../lib/index.js';
import { getWorkflowSamples } from '../generate-sample/support/get-workflow-samples.js';
import type { JHipsterGeneratorOptions } from '../../lib/types/application/options.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType, DeprecatedBaseApplicationSource } from '../../lib/types/application/application.js';
import type { BaseApplicationControl } from '../../generators/base-application/types.js';
import type { TaskTypes as DefaultTaskTypes } from '../../generators/base-application/tasks.js';
import type { BaseApplicationConfiguration, BaseApplicationFeatures } from '../../generators/base-application/api.js';
import type { ApplicationConfiguration } from '../../lib/types/application/yo-rc.js';
import { DeprecatedControl } from '../../lib/types/application/control.js';

export default class<
  // FIXME For the ones that are trying to fix the types, remove the equals and look at the consequences
  Options extends JHipsterGeneratorOptions = JHipsterGeneratorOptions,
  Field extends DeprecatedField = DeprecatedField,
  PK extends DeprecatedPrimarykey<Field> = DeprecatedPrimarykey<Field>,
  Relationship extends DeprecatedRelationship<any> = DeprecatedRelationship<any>,
  Entity extends DeprecatedEntity<Field, PK, Relationship> = DeprecatedEntity<Field, PK, Relationship>,
  Application extends ApplicationType<Field, PK, Relationship> = ApplicationType<Field, PK, Relationship>,
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
  get [BaseGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async generateVscodeLaunch() {
        const vscodeLaunch = join(getPackageRoot(), '.vscode/launch.json');

        const baseFile: { version: string; inputs: any[]; configurations: any } = {
          version: '0.2.0',
          inputs: [],
          configurations: [
            {
              type: 'node',
              request: 'launch',
              internalConsoleOptions: 'neverOpen',
              name: 'update vscode launch.json',
              // eslint-disable-next-line no-template-curly-in-string
              program: '${workspaceFolder}/test-integration/scripts/99-update-vscode.js',
              console: 'integratedTerminal',
            },
          ],
        };

        const workflows = getWorkflowSamples();
        for (const [workflowName, samples] of Object.entries(workflows)) {
          baseFile.inputs.push({
            id: `${workflowName}Sample`,
            type: 'pickString',
            description: 'Sample to be generated',
            options: Object.keys(samples),
          });
          baseFile.configurations.push({
            type: 'node',
            request: 'launch',
            internalConsoleOptions: 'neverOpen',
            name: `generate sample from ${workflowName} workflow`,
            // eslint-disable-next-line no-template-curly-in-string
            program: '${workspaceFolder}/bin/jhipster.cjs',
            args: ['generate-sample', `\${input:${workflowName}Sample}`, '--global'],
            console: 'integratedTerminal',
          });
        }

        this.writeDestinationJSON(vscodeLaunch, baseFile);
      },
    });
  }
}
