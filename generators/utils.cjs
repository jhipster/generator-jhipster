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
/* eslint-disable no-console */

const path = require('path');
const ejs = require('ejs');
const _ = require('lodash');
const os = require('os');

const constants = require('./generator-constants.cjs');

module.exports = {
  rewrite,
  rewriteFile,
  replaceContent,
  deepFind,
  escapeRegExp,
  getDBTypeFromDBValue,
  checkStringInFile,
  checkRegexInFile,
  packageNameToNamespace,
  stringHashCode,
  vueAddPageToRouterImport,
  vueAddPageToRouter,
  vueAddPageServiceToMainImport,
  vueAddPageServiceToMain,
};

const databaseTypes = require('../jdl/jhipster/database-types');
const { stripMargin } = require('./base/logic/index.mjs');

const SQL = databaseTypes.SQL;

/**
 * Rewrite file with passed arguments
 * @param {object} args argument object (containing path, file, haystack, etc properties)
 * @param {object} generator reference to the generator
 */
function rewriteFile(args, generator) {
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
function replaceContent(args, generator) {
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
function escapeRegExp(str) {
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
function normalizeWindowsLineEndings(str) {
  const isWin32 = os.platform() === 'win32';
  return isWin32 ? str.replace(/\r\n/g, '\n') : str;
}

/**
 * Change spaces sequences and '>' to allow any number of spaces or new line prefix
 *
 * @param {string} str string
 * @returns {string} string where CRLF is replaced with LF in Windows
 */
function convertToPrettierExpressions(str) {
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
function rewrite(args) {
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
function deepFind(obj, path, placeholder) {
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
 * Get DB type from DB value
 * @param {string} db - db
 */
function getDBTypeFromDBValue(db) {
  if (constants.SQL_DB_OPTIONS.map(db => db.value).includes(db)) {
    return SQL;
  }
  return db;
}

/**
 * Checks if string is already in file
 * @param {string} path file path
 * @param {string} search search string
 * @param {object} generator reference to generator
 * @returns {boolean} true if string is in file, false otherwise
 */
function checkStringInFile(path, search, generator) {
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
function checkRegexInFile(path, regex, generator) {
  const fileContent = generator.fs.read(generator.destinationPath(path));
  return fileContent.match(regex);
}

/**
 * Remove 'generator-' prefix from generators for compatibility with yeoman namespaces.
 * @param {string} packageName - name of the blueprint's package name
 * @returns {string} namespace of the blueprint
 */
function packageNameToNamespace(packageName) {
  return packageName.replace('generator-', '');
}

/**
 * Calculate a hash code for a given string.
 * @param {string} str - any string
 * @returns {number} returns the calculated hash code.
 */
function stringHashCode(str) {
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

function vueAddPageToRouterImport(generator, { clientSrcDir, pageName, pageFolderName, pageFilename = pageFolderName }) {
  rewriteFile(
    {
      file: `${clientSrcDir}/app/router/pages.ts`,
      needle: 'jhipster-needle-add-entity-to-router-import',
      splicable: [
        stripMargin(
          // prettier-ignore
          `|// prettier-ignore
                |const ${pageName} = () => import('@/pages/${pageFolderName}/${pageFilename}.vue');`
        ),
      ],
    },
    generator
  );
}

function vueAddPageToRouter(generator, { clientSrcDir, pageName, pageFilename }) {
  rewriteFile(
    {
      file: `${clientSrcDir}/app/router/pages.ts`,
      needle: 'jhipster-needle-add-entity-to-router',
      splicable: [
        stripMargin(
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

function vueAddPageServiceToMainImport(generator, { clientSrcDir, pageName, pageFolderName, pageFilename = pageFolderName }) {
  rewriteFile(
    {
      file: `${clientSrcDir}/app/main.ts`,
      needle: 'jhipster-needle-add-entity-service-to-main-import',
      splicable: [
        stripMargin(
          // prettier-ignore
          `|import ${pageName}Service from '@/pages/${pageFolderName}/${pageFilename}.service';`
        ),
      ],
    },
    generator
  );
}

function vueAddPageServiceToMain(generator, { clientSrcDir, pageName, pageInstance }) {
  rewriteFile(
    {
      file: `${clientSrcDir}/app/main.ts`,
      needle: 'jhipster-needle-add-entity-service-to-main',
      splicable: [
        stripMargin(
          // prettier-ignore
          `|${pageInstance}Service: () => new ${pageName}Service(),`
        ),
      ],
    },
    generator
  );
}
