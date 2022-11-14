import _ from 'lodash';

const indent = (indentSize = 0) => {
  return _.repeat(' ', indentSize);
};

const removeDoubleQuotes = text => {
  if (text.includes('"')) {
    return text.replace(/"/g, '\\"');
  }
  return text;
};

const stringNullOrEmpty = str => {
  return str === null || str === undefined || str.trim() === '';
};

const isSimpleText = text => {
  return !text.startsWith('<') && !text.endsWith('>');
};

const textToArray = text => {
  return text.split('\n');
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
      if (isSimpleText(rows[i])) {
        description += ' ';
      }
      description += removeDoubleQuotes(rows[i]);
    }
  }
  return description;
};

export { getJavadoc, getApiDescription };
