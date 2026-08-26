/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import path from 'node:path';

import { getDefaultJDLApplicationConfig, getDefaultRuntime } from '../../../jdl-config/jhipster-jdl-config.ts';
import {
  type JHipsterYoRcContentAndJDLWrapper,
  convertApplicationsToJDL as originalConvertApplicationsToJDL,
} from '../../converters/json-to-jdl-application-converter.ts';
import { convertApplications as originalConvertApplications } from '../../converters/parsed-jdl-to-jdl-object/application-converter.ts';
import { parseFromConfigurationObject as originalParseFromConfigurationObject } from '../../converters/parsed-jdl-to-jdl-object/parsed-jdl-to-jdl-object-converter.ts';
import {
  createImporterFromContent as originalCreateImporterFromContent,
  createImporterFromFiles as originalCreateImporterFromFiles,
} from '../../jdl-importer.ts';
import { createJDLLinterFromContent as originalCreateJDLLinterFromContent } from '../linters/jdl-linter.ts';
import { createJDLApplication as originalCreateJDLApplication } from '../models/jdl-application-factory.ts';
import { parseFromContent as originalParseFromContent, parseFromFiles as originalParseFromFiles } from '../readers/jdl-reader.ts';
import type { ParsedJDLApplication, ParsedJDLRoot } from '../types/parsed.ts';
import type { JDLRuntime } from '../types/runtime.ts';

const runtime = getDefaultRuntime();

export const createImporterFromContent = (content: any, configuration?: any) =>
  originalCreateImporterFromContent(content, configuration, getDefaultJDLApplicationConfig());
export const createImporterFromFiles = (files: any, configuration?: any) =>
  originalCreateImporterFromFiles(files, configuration, getDefaultJDLApplicationConfig());

export const parseFromConfigurationObject = (configuration: ParsedJDLRoot) => originalParseFromConfigurationObject(configuration, runtime);
export const parseFromFiles = (files: string[]) => originalParseFromFiles(files, runtime);
export const parseFromContent = (content: string) => originalParseFromContent(content, runtime);

export const createJDLLinterFromContent = (content: string) => originalCreateJDLLinterFromContent(content, runtime);

export const convertApplications = (applications: ParsedJDLApplication[]) => originalConvertApplications(applications, runtime);
export const createJDLApplication = (config: any, runtime: JDLRuntime, namespaceConfigs?: Record<string, Record<string, any>>) =>
  originalCreateJDLApplication(config, runtime, namespaceConfigs);

export const convertApplicationsToJDL = (applications: JHipsterYoRcContentAndJDLWrapper) =>
  originalConvertApplicationsToJDL(applications, runtime);

export const getTestFile = (...args: string[]) => path.join(import.meta.dirname, 'files', ...args);
