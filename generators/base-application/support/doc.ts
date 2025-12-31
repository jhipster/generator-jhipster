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
 * Verifies is the text is wrapped between ><: used in Api docs and liquibase changelogs templates.
 * @param previousLine the previous line (potentially finishing with the wrapper character '>'
 * @param text the text to check, which should not begin with the closing wrapper character '<'
 * @return {boolean} true if the text is considered wrapped, false otherwise
 */
const isSimpleText = (previousLine: string, text: string) => !previousLine.endsWith('>') && !text.startsWith('<');

/**
 * Format As Liquibase Remarks
 */

export const formatDocAsSingleLine = (text: string): string => {
  let [description, ...rows] = text.split('\n');
  // discard blank rows
  rows = rows.map(row => row.trim()).filter(row => row);
  for (const row of rows) {
    // if simple text then put space between row strings
    if (isSimpleText(description, row)) {
      description += ' ';
    }
    description += row;
  }
  return description;
};
