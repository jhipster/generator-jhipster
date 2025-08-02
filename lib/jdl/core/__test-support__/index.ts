import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import { getDefaultJDLApplicationConfig, getDefaultRuntime } from '../../../jdl-config/jhipster-jdl-config.ts';
import type { JHipsterYoRcContentAndJDLWrapper } from '../../converters/json-to-jdl-application-converter.js';
import { convertApplicationsToJDL as originalConvertApplicationsToJDL } from '../../converters/json-to-jdl-application-converter.ts';
import { convertApplications as originalConvertApplications } from '../../converters/parsed-jdl-to-jdl-object/application-converter.ts';
import { parseFromConfigurationObject as originalParseFromConfigurationObject } from '../../converters/parsed-jdl-to-jdl-object/parsed-jdl-to-jdl-object-converter.ts';
import {
  createImporterFromContent as originalCreateImporterFromContent,
  createImporterFromFiles as originalCreateImporterFromFiles,
} from '../../jdl-importer.ts';
import { createJDLLinterFromContent as originalCreateJDLLinterFromContent } from '../linters/jdl-linter.ts';
import { createJDLApplication as originalCreateJDLApplication } from '../models/jdl-application-factory.ts';
import { parseFromContent as originalParseFromContent, parseFromFiles as originalParseFromFiles } from '../readers/jdl-reader.ts';
import type { ParsedJDLApplication, ParsedJDLRoot } from '../types/parsed.js';
import type { JDLRuntime } from '../types/runtime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export const getTestFile = (...args: string[]) => path.join(__dirname, 'files', ...args);
