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

import JDLObject from '../core/models/jdl-object.js';
import { createJDLApplication } from '../core/models/jdl-application-factory.js';
import type { JDLRuntime } from '../core/types/runtime.js';
import type { RawJDLJSONApplication } from '../core/types/exporter.js';
import type JDLApplication from '../core/models/jdl-application.ts';

const GENERATOR_NAME = 'generator-jhipster';

export type JHipsterYoRcContentAndJDLWrapper = {
  applications: RawJDLJSONApplication[];
  jdl?: JDLObject;
};

export function convertApplicationsToJDL({ applications, jdl }: JHipsterYoRcContentAndJDLWrapper, runtime: JDLRuntime) {
  jdl ??= new JDLObject();
  applications?.forEach((application: RawJDLJSONApplication) => {
    const convertedApplication = convertApplicationToJDL(application, runtime);
    jdl.addApplication(convertedApplication);
  });
  return jdl;
}

export function convertApplicationToJDL(application: RawJDLJSONApplication, runtime: JDLRuntime): JDLApplication {
  return createJDLApplication(application![GENERATOR_NAME], runtime);
}
