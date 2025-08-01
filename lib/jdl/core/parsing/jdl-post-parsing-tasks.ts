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

import type { ParsedJDLApplication, ParsedJDLApplications } from '../types/parsed.js';

export default function performJDLPostParsingTasks(parsedContent: ParsedJDLApplications): ParsedJDLApplications {
  return resolveEntityNames(parsedContent);
}

function resolveEntityNames(parsedContent: ParsedJDLApplications): ParsedJDLApplications {
  parsedContent.applications = resolveEntityNamesForApplications(parsedContent);
  return parsedContent;
}

function resolveEntityNamesForApplications(parsedContent: ParsedJDLApplications): ParsedJDLApplication[] {
  const entityNames = parsedContent.entities.map(entity => entity.name);
  return parsedContent.applications.map(application => {
    application.entities = resolveApplicationEntityNames(application, entityNames);
    return application;
  });
}

function resolveApplicationEntityNames(application: ParsedJDLApplications['applications'][number], entityNames: string[]): string[] {
  const { entityList, excluded } = application.entitiesOptions!;
  let applicationEntityNames = new Set(entityList);
  if (entityList.includes('*')) {
    applicationEntityNames = new Set(entityNames);
  } else {
    checkEntityNamesInApplication(application.config.baseName, applicationEntityNames, entityNames);
  }
  excluded.forEach(excludedEntityName => {
    applicationEntityNames.delete(excludedEntityName);
  });
  return [...applicationEntityNames];
}

function checkEntityNamesInApplication(applicationName: string, entityNamesInApplication: Set<string>, entityNames: string[]) {
  const entityNameSet = new Set(entityNames);
  entityNamesInApplication.forEach(entityNameInApplication => {
    if (!entityNameSet.has(entityNameInApplication)) {
      throw new Error(`The entity ${entityNameInApplication} which is declared in ${applicationName}'s entity list doesn't exist.`);
    }
  });
}
