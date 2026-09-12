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

export const JDL_STRING_PATTERN = /"(?:[^"\\]|\\[\s\S])*"/;

const escapedCharacters: Record<string, string> = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
};

export function parseJDLString(literal: string): string {
  // Preserve unknown escape sequences used by existing JDL, such as \d in regular expressions.
  return literal
    .slice(1, -1)
    .replace(/\\(["\\/bfnrt]|u[\dA-Fa-f]{4})/g, (_match, escaped: string) =>
      escaped.startsWith('u') ? String.fromCharCode(Number.parseInt(escaped.slice(1), 16)) : escapedCharacters[escaped],
    );
}
