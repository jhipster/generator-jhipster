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
/* eslint-disable no-console */

import path from 'path';
import ejs from 'ejs';
import _ from 'lodash';
import os from 'os';

/**
 * Rewrite file with passed arguments
 * @param {object} args argument object (containing path, file, haystack, etc properties)
 * @param {object} generator reference to the generator
 */
export function rewriteFile(args, generator) {
  const { path: rewritePath, file } = args;
  let fullPath;
  if (rewritePath) {
    fullPath = generator.destinationPath(path.join(rewritePath, file));
  } else {
    fullPath = generator.destinationPath(file);
  }
  if (!generator.env.sharedFs.existsInMemory(fullPath) && generator.env.sharedFs.existsInMemory(`${fullPath}.jhi`)) {
    fullPath = `${fullPath}.jhi`;
  }

  args.haystack = generator.fs.read(fullPath);
  const body = rewrite(args);
  generator.fs.write(fullPath, body);
  return args.haystack !== body;
}

/**
 * Replace content
 * @param {object} args argument object
 * @param {object} generator reference to the generator
 */
export function replaceContent(args, generator) {
  let fullPath = generator.destinationPath(args.file);
  if (!generator.env.sharedFs.existsInMemory(fullPath) && generator.env.sharedFs.existsInMemory(`${fullPath}.jhi`)) {
    fullPath = `${fullPath}.jhi`;
  }

  const re = args.regex ? new RegExp(args.pattern, 'g') : args.pattern;

  const currentBody = generator.fs.read(fullPath);
  const newBody = currentBody.replace(re, args.content);
  generator.fs.write(fullPath, newBody);
  return newBody !== currentBody;
}

/**
 * Escape regular expressions.
 *
 * @param {string} str string
 * @returns {string} string with regular expressions escaped
 */
export function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'); // eslint-disable-line
}

/**
 * Normalize line endings.
 * If in Windows is Git autocrlf used then need to replace \r\n with \n
 * to achieve consistent comparison result when comparing strings read from file.
 *
 * @param {string} str string
 * @returns {string} string where CRLF is replaced with LF in Windows
 */
export function normalizeWindowsLineEndings(str) {
  const isWin32 = os.platform() === 'win32';
  return isWin32 ? str.replace(/\r\n/g, '\n') : str;
}

/**
 * Change spaces sequences and '>' to allow any number of spaces or new line prefix
 *
 * @param {string} str string
 * @returns {string} string where CRLF is replaced with LF in Windows
 */
export function convertToPrettierExpressions(str) {
  return str.replace(/\s+/g, '([\\s\n]*)').replace(/>+/g, '(\n?[\\s]*)>');
}

/**
 * Rewrite using the passed argument object.
 *
 * @param {object} args arguments object (containing splicable, haystack, needle properties) to be used
 * @param {string[]} args.splicable       - content to be added.
 * @param {boolean} [args.prettierAware]  - apply prettier aware expressions before looking for applied needles.
 * @param {string|RegExp} [args.regexp]   - use another content to looking for applied needles.
 * @param {string} [args.haystack]        - file content
 * @param {string} [args.needle]          - needle to be looked for
 * @param {string} [args.file]            - file path for logging purposes
 * @returns {string} re-written content
 */
export function rewrite(args) {
  // check if splicable is already in the body text
  let re;
  if (args.regexp) {
    re = args.regexp;
    if (!re.test) {
      re = escapeRegExp(re);
    }
  } else {
    re = args.splicable.map(line => `\\s*${escapeRegExp(normalizeWindowsLineEndings(line))}`).join('\n');
  }
  if (!re.test) {
    if (args.prettierAware) {
      re = convertToPrettierExpressions(re);
    }
    re = new RegExp(re);
  }

  if (re.test(normalizeWindowsLineEndings(args.haystack))) {
    return args.haystack;
  }

  const lines = args.haystack.split('\n');

  let otherwiseLineIndex = -1;
  lines.forEach((line, i) => {
    if (line.includes(args.needle)) {
      otherwiseLineIndex = i;
    }
  });

  if (otherwiseLineIndex === -1) {
    console.warn(`Needle ${args.needle} not found at file ${args.file}`);
    return args.haystack;
  }

  let spaces = 0;
  while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
    spaces += 1;
  }

  let spaceStr = '';

  // eslint-disable-next-line no-cond-assign
  while ((spaces -= 1) >= 0) {
    spaceStr += ' ';
  }

  lines.splice(otherwiseLineIndex, 0, args.splicable.map(line => spaceStr + line).join('\n'));

  return lines.join('\n');
}

/**
 *
 * @param obj object to find in
 * @param path path to traverse
 * @param placeholder placeholder
 */
export function deepFind(obj, path, placeholder) {
  const paths = path.split('.');
  let current = obj;
  if (placeholder) {
    // dirty fix for placeholders, the json files needs to be corrected
    paths[paths.length - 2] = `${paths[paths.length - 2]}.${paths[paths.length - 1]}`;
    paths.pop();
  }
  for (let i = 0; i < paths.length; ++i) {
    if (current[paths[i]] === undefined) {
      return undefined;
    }
    current = current[paths[i]];
  }
  return current;
}

/**
 * Convert passed block of string to javadoc formatted string.
 *
 * @param {string} text text to convert to javadoc format
 * @param {number} indentSize indent size (default 0)
 * @returns javadoc formatted string
 */
export function getJavadoc(text, indentSize = 0) {
  if (!text) {
    text = '';
  }
  if (text.includes('"')) {
    text = text.replace(/"/g, '\\"');
  }
  let javadoc = `${_.repeat(' ', indentSize)}/**`;
  const rows = text.split('\n');
  for (let i = 0; i < rows.length; i++) {
    javadoc = `${javadoc}\n${_.repeat(' ', indentSize)} * ${rows[i]}`;
  }
  javadoc = `${javadoc}\n${_.repeat(' ', indentSize)} */`;
  return javadoc;
}

/**
 * Build an enum object
 * @param {Object} field - entity field
 * @param {String} clientRootFolder - the client's root folder
 * @return {Object} the enum info.
 */
export function getEnumInfo(field, clientRootFolder) {
  const fieldType = field.fieldType;
  // Todo: check if the next line does a side-effect and refactor it.
  field.enumInstance = _.lowerFirst(fieldType);
  const enums = field.fieldValues.split(',').map(fieldValue => fieldValue.trim());
  const customValuesState = getCustomValuesState(enums);
  return {
    enumName: fieldType,
    javadoc: field.fieldTypeJavadoc && getJavadoc(field.fieldTypeJavadoc),
    enumInstance: field.enumInstance,
    enums,
    ...customValuesState,
    enumValues: getEnums(enums, customValuesState, field.fieldValuesJavadocs),
    clientRootFolder: clientRootFolder ? `${clientRootFolder}-` : '',
  };
}

/**
 * @Deprecated
 * Build an enum object, deprecated use getEnumInfoInstead
 * @param {any} field : entity field
 * @param {string} frontendAppName
 * @param {string} packageName
 * @param {string} clientRootFolder
 */
export function buildEnumInfo(field, frontendAppName, packageName, clientRootFolder) {
  const fieldType = field.fieldType;
  field.enumInstance = _.lowerFirst(fieldType);
  const enums = field.fieldValues.replace(/\s/g, '').split(',');
  const enumsWithCustomValue = getEnumsWithCustomValue(enums);
  return {
    enumName: fieldType,
    enumValues: field.fieldValues.split(',').join(', '),
    enumInstance: field.enumInstance,
    enums,
    enumsWithCustomValue,
    frontendAppName,
    packageName,
    clientRootFolder: clientRootFolder ? `${clientRootFolder}-` : '',
  };
}

/**
 * @deprecated
 * private function to remove for jhipster v7
 * @param enums
 * @return {*}
 */
export function getEnumsWithCustomValue(enums) {
  return enums.reduce((enumsWithCustomValueArray, currentEnumValue) => {
    if (doesTheEnumValueHaveACustomValue(currentEnumValue)) {
      const matches = /([A-Z\-_]+)(\((.+?)\))?/.exec(currentEnumValue);
      const enumValueName = matches[1];
      const enumValueCustomValue = matches[3];
      enumsWithCustomValueArray.push({ name: enumValueName, value: enumValueCustomValue });
    } else {
      enumsWithCustomValueArray.push({ name: currentEnumValue, value: false });
    }
    return enumsWithCustomValueArray;
  }, []);
}

export function getCustomValuesState(enumValues) {
  const state = {
    withoutCustomValue: 0,
    withCustomValue: 0,
  };
  enumValues.forEach(enumValue => {
    if (doesTheEnumValueHaveACustomValue(enumValue)) {
      state.withCustomValue++;
    } else {
      state.withoutCustomValue++;
    }
  });
  return {
    withoutCustomValues: state.withCustomValue === 0,
    withSomeCustomValues: state.withCustomValue !== 0 && state.withoutCustomValue !== 0,
    withCustomValues: state.withoutCustomValue === 0,
  };
}

export function getEnums(enums, customValuesState, comments) {
  if (customValuesState.withoutCustomValues) {
    return enums.map(enumValue => ({
      name: enumValue,
      value: enumValue,
      comment: comments && comments[enumValue] && getJavadoc(comments[enumValue], 4),
    }));
  }
  return enums.map(enumValue => {
    if (!doesTheEnumValueHaveACustomValue(enumValue)) {
      return {
        name: enumValue.trim(),
        value: enumValue.trim(),
        comment: comments && comments[enumValue] && getJavadoc(comments[enumValue], 4),
      };
    }
    // eslint-disable-next-line no-unused-vars
    const matched = /\s*(.+?)\s*\((.+?)\)/.exec(enumValue);
    return {
      name: matched[1],
      value: matched[2],
      comment: comments && comments[matched[1]] && getJavadoc(comments[matched[1]], 4),
    };
  });
}

export function doesTheEnumValueHaveACustomValue(enumValue) {
  return enumValue.includes('(');
}

/**
 * Checks if string is already in file
 * @param {string} path file path
 * @param {string} search search string
 * @param {object} generator reference to generator
 * @returns {boolean} true if string is in file, false otherwise
 */
export function checkStringInFile(path, search, generator) {
  const fileContent = generator.fs.read(generator.destinationPath(path));
  return fileContent.includes(search);
}

/**
 * Checks if regex is found in file
 * @param {string} path file path
 * @param {regex} regex regular expression
 * @param {object} generator reference to generator
 * @returns {boolean} true if regex is matched in file, false otherwise
 */
export function checkRegexInFile(path, regex, generator) {
  const fileContent = generator.fs.read(generator.destinationPath(path));
  return fileContent.match(regex);
}

/**
 * Remove 'generator-' prefix from generators for compatibility with yeoman namespaces.
 * @param {string} packageName - name of the blueprint's package name
 * @returns {string} namespace of the blueprint
 */
export function packageNameToNamespace(packageName) {
  return packageName.replace('generator-', '');
}

/**
 * Calculate a hash code for a given string.
 * @param {string} str - any string
 * @returns {number} returns the calculated hash code.
 */
export function stringHashCode(str) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const character = str.charCodeAt(i);
    hash = (hash << 5) - hash + character; // eslint-disable-line no-bitwise
    hash |= 0; // eslint-disable-line no-bitwise
  }

  if (hash < 0) {
    hash *= -1;
  }
  return hash;
}

export function vueAddPageToRouterImport(generator, { clientSrcDir, pageName, pageFolderName, pageFilename = pageFolderName }) {
  rewriteFile(
    {
      file: `${clientSrcDir}/app/router/pages.ts`,
      needle: 'jhipster-needle-add-entity-to-router-import',
      splicable: [
        generator.stripMargin(
          // prettier-ignore
          `|// prettier-ignore
                |const ${pageName} = () => import('@/pages/${pageFolderName}/${pageFilename}.vue');`
        ),
      ],
    },
    generator
  );
}

export function vueAddPageToRouter(generator, { clientSrcDir, pageName, pageFilename }) {
  rewriteFile(
    {
      file: `${clientSrcDir}/app/router/pages.ts`,
      needle: 'jhipster-needle-add-entity-to-router',
      splicable: [
        generator.stripMargin(
          // prettier-ignore
          `|{
                    |    path: '/pages/${pageFilename}',
                    |    name: '${pageName}',
                    |    component: ${pageName},
                    |    meta: { authorities: [Authority.USER] }
                    |  },`
        ),
      ],
    },
    generator
  );
}

export function vueAddPageServiceToMainImport(generator, { clientSrcDir, pageName, pageFolderName, pageFilename = pageFolderName }) {
  rewriteFile(
    {
      file: `${clientSrcDir}/app/main.ts`,
      needle: 'jhipster-needle-add-entity-service-to-main-import',
      splicable: [
        generator.stripMargin(
          // prettier-ignore
          `|import ${pageName}Service from '@/pages/${pageFolderName}/${pageFilename}.service';`
        ),
      ],
    },
    generator
  );
}

export function vueAddPageServiceToMain(generator, { clientSrcDir, pageName, pageInstance }) {
  rewriteFile(
    {
      file: `${clientSrcDir}/app/main.ts`,
      needle: 'jhipster-needle-add-entity-service-to-main',
      splicable: [
        generator.stripMargin(
          // prettier-ignore
          `|${pageInstance}Service: () => new ${pageName}Service(),`
        ),
      ],
    },
    generator
  );
}
