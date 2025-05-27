import { join } from 'path';
import { merge } from 'lodash-es';
import BaseGenerator from '../../generators/base/index.js';
import { getPackageRoot } from '../../lib/index.js';
import { defaultSamplesFolder, promptSamplesFolder, samplesFolderConfig } from '../support.mjs';
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
  BaseApplicationSources,
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
  Application extends BaseApplicationApplication = ApplicationType,
  Sources extends BaseApplicationSources<Field, PK, Relationship, Entity, Application> = DeprecatedBaseApplicationSource<
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
  samplePath;

  get [BaseGenerator.PROMPTING]() {
    return this.asAnyTaskGroup({
      promptSamplesFolder,
    });
  }

  get [BaseGenerator.WRITING]() {
    return this.asAnyTaskGroup({
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
