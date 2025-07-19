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
import { formatDocAsSingleLine } from '../../base-application/support/doc.ts';

const htmlEncode = (text: string) => {
  let htmLifiedText = text;
  // escape & to &amp;
  htmLifiedText = htmLifiedText.replace(/&/g, '&amp;');
  // escape " to &quot;
  htmLifiedText = htmLifiedText.replace(/"/g, '&quot;');
  // escape ' to &apos;
  htmLifiedText = htmLifiedText.replace(/'/g, '&apos;');
  // escape < to &lt;
  htmLifiedText = htmLifiedText.replace(/</g, '&lt;');
  // escape > to &gt;
  htmLifiedText = htmLifiedText.replace(/>/g, '&gt;');
  return htmLifiedText;
};

/**
 * Format As Liquibase Remarks
 *
 * @param {string} text - text to format
 * @param {boolean} addRemarksTag - add remarks tag
 * @returns formatted liquibase remarks
 */
const formatAsLiquibaseRemarks = (text: string, addRemarksTag = false) => {
  if (!text) {
    return addRemarksTag ? '' : text;
  }

  const description = htmlEncode(formatDocAsSingleLine(text));
  return addRemarksTag ? ` remarks="${description}"` : description;
};

export default formatAsLiquibaseRemarks;
