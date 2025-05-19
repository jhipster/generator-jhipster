/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import chalk from 'chalk';

import CoreGenerator from '../base-core/index.js';

import { convertToJDL } from '../../lib/jdl/converters/json-to-jdl-converter.js';
<<<<<<< HEAD
import { CommandCoreGenerator } from '../base-core/generator.js';
import type command from './command.js';
=======
import type { BaseApplicationConfiguration, BaseApplicationFeatures } from '../base-application/api.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { BaseApplicationEntity } from '../base-application/types.js';
import type { ApplicationType, DeprecatedBaseApplicationSource } from '../../lib/types/application/application.js';
import type { TemporaryControlToMoveToDownstream } from '../base/types.js';
import type BaseApplicationSharedData from '../base-application/shared-data.js';
import type { ApplicationConfiguration } from '../../lib/types/application/yo-rc.js';
import type { TaskTypes as DefaultTaskTypes } from '../base-application/tasks.js';
import type { JHipsterGeneratorOptions } from '../../lib/types/application/options.js';

const { OptionNames } = applicationOptions;

const { BASE_NAME } = OptionNames;

export default class<
  // FIXME For the ones that are trying to fix the types, remove the equals and look at the consequences
  Options extends JHipsterGeneratorOptions = JHipsterGeneratorOptions,
  Field extends DeprecatedField = DeprecatedField,
  PK extends DeprecatedPrimarykey<Field> = DeprecatedPrimarykey<Field>,
  Relationship extends DeprecatedRelationship<any> = DeprecatedRelationship<any>,
  Entity extends BaseApplicationEntity<Field, PK, Relationship> = DeprecatedEntity<Field, PK, Relationship>,
  Application extends ApplicationType<Field, PK, Relationship> = ApplicationType<Field, PK, Relationship>,
  Sources extends DeprecatedBaseApplicationSource<Field, Relationship, Application> = DeprecatedBaseApplicationSource<
    Field,
    Relationship,
    Application
  >,
  Control extends TemporaryControlToMoveToDownstream = TemporaryControlToMoveToDownstream,
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
  baseName!: string;
>>>>>>> 843e76094b (rework most of the type regressions)

export default class extends CommandCoreGenerator<typeof command> {
  jdlFile!: string;
  jdlContent?: string;

<<<<<<< HEAD
  get [CoreGenerator.DEFAULT]() {
    return this.asAnyTaskGroup({
=======
  constructor(args: string | string[], options: Options, features: Features) {
    super(args, options, { skipParseOptions: false, ...features });

    this.argument('jdlFile', { type: String, required: false });

    if (this.options.help) {
      return;
    }
    this.baseName = this.config.get(BASE_NAME);
    this.jdlFile = this.options.jdlFile || `${this.baseName}.jdl`;
  }

  get [BaseGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup({
>>>>>>> 843e76094b (rework most of the type regressions)
      convertToJDL() {
        try {
          const jdlObject = convertToJDL(this.destinationPath(), false, this.options.jdlDefinition);
          if (jdlObject) {
            this.jdlContent = jdlObject.toString();
          }
        } catch (error: unknown) {
          throw new Error(`An error occurred while exporting to JDL: ${(error as Error).message}\n${error}`, { cause: error });
        }
      },
    });
  }

  get [CoreGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      writeJdl() {
        if (this.jdlContent) {
          this.writeDestination(this.jdlFile, this.jdlContent);
        }
      },
    });
  }

  get [CoreGenerator.END]() {
    return this.asAnyTaskGroup({
      end() {
        this.log.log(chalk.green.bold('\nThe JDL export is complete!\n'));
      },
    });
  }
}
