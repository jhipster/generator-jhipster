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

const textToArray = text => {
  return text.split('\n');
};

const stringNullOrEmpty = str => {
  return str === null || str === undefined || str.trim() === '';
};

const isSimpleText = (previousLine, text) => {
  return !previousLine.endsWith('>') && !text.startsWith('<');
};

const htmlEncode = text => {
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
 * @private
 * Strip margin indicated by pipe `|` from a string literal
 *
 *  @param {string} content - the string to process
 */
const stripMargin = content => {
  return content.replace(/^[ ]*\|/gm, '');
};

export { textToArray, stringNullOrEmpty, isSimpleText, htmlEncode, stripMargin };
