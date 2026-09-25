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
import type { JDLLocation, ParsedJDLApplications } from '../types/parsed.ts';
import type { JDLRuntime } from '../types/runtime.ts';

/** A problem a semantic rule finds in the parsed jdl, where it is written. */
export type JDLDiagnostic = {
  /** The rule that reports it. */
  ruleId: string;
  severity: 'error' | 'warning';
  message: string;
  location?: JDLLocation;
};

/** A check over the whole parsed jdl, reporting every problem it finds rather than the first one. */
export type JDLSemanticRule = {
  id: string;
  check: (ast: ParsedJDLApplications, runtime: JDLRuntime) => Omit<JDLDiagnostic, 'ruleId' | 'severity'>[];
};
