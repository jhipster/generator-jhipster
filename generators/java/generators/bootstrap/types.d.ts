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
import type { HandleCommandTypes } from '../../../../lib/command/types.ts';
import type {
  Application as BaseApplicationApplication,
  Config as BaseApplicationConfig,
  Entity as BaseApplicationEntity,
  Options as BaseApplicationOptions,
  Source as BaseApplicationSource,
} from '../../../base-application/types.ts';

import type command from './command.ts';

type Command = HandleCommandTypes<typeof command>;

export type Config = Command['Config'] & BaseApplicationConfig;

export type Options = Command['Options'] & BaseApplicationOptions;

export { BaseApplicationEntity as Entity, BaseApplicationSource as Source };

export type Application<E extends BaseApplicationEntity = BaseApplicationEntity> = Command['Application'] &
  BaseApplicationApplication<E> & {
    javaVersion: string;
    javaCompatibleVersions: string[];
    mainClass: string;

    packageFolder: string;
    entityPackages: string[];

    srcMainJava: string;
    srcMainResources: string;
    srcMainWebapp: string;
    srcTestJava: string;
    srcTestResources: string;
    srcTestJavascript: string;

    javaPackageSrcDir: string;
    javaPackageTestDir: string;

    temporaryDir: string;

    /** Java dependency versions */
    javaDependencies: Record<string, string>;
    /** Known properties that can be used */
    javaProperties: Record<string, string | null>;
    /** Known managed properties that can be used */
    javaManagedProperties: Record<string, string | null>;
    /** Pre-defined package JavaDocs */
    packageInfoJavadocs: { packageName: string; documentation: string }[];
  };
