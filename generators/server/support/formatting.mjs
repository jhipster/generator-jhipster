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
import _ from 'lodash';
import { stringNullOrEmpty, textToArray, isSimpleText } from '../../base/support/index.mjs';

const indent = (indentSize = 0) => {
  return _.repeat(' ', indentSize);
};

const removeDoubleQuotes = text => {
  if (text.includes('"')) {
    return text.replace(/"/g, '\\"');
  }
  return text;
};

/**
 * Convert passed block of string to javadoc formatted string.
 *
 * @param {string} text text to convert to javadoc format
 * @param {number} indentSize indent size (default 0)
 * @returns javadoc formatted string
 */
const getJavadoc = (text, indentSize = 0) => {
  if (!text) {
    text = '';
  }
  text = removeDoubleQuotes(text);
  const rows = textToArray(text);
  let javadoc = `${indent(indentSize)}/**\n`;
  for (let i = 0; i < rows.length; i++) {
    javadoc += `${indent(indentSize)} * ${rows[i]}\n`;
  }
  javadoc += `${indent(indentSize)} */`;
  return javadoc;
};

const getApiDescription = text => {
  if (!text) {
    return text;
  }
  const rows = textToArray(text);
  let description = removeDoubleQuotes(rows[0]);
  for (let i = 1; i < rows.length; i++) {
    // discard empty rows
    if (!stringNullOrEmpty(rows[i])) {
      // if simple text then put space between row strings
      if (isSimpleText(description, rows[i])) {
        description += ' ';
      }
      description += removeDoubleQuotes(rows[i]);
    }
  }
  return description;
};

export { getJavadoc, getApiDescription };
