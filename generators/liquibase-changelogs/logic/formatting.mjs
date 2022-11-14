/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import { stringNullOrEmpty, textToArray, isSimpleText, htmlEncode } from '../../base/logic/index.mjs';

/**
 * @private
 * Format As Liquibase Remarks
 *
 * @param {string} text - text to format
 * @param {boolean} addRemarksTag - add remarks tag
 * @returns formatted liquibase remarks
 */
const formatAsLiquibaseRemarks = (text, addRemarksTag = false) => {
  if (!text) {
    return addRemarksTag ? '' : text;
  }
  const rows = textToArray(text);
  let description = rows[0];
  for (let i = 1; i < rows.length; i++) {
    // discard empty rows
    if (!stringNullOrEmpty(rows[i])) {
      // if simple text then put space between row strings
      if (isSimpleText(description, rows[i])) {
        description += ' ';
      }
      description += rows[i];
    }
  }
  description = htmlEncode(description);
  return addRemarksTag ? ` remarks="${description}"` : description;
};

export default formatAsLiquibaseRemarks;
