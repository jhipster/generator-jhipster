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
import { formatDocAsSingleLine } from '../../base-application/support/doc.ts';

const escapeDoubleQuotes = (text: string): string => {
  if (text.includes('"')) {
    return text.replace(/"/g, String.raw`\"`);
  }
  return text;
};

/**
 * Convert passed block of string to javadoc formatted string.
 *
 * @param text text to convert to javadoc format
 * @param indentSize indent size (default 0)
 * @returns javadoc formatted string
 */
export const formatDocAsJavaDoc = (text: string, indentSize = 0): string => {
  if (indentSize < 0) {
    indentSize = 0;
  }
  if (!text) {
    text = '';
  }
  text = escapeDoubleQuotes(text);
  const indent = ' '.repeat(indentSize);
  const rows = ['/**', ...text.split(String.raw`\n`).map(row => ` * ${row}`), ' */'].map(row => `${indent}${row}`);
  return rows.join('\n');
};

export const formatDocAsApiDescription = (text?: string): string | undefined => {
  if (!text) {
    return text;
  }

  return escapeDoubleQuotes(formatDocAsSingleLine(text));
};
