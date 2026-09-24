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
import type { ParsedJDLApplications } from '../types/parsed.ts';
import type { JDLRuntime } from '../types/runtime.ts';

import type { JDLDiagnostic, JDLSemanticRule } from './types.ts';

export type { JDLDiagnostic, JDLSemanticRule } from './types.ts';

/**
 * Checks the parsed jdl against the semantic rules: what the grammar cannot tell, an entity that is used but not declared
 * for instance. Every problem is reported, in source order. The rules are the runtime's: the ones of the jdl, then the ones
 * of the tool its definitions bring.
 */
export function checkSemantics(
  ast: ParsedJDLApplications,
  runtime: JDLRuntime,
  rules: readonly JDLSemanticRule[] = runtime.semanticRules,
): JDLDiagnostic[] {
  return rules
    .flatMap(rule => rule.check(ast, runtime).map(diagnostic => ({ ruleId: rule.id, severity: 'error' as const, ...diagnostic })))
    .sort((a, b) => (a.location?.startOffset ?? Infinity) - (b.location?.startOffset ?? Infinity));
}
