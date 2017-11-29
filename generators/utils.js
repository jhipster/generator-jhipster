/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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
const html = require('html-wiring');
const shelljs = require('shelljs');
const ejs = require('ejs');
const _ = require('lodash');
const constants = require('./generator-constants');
const jsyaml = require('js-yaml');

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
    // array
    getPropertyInArray,
    updatePropertyInArray,
    deletePropertyInArray,
    // yaml read
    getYamlProperty,
    // yaml properties
    addYamlPropertiesAtBeginin,
    addYamlPropertiesAtEnd,
    addYamlPropertiesBeforeAnotherProperty,
    addYamlPropertiesAfterAnotherProperty,
    addYamlPropertiesAtLineIndex,
    // yaml property
    addYamlPropertyAtBeginin,
    addYamlPropertyAtEnd,
    addYamlPropertyBeforeAnotherProperty,
    addYamlPropertyAfterAnotherProperty,
    addYamlPropertyAtLineIndex,
    // functions
    getLastPropertyCommonHierarchy,
    getPathAndValueOfAllProperty,
    // main
    updateYamlProperties,
    updateYamlProperty

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
 *
 * @param {string} str string
 * @returns {string} string with regular expressions escaped
 */
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'); // eslint-disable-line
}

/**
 * rewrite using the passed argument object
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

    while ((spaces -= 1) >= 0) { // eslint-disable-line no-cond-assign
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
        renderContent(source, generator, generator, opt, (body) => {
            body = body.replace(regex, '');
            switch (type) {
            case 'html':
                body = replacePlaceholders(body, generator);
                break;
            case 'js':
                body = replaceTitle(body, generator);
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

    while ((match = re.exec(body)) !== null) { // eslint-disable-line no-cond-assign
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

    while ((match = re.exec(body)) !== null) { // eslint-disable-line no-cond-assign
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
 * @param key i18n key
 * @param {object} generator reference to the generator
 * @returns parsed json file
 */
function geti18nJson(key, generator) {
    const i18nDirectory = `${LANGUAGES_MAIN_SRC_DIR}i18n/en/`;
    const name = _.kebabCase(key.split('.')[0]);
    let filename = `${i18nDirectory + name}.json`;
    let render;

    if (!shelljs.test('-f', path.join(generator.sourceRoot(), filename))) {
        filename = `${i18nDirectory}_${name}.json`;
        render = true;
    }
    try {
        let file = html.readFileAsString(path.join(generator.sourceRoot(), filename));

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
    if (placeholder) { // dirty fix for placeholders, the json files needs to be corrected
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
function buildEnumInfo(field, angularAppName, packageName) {
    const fieldType = field.fieldType;
    field.enumInstance = _.lowerFirst(fieldType);
    const enumInfo = {
        enumName: fieldType,
        enumValues: field.fieldValues.split(',').join(', '),
        enumInstance: field.enumInstance,
        enums: field.fieldValues.replace(/\s/g, '').split(','),
        angularAppName,
        packageName
    };
    return enumInfo;
}

/**
 * Copy object props from source to destination
 * @param {*} toObj
 * @param {*} fromObj
 */
function copyObjectProps(toObj, fromObj) {
    Object.assign(toObj, fromObj);
}


/**
 * get a property by path in a array
 *
 * @param {array} array - array in which we want to search
 * @param {string} name - property name to search "format myProperty.level2.level3"
 * @param {string} generator - The generator
 * @return {string} the value of property or undefined
 */
function getPropertyInArray(array, name, generator) {
    return _.get(array, name);
}

/**
 * Update or create a property by path in a array
 *
 * @param {array} array - array in which we want to update
 * @param {string} name - property name to search "format myProperty.level2.level3"
 * @param {string} generator - The generator
 * @param {string} value - (optional) value of the property
 */
function updatePropertyInArray(array, name, generator, value) {
    _.set(array, name, value);
}

/**
 * Delete a property by path in a array
 *
 * @param {array} array - array in which we want to delete
 * @param {string} name - property name to search "format myProperty.level2.level3"
 * @param {string} generator - The generator
 */
function deletePropertyInArray(array, name, generator) {
    _.unset(array, name);
}

/**
 * Get a yaml property by path in a file
 *
 * @param {string} file - yaml file to search
 * @param {string} name - property name to search "format myProperty.level2.level3"
 * @param {string} generator - The generator
 * @return {string} the value of property or undefined
 */
function getYamlProperty(file, name, generator) {
    const treeData = jsyaml.safeLoad(generator.fs.read(file));
    return getPropertyInArray(treeData, name.toString().split('.'), generator);
}

/**
 * Add yaml properties at beginin
 *
 * @param {string} file - yaml file to update
 * @param {array} properties - array of property to add
 * @param {string} generator - The generator
 */
function addYamlPropertiesAtBeginin(file, properties, generator) {
    const bodyLines = generator.fs.read(file).split('\n');
    const newLines = jsyaml.safeDump(properties, { indent: 4 }).split('\n');
    bodyLines.splice(bodyLines.count, 0, newLines.join('\n'));
    generator.fs.write(file, bodyLines.join('\n'));
}

/**
 * Add yaml properties at end
 *
 * @param {string} file - yaml file to update
 * @param {array} properties - array of property to add
 * @param {string} generator - The generator
 */
function addYamlPropertiesAtEnd(file, properties, generator) {
    const bodyLines = generator.fs.read(file).split('\n');
    const newLines = jsyaml.safeDump(properties, { indent: 4 }).split('\n');
    generator.fs.write(file, bodyLines.concat(newLines).join('\n'));
}

/**
 * Add yaml properties before another property
 *
 * @param {string} file - yaml file to update
 * @param {array} properties - array of property to add
 * @param {string} generator - The generator
 * @param {string} propertyBefore - The property before which we wish to insert new properties
 * @param {string} addBeforeComment - (Optional) if this variable is defined, means that we will return the index before the previuous comment of the property.
 */
function addYamlPropertiesBeforeAnotherProperty(file, properties, generator, propertyBefore, addBeforeComment) {
    const body = generator.fs.read(file);
    const newLines = jsyaml.safeDump(properties, { indent: 4 }).split('\n');
    const applicationPropertyIndex = getIndexBeforeLineOfProperty(body, propertyBefore, generator, addBeforeComment);
    if (applicationPropertyIndex === -1) {
        throw new Error(`Property ${propertyBefore} not found`); // inside callback
    }
    const bodyLines = body.split('\n');
    bodyLines.splice(applicationPropertyIndex, 0, newLines.join('\n'));
    generator.fs.write(file, bodyLines.join('\n'));
}

/**
 * Add yaml properties after another property
 *
 * @param {string} file - yaml file to update
 * @param {array} properties - array of property to add
 * @param {string} generator - The generator
 * @param {string} propertyAfter - The property after which we wish to insert new properties
 */
function addYamlPropertiesAfterAnotherProperty(file, properties, generator, propertyAfter) {
    const body = generator.fs.read(file);
    const newLines = jsyaml.safeDump(properties, { indent: 4 }).split('\n');
    const applicationPropertyIndex = getIndexAfterLineOfProperty(file, propertyAfter, generator);
    if (applicationPropertyIndex === -1) {
        throw new Error(`Property ${propertyAfter} not found`); // inside callback
    }
    const bodyLines = body.split('\n');
    bodyLines.splice(applicationPropertyIndex, 0, newLines.join('\n'));
    generator.fs.write(file, bodyLines.join('\n'));
}

/**
 * Add yaml properties at a specific line
 *
 * @param {string} file - yaml file to update
 * @param {array} properties - array of property to add
 * @param {string} generator - The generator
 * @param {string} indexLine - Index of line which we wish to insert new properties
 * @param {string} numberSpace - number espace to start
 */
function addYamlPropertiesAtLineIndex(file, properties, generator, indexLine, numberSpace) {
    const body = generator.fs.read(file);
    const newLines = jsyaml.safeDump(properties, { indent: 4 }).split('\n');
    const bodyLines = body.split('\n');
    let spaceStr = '';
    for (let i = 0; i < numberSpace; i++) {
        spaceStr += ' ';
    }
    bodyLines.splice(indexLine, 0, newLines.map(line => spaceStr + line).join('\n'));
    generator.fs.write(file, bodyLines.join('\n'));
}

/**
 * Add a yaml property at beginin
 * TODO manage value of array type
 *
 * @param {string} file - yaml file to update
 * @param {string} property - property name format spring.cloud.name
 * @param {string | integer } value - value of the property
 * @param {string} generator - The generator
 */
function addYamlPropertyAtBeginin(file, property, value, generator) {
    const properties = {};
    updatePropertyInArray(properties, property, generator, value);
    addYamlPropertiesAtBeginin(file, properties, generator);
}

/**
 * Add a yaml property at end
 * TODO manage value of array type
 *
 * @param {string} file - yaml file to update
 * @param {string} property - property name
 * @param {string | integer } value - value of the property
 * @param {string} generator - The generator
 */
function addYamlPropertyAtEnd(file, property, value, generator) {
    const properties = {};
    updatePropertyInArray(properties, property, generator, value);
    addYamlPropertiesAtEnd(file, properties, generator);
}

/**
 * Add a yaml property before another property
 *
 * @param {string} file - yaml file to update
 * @param {string} property - property name
 * @param {string} value - value of property
 * @param {string} generator - The generator
 * @param {string} propertyBefore - The property before which we wish to insert new property
 * @param {string} addBeforeComment - (Optional) if this variable is defined, means that we will return the index before the previuous comment of the property.
 */
function addYamlPropertyBeforeAnotherProperty(file, property, value, generator, propertyBefore, addBeforeComment) {
    const properties = {};
    updatePropertyInArray(properties, property, generator, value);
    addYamlPropertiesBeforeAnotherProperty(file, properties, generator, propertyBefore, addBeforeComment);
}

/**
 * Add a yaml property after another property
 *
 * @param {string} file - yaml file to update
 * @param {string} property - property name
 * @param {string} value - value of property
 * @param {string} generator - The generator
 * @param {string} propertyAfter - The property before which we wish to insert new property
 */
function addYamlPropertyAfterAnotherProperty(file, property, value, generator, propertyAfter) {
    const properties = {};
    updatePropertyInArray(properties, property, generator, value);
    addYamlPropertiesAfterAnotherProperty(file, properties, generator, propertyAfter);
}

/**
 * Add yaml properties at a specific line
 *
 * @param {string} file - yaml file to update
 * @param {string} property - property name
 * @param {string} value - value of property
 * @param {string} generator - The generator
 * @param {string} indexLine - Index of line which we wish to insert new properties
 * @param {string} numberSpace - number espace to start
 */
function addYamlPropertyAtLineIndex(file, property, value, generator, indexLine, numberSpace) {
    const properties = {};
    updatePropertyInArray(properties, property, generator, value);
    addYamlPropertiesAtLineIndex(file, properties, generator, indexLine, numberSpace);
}

/**
 * Get the last property of a common hierarchical.
 *
 * @param {string} file - file where we want to search
 * @param {string} property - property name to remove
 * @param {string} generator - The generator
 * @return {string} String path property
 */
function getLastPropertyCommonHierarchy(file, property, generator) {
    const yamlData = jsyaml.safeLoad(generator.fs.read(file));
    const pathYaml = [];
    getPathAndValueOfAllProperty(yamlData, '', pathYaml, generator);
    let idxPropTmp = property.lastIndexOf('.');
    let strPropTmp;
    strPropTmp = property;
    let lastValideParentProperty = getYamlProperty(file, strPropTmp, generator) ? strPropTmp : undefined;
    while (idxPropTmp !== -1) {
        if (getYamlProperty(file, strPropTmp, generator) !== undefined) {
            lastValideParentProperty = strPropTmp;
            idxPropTmp = -1;
        } else {
            idxPropTmp = strPropTmp.lastIndexOf('.');
            if (idxPropTmp !== -1) {
                strPropTmp = strPropTmp.substring(0, idxPropTmp);
            }
        }
    }
    return lastValideParentProperty;
}

/**
 * Retourne l'index de la ligne d'une propriété simple et unique
 *
 * @param {string} body - String body to search
 * @param {string} property - property name to search
 * @param {string} generator - The generator
 * @param {boolean} addBeforeComment - if this variable is true, means that we will return the index before the previuous comment of the property.
 */
function getIndexBeforeLineOfProperty(body, property, generator, addBeforeComment) {
    try {
        const lines = body.split('\n');

        let otherwiseLineIndex = -1;
        lines.some((line, i) => {
            if ((line.indexOf('#') === -1) && (line.indexOf(`${property}:`) !== -1)) {
                otherwiseLineIndex = i;
                return true;
            }
            return false;
        });

        if (addBeforeComment === true) {
            for (let i = otherwiseLineIndex - 1; i > 0; i--) {
                if (lines[i].indexOf('#') !== -1 || (/^\s*$/.test(lines[i]))) {
                    otherwiseLineIndex = i;
                } else {
                    break;
                }
            }
            otherwiseLineIndex += 1;
        }
        return otherwiseLineIndex;
    } catch (e) {
        return -1;
    }
}

/**
 * Array of line of yaml file has a property ?
 *
 * @param {array} array - String body to search
 * @param {string} property - property name to search
 * @param {int} fromIdx - start search from
 * @param {string} generator - The generator
 */
function hasProperty(array, property, fromIdx, generator) {
    let returnIndex = -1;
    if (fromIdx === -1) {
        fromIdx = 0;
    }
    for (let i = fromIdx; i < array.length; i++) {
        const line = array[i];

        if ((line.indexOf(`${property}:`) !== -1) &&
            ((line.indexOf('#') === -1) || ((line.indexOf('#') !== -1) && (line.indexOf('#') > line.indexOf(`${property}:`))))) {
            returnIndex = i;
            break;
        }
    }
    return returnIndex;
}

/**
 * get index of line of property
 *
 * @param {string} file - String body to search
 * @param {string} property - property name to search
 * @param {string} generator - The generator
 * @param {string} ignorecur - (Optional) If define, return the index at the end all the properties child of the property.
 * If not define, return the index at the end all the properties of the parent property.
 */
function getIndexAfterLineOfProperty(file, property, generator, ignorecur) {
    const body = generator.fs.read(file);
    const lines = body.split('\n');
    let otherwiseLineIndex = -1;
    let curr;

    const namePath = property.split('.');

    curr = namePath.splice(0, 1);

    while (curr !== undefined) {
        otherwiseLineIndex = hasProperty(lines, curr, otherwiseLineIndex, generator);
        curr = namePath.splice(0, 1)[0];
    }

    if (otherwiseLineIndex === -1) {
        return otherwiseLineIndex;
    }
    if (ignorecur) {
        otherwiseLineIndex += 1;
    }

    let spaces = 0;
    while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
        spaces += 1;
    }
    let spacesNext = 0;
    for (let i = otherwiseLineIndex + 1; i < lines.length; i++) {
        // line  by comments
        if (lines[i].trim().indexOf('#') !== 0) {
            spacesNext = 0;
            while (lines[i].charAt(spacesNext) === ' ') {
                spacesNext += 1;
            }
            // if next line has same number of space or more than the property, then it's a new property
            if (spacesNext >= spaces && spacesNext !== 0) {
                otherwiseLineIndex = i;
            } else {
                break;
            }
        }
    }

    return otherwiseLineIndex + 1;
}

/**
 * Update arrayReturn with full path of all property of object and the value associate at this property.
 * @param {object} obj
 * @param {string} stack path
 * @param {array} arrayReturn
 * @param {object} generator
 * @returns {array} return the array.
 */
function getPathAndValueOfAllProperty(obj, stack, arrayReturn, generator) {
    if (obj !== undefined && obj !== null) {
        for (let i = 0; i < Object.keys(obj).length; i++) {
            const property = Object.keys(obj)[i];
            if (typeof obj[property] === 'object') {
                if (stack === '') {
                    getPathAndValueOfAllProperty(obj[property], `${property}`, arrayReturn, generator);
                } else {
                    getPathAndValueOfAllProperty(obj[property], `${stack}.${property}`, arrayReturn, generator);
                }
            } else if (stack === '') {
                const key = `${property}`;
                const keyValue = [];
                keyValue.path = key;
                keyValue.value = obj[property];
                arrayReturn.push(keyValue);
            } else {
                const key = `${stack}.${property}`;
                const keyValue = [];
                keyValue.path = key;
                keyValue.value = obj[property];
                arrayReturn.push(keyValue);
            }
        }
    } else {
        const key = `${stack}`;
        const keyValue = [];
        keyValue.path = key;
        keyValue.value = obj;
        arrayReturn.push(keyValue);
    }
    return arrayReturn;
}

/**
 * Rewrite a yaml file.
 * TODO manage value of array type
 *
 * @param {string} file - yaml file to update
 * @param {string} property - property name format spring.cloud.name
 * @param {string | integer } value - value of the property
 * @param {string} generator - The generator
 */
function updateYamlProperty(file, property, value, generator) {
    try {
        if (getYamlProperty(file, property, generator) !== undefined) {
            generator.log(`Update Property ${property} in file ${file} not implemented yet\n Skip !`);
            // update
            // TODO code Update
        } else {
            const propExist = getLastPropertyCommonHierarchy(file, property, generator);
            if (propExist === undefined) {
                addYamlPropertyAtEnd(file, property, value, generator);
                return;
            }
            const arrPropExist = propExist.split('.');
            const spaces = arrPropExist.length * 4;
            const indexLineProps = getIndexAfterLineOfProperty(file, propExist, generator, true);
            addYamlPropertyAtLineIndex(file, property.substring(propExist.length + 1), value, generator, indexLineProps, spaces);
        }
    } catch (e) {
        generator.log(e);
    }
}

/**
 * Rewrite a yaml file.
 *
 * @param {string} file - yaml file to update
 * @param {array} properties - properties to add to yaml file
 * @param {string} generator - The generator
 */
function updateYamlProperties(file, properties, generator) {
    try {
        const arrayProp = [];
        getPathAndValueOfAllProperty(properties, '', arrayProp, generator);
        for (let i = 0; i < arrayProp.length; i++) {
            updateYamlProperty(file, arrayProp[i].path, arrayProp[i].value, generator);
        }
    } catch (e) {
        generator.log(e);
    }
}
