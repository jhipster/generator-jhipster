/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const shelljs = require('shelljs');
const ejs = require('ejs');
const _ = require('lodash');
const jhiCore = require('jhipster-core');
const fs = require('fs');
const crypto = require('crypto');

const constants = require('./generator-constants');

const LANGUAGES_MAIN_SRC_DIR = `../../languages/templates/${constants.CLIENT_MAIN_SRC_DIR}`;

module.exports = {
    rewrite,
    rewriteFile,
    replaceContent,
    classify,
    rewriteJSONFile,
    copyWebResource,
    renderContent,
    deepFind,
    getJavadoc,
    buildEnumInfo,
    copyObjectProps,
    decodeBase64,
    getAllJhipsterConfig,
    getDBTypeFromDBValue,
    getBase64Secret,
    getRandomHex,
    checkStringInFile
};

/**
 * Rewrite file with passed arguments
 * @param {object} args argument object (containing path, file, haystack, etc properties)
 * @param {object} generator reference to the generator
 */
function rewriteFile(args, generator) {
    args.path = args.path || process.cwd();
    const fullPath = path.join(args.path, args.file);

    args.haystack = generator.fs.read(fullPath);
    const body = rewrite(args);
    generator.fs.write(fullPath, body);
}

/**
 * Replace content
 * @param {object} args argument object
 * @param {object} generator reference to the generator
 */
function replaceContent(args, generator) {
    args.path = args.path || process.cwd();
    const fullPath = path.join(args.path, args.file);

    const re = args.regex ? new RegExp(args.pattern, 'g') : args.pattern;

    let body = generator.fs.read(fullPath);
    body = body.replace(re, args.content);
    generator.fs.write(fullPath, body);
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
 * Rewrite using the passed argument object.
 *
 * @param {object} args arguments object (containing splicable, haystack, needle properties) to be used
 * @returns {*} re-written file
 */
function rewrite(args) {
    // check if splicable is already in the body text
    const re = new RegExp(args.splicable.map(line => `\\s*${escapeRegExp(line)}`).join('\n'));

    if (re.test(args.haystack)) {
        return args.haystack;
    }

    const lines = args.haystack.split('\n');

    let otherwiseLineIndex = -1;
    lines.forEach((line, i) => {
        if (line.includes(args.needle)) {
            otherwiseLineIndex = i;
        }
    });

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
 * Convenient function to convert string into valid java class name
 * Note: _.classify uses _.titleize which lowercase the string,
 * so if the user chooses a proper ClassName it will not rename properly
 *
 * @param string string to 'class'-ify
 * @returns {string} 'class'-ified string
 */
function classify(string) {
    string = string.replace(/[\W_](\w)/g, match => ` ${match[1].toUpperCase()}`).replace(/\s/g, '');
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Rewrite JSON file
 *
 * @param {string} filePath file path
 * @param {function} rewriteFile rewriteFile function
 * @param {object} generator reference to the generator
 */
function rewriteJSONFile(filePath, rewriteFile, generator) {
    const jsonObj = generator.fs.readJSON(filePath);
    rewriteFile(jsonObj, generator);
    generator.fs.writeJSON(filePath, jsonObj, null, 2);
}

/**
 * Copy web resources
 *
 * @param {string} source source
 * @param {string} dest destination
 * @param {regex} regex regex
 * @param {string} type type of resource (html, js, etc)
 * @param {object} generator reference to the generator
 * @param {object} opt options
 * @param {any} template template
 */
function copyWebResource(source, dest, regex, type, generator, opt = {}, template) {
    if (generator.enableTranslation) {
        generator.template(source, dest, generator, opt);
    } else {
        renderContent(source, generator, generator, opt, body => {
            body = body.replace(regex, '');
            switch (type) {
                case 'html':
                    body = replacePlaceholders(body, generator);
                    break;
                case 'js':
                    body = replaceTitle(body, generator);
                    break;
                case 'jsx':
                    body = replaceTranslation(body, generator);
                    break;
                default:
                    break;
            }
            generator.fs.write(dest, body);
        });
    }
}

/**
 * Render content
 *
 * @param {string} source source
 * @param {object} generator reference to the generator
 * @param {any} context context
 * @param {object} options options
 * @param {function} cb callback function
 */
function renderContent(source, generator, context, options, cb) {
    ejs.renderFile(generator.templatePath(source), context, options, (err, res) => {
        if (!err) {
            cb(res);
        } else {
            generator.error(`Copying template ${source} failed. [${err}]`);
        }
    });
}

/**
 *
 * @param {string} body html body
 * @param {object} generator reference to the generator
 * @returns string with pageTitle replaced
 */
function replaceTitle(body, generator) {
    const re = /pageTitle[\s]*:[\s]*['|"]([a-zA-Z0-9.\-_]+)['|"]/g;
    let match;

    // eslint-disable-next-line no-cond-assign
    while ((match = re.exec(body)) !== null) {
        // match is now the next match, in array form and our key is at index 1, index 1 is replace target.
        const key = match[1];
        const target = key;
        const jsonData = geti18nJson(key, generator);
        const keyValue = jsonData !== undefined ? deepFind(jsonData, key) : undefined;

        body = body.replace(target, keyValue !== undefined ? keyValue : generator.baseName);
    }

    return body;
}

/**
 *
 * @param {string} body html body
 * @param {object} generator reference to the generator
 * @returns string with placeholders replaced
 */
function replacePlaceholders(body, generator) {
    const re = /placeholder=['|"]([{]{2}['|"]([a-zA-Z0-9.\-_]+)['|"][\s][|][\s](translate)[}]{2})['|"]/g;
    let match;

    // eslint-disable-next-line no-cond-assign
    while ((match = re.exec(body)) !== null) {
        // match is now the next match, in array form and our key is at index 2, index 1 is replace target.
        const key = match[2];
        const target = match[1];
        const jsonData = geti18nJson(key, generator);
        const keyValue = jsonData !== undefined ? deepFind(jsonData, key, true) : undefined; // dirty fix to get placeholder as it is not in proper json format, name has a dot in it. Assuming that all placeholders are in similar format

        body = body.replace(target, keyValue !== undefined ? keyValue : '');
    }

    return body;
}

/**
 *
 * @param {string} body html body
 * @param {object} generator reference to the generator
 * @returns string with Translate components replaced
 */
function replaceTranslation(body, generator) {
    const replaceRegex = (re, defultReplaceText) => {
        let match;
        // eslint-disable-next-line no-cond-assign
        while ((match = re.exec(body)) !== null) {
            // match is now the next match, in array form and our key is at index 2, index 1 is replace target.
            const key = match[2];
            const target = match[1];
            const limit = match[4]; // string indicating validation limit (e.g. "{ max: 4 }")
            const jsonData = geti18nJson(key, generator);
            let keyValue = jsonData !== undefined ? deepFind(jsonData, key) : undefined;
            if (!keyValue) {
                keyValue = deepFind(jsonData, key, true); // dirty fix to get placeholder as it is not in proper json format, name has a dot in it. Assuming that all placeholders are in similar format
            }
            if (limit) {
                // Replace "{{ placeholder }}" with numeric limit
                keyValue = keyValue.replace(/{{.+}}/, /{.+:\s(.+)\s}/.exec(limit)[1]);
            }

            body = body.replace(target, keyValue !== undefined ? `"${keyValue}"` : defultReplaceText);
        }
    };

    replaceRegex(/(\{translate\('([a-zA-Z0-9.\-_]+)'(, ?null, ?'.*')?\)\})/g, '""');
    replaceRegex(/(translate\(\s*'([a-zA-Z0-9.\-_]+)'(,\s*(null|\{.*\}),?\s*('.*')?\s*)?\))/g, "''");

    return body;
}

/**
 *
 * @param key i18n key
 * @param {object} generator reference to the generator
 * @returns parsed json file
 */
function geti18nJson(key, generator) {
    const i18nDirectory = `${LANGUAGES_MAIN_SRC_DIR}i18n/en/`;
    let name = _.kebabCase(key.split('.')[0]);
    if (['entity', 'error', 'footer'].includes(name)) {
        name = 'global';
    }
    let filename = `${i18nDirectory + name}.json`;
    let render;
    if (!shelljs.test('-f', path.join(generator.sourceRoot(), filename))) {
        filename = `${i18nDirectory}${name}.json.ejs`;
        render = true;
    }
    try {
        let file = generator.fs.read(path.join(generator.sourceRoot(), filename));
        file = render ? ejs.render(file, generator, {}) : file;
        file = JSON.parse(file);
        return file;
    } catch (err) {
        generator.log(err);
        generator.log(`Error in file: ${filename}`);
        // 'Error reading translation file!'
        return undefined;
    }
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
 * Convert passed block of string to javadoc formatted string.
 *
 * @param {string} text text to convert to javadoc format
 * @param {number} indentSize indent size
 * @returns javadoc formatted string
 */
function getJavadoc(text, indentSize) {
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
 * @param {any} field : entity field
 * @param {string} angularAppName
 * @param {string} packageName
 */
function buildEnumInfo(field, angularAppName, packageName, clientRootFolder) {
    const fieldType = field.fieldType;
    field.enumInstance = _.lowerFirst(fieldType);
    const enumInfo = {
        enumName: fieldType,
        enumValues: field.fieldValues.split(',').join(', '),
        enumInstance: field.enumInstance,
        enums: field.fieldValues.replace(/\s/g, '').split(','),
        angularAppName,
        packageName,
        clientRootFolder: clientRootFolder ? `${clientRootFolder}-` : ''
    };
    return enumInfo;
}

/**
 * Copy object props from source to destination
 * @param {*} toObj
 * @param {*} fromObj
 */
function copyObjectProps(toObj, fromObj) {
    // we use Object.assign instead of spread as we want to mutilate the object.
    Object.assign(toObj, fromObj);
}

/**
 * Decode the given string from base64 to said encoding.
 * @param string the base64 string to decode
 * @param encoding the encoding to decode into. default to 'utf-8'
 */
function decodeBase64(string, encoding = 'utf-8') {
    return Buffer.from(string, 'base64').toString(encoding);
}

/**
 * Get all the generator configuration from the .yo-rc.json file
 * @param {Generator} generator the generator instance to use
 * @param {boolean} force force getting direct from file
 */
function getAllJhipsterConfig(generator, force) {
    let configuration = generator && generator.config ? generator.config.getAll() || {} : {};
    if ((force || !configuration.baseName) && jhiCore.FileUtils.doesFileExist('.yo-rc.json')) {
        const yoRc = JSON.parse(fs.readFileSync('.yo-rc.json', { encoding: 'utf-8' }));
        configuration = yoRc['generator-jhipster'];
        // merge the blueprint config if available
        if (configuration.blueprint) {
            configuration = { ...configuration, ...yoRc[configuration.blueprint] };
        }
    }
    if (!configuration.get || typeof configuration.get !== 'function') {
        configuration = {
            ...configuration,
            getAll: () => configuration,
            get: key => configuration[key],
            set: (key, value) => {
                configuration[key] = value;
            }
        };
    }
    return configuration;
}

/**
 * Get DB type from DB value
 * @param {string} db - db
 */
function getDBTypeFromDBValue(db) {
    if (constants.SQL_DB_OPTIONS.map(db => db.value).includes(db)) {
        return 'sql';
    }
    return db;
}

/**
 * Get a random hex string
 * @param {int} len the length to use, defaults to 50
 */
function getRandomHex(len = 50) {
    return crypto.randomBytes(len).toString('hex');
}
/**
 * Generates a base64 secret from given string or random hex
 * @param {string} value the value used to get base64 secret
 * @param {int} len the length to use for random hex, defaults to 50
 */
function getBase64Secret(value, len = 50) {
    return Buffer.from(value || getRandomHex(len)).toString('base64');
}

function checkStringInFile(path, search, generator) {
    const fileContent = generator.fs.read(path);
    return fileContent.includes(search);
}
