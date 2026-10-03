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

/**
 * The JDL language: lexing, parsing to an AST, and the semantic checks. The modules outside this directory import it
 * from here; the modules inside import each other directly.
 */
export { type JDLComment, type JDLParseResult, getCst, parse, parseJDL } from './api.ts';
export { createRuntime } from './runtime/create-runtime.ts';
export { default as performJDLPostParsingTasks } from './ast/post-parsing-tasks.ts';
export { errorLocation } from './ast/location.ts';
export * from './runtime/relationship-types.ts';
export { JDL_RELATIONSHIP_BUILT_IN_ENTITY } from './runtime/relationship-options.ts';
export { checkSemantics } from './semantic/index.ts';
export type { JDLDiagnostic, JDLSemanticRule } from './semantic/types.ts';
export { type JDLApplicationStatement, type JDLStatement, getStatements } from './ast/statements.ts';
export type { JDLJSONApplicationConfiguration } from './types/json.ts';
export type * from './types/parsed.ts';
export type * from './types/parsing.ts';
export type * from './types/runtime.ts';
