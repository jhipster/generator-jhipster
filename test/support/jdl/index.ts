import { getDefaultRuntime } from '../../../jdl/runtime';
import { parseFromContent as originalParseFromContent, parseFromFiles as originalParseFromFiles } from '../../../jdl/readers/jdl-reader.js';
import { parseFromConfigurationObject as originalParseFromConfigurationObject } from '../../../jdl/converters/parsed-jdl-to-jdl-object/parsed-jdl-to-jdl-object-converter.js';
import {
  createImporterFromContent as originalCreateImporterFromContent,
  createImporterFromFiles as originalCreateImporterFromFiles,
} from '../../../jdl/jdl-importer.js';
import type { ParsedJDLApplication, ParsedJDLRoot } from '../../../jdl/converters/parsed-jdl-to-jdl-object/types.js';
import definition from '../../../generators/app/jdl/index.js';
import {
  createJDLLinterFromContent as originalCreateJDLLinterFromContent,
  createJDLLinterFromFile as originalCreateJDLLinterFromFile,
} from '../../../jdl/linters/jdl-linter.js';
import { convertApplications as originalConvertApplications } from '../../../jdl/converters/parsed-jdl-to-jdl-object/application-converter.js';
import { createJDLApplication as originalCreateJDLApplication } from '../../../jdl/models/jdl-application-factory.js';

const runtime = getDefaultRuntime();

export const createImporterFromContent = (content: any, configuration?: any) =>
  originalCreateImporterFromContent(content, configuration, definition);
export const createImporterFromFiles = (files: any, configuration?: any) =>
  originalCreateImporterFromFiles(files, configuration, definition);

export const parseFromConfigurationObject = (configuration: ParsedJDLRoot) => originalParseFromConfigurationObject(configuration, runtime);
export const parseFromFiles = (files: string[]) => originalParseFromFiles(files, runtime);
export const parseFromContent = (content: string) => originalParseFromContent(content, runtime);

export const createJDLLinterFromContent = (content: string) => originalCreateJDLLinterFromContent(content, runtime);
export const createJDLLinterFromFile = (file: string) => originalCreateJDLLinterFromFile(file, runtime);

export const convertApplications = (applications: ParsedJDLApplication[]) => originalConvertApplications(applications, runtime);
export const createJDLApplication = (config: any, namespaceConfigs?: Record<string, Record<string, any>> | undefined) =>
  originalCreateJDLApplication(config, namespaceConfigs, runtime);
