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
import { dirname } from 'path';
import BaseCoreGenerator from '../../generators/base-core/index.js';
import { createNeedleCallback } from '../../generators/base/support/needles.js';
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
import type { DeprecatedControl } from '../../lib/types/application/control.js';
import BaseGenerator from '../../generators/base/index.js';

export default class UpdateGeneratorsGenerator<
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
  get [BaseCoreGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async writing() {
        const generators = Object.entries(this.env.getGeneratorsMeta()).filter(([key]) => key.startsWith('jhipster:'));
        this.editFile(
          'generators/types.ts',
          createNeedleCallback({
            needle: 'add-generator-by-namespace',
            contentToAdd: generators
              .map(([ns, meta]) => {
                const parts = ns.split(':').length;
                const relativePath = this.relativeDir(this.templatePath('../../../generators/'), dirname(meta.resolved!));
                const generateImport = (key: string) => `'${key}': import('./${relativePath}generator.js').default;`;
                return parts === 2 ? [generateImport(ns.replace('jhipster:', '')), generateImport(ns)] : [generateImport(ns)];
              })
              .flat(),
          }),
        );
      },
    });
  }
}
