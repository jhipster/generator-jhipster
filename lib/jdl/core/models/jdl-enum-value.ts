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
 * Matches the lexer's NAME token (see parsing/lexer/shared-tokens.ts). An enum value is only safe to
 * emit bare when it matches this; anything else has to be quoted so the export re-parses as itself.
 */
const NAME_PATTERN = /^[a-zA-Z_][a-zA-Z_\-\d]*$/;

/**
 * Renders an enum value for JDL output.
 *
 * The grammar accepts either a bare NAME or a quoted STRING inside the parentheses
 * (see `enumProp` in parsing/jdl-parser.ts). Emitting a value that is neither produces JDL that
 * re-parses as something other than what was exported — for `A("x), B(y")` the closing paren and
 * comma are read as grammar, so one value silently becomes two enum entries.
 */
function stringifyEnumValue(value: string): string {
  if (NAME_PATTERN.test(value)) {
    return value;
  }
  if (value.includes('"')) {
    // The STRING token is /"(?:[^"])*"/ — a plain literal with no escape sequence — so a value
    // containing a double quote has no JDL representation at all. Failing loudly beats emitting
    // JDL that silently parses back as different content.
    throw new Error(`The enum value '${value}' contains a double quote, which JDL cannot represent.`);
  }
  return `"${value}"`;
}

export default class JDLEnumValue {
  name: string;
  value?: string;
  comment?: string;

  constructor(name: string, value?: string, comment?: string) {
    if (!name) {
      throw new Error('The enum value name has to be passed to create an enum.');
    }
    this.name = name;
    this.value = value;
    this.comment = comment;
  }

  toString() {
    const value = this.value ? ` (${stringifyEnumValue(this.value)})` : '';
    return `${this.name}${value}`;
  }
}
