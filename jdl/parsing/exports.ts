/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
 * This file defines the exported JDL DSL related APIs
 * This file will be used as webpack entry point to produce a UMD bundle.
 */
import { tokens, JDLLexer } from './lexer/lexer.js';
import { parse, getSyntacticAutoCompleteSuggestions } from './api.js';
import JDLParser from './jdl-parser.js';

export { tokens, JDLLexer, JDLParser, parse, getSyntacticAutoCompleteSuggestions };
