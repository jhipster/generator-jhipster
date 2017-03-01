'use strict';
const path = require('path');
const html = require('html-wiring');
const shelljs = require('shelljs');
const ejs = require('ejs');
const _ = require('lodash');

const constants = require('./generator-constants');
const LANGUAGES_MAIN_SRC_DIR = '../../languages/templates/' + constants.CLIENT_MAIN_SRC_DIR;

module.exports = {
    rewrite,
    rewriteFile,
    replaceContent,
    classify,
    rewriteJSONFile,
    copyWebResource,
    getJavadoc
};

function rewriteFile(args, _this) {
    args.path = args.path || process.cwd();
    const fullPath = path.join(args.path, args.file);

    args.haystack = _this.fs.read(fullPath);
    const body = rewrite(args);
    _this.fs.write(fullPath, body);
}

function replaceContent(args, _this) {
    args.path = args.path || process.cwd();
    const fullPath = path.join(args.path, args.file);

    const re = args.regex ? new RegExp(args.pattern, 'g') : args.pattern;

    let body = _this.fs.read(fullPath);
    body = body.replace(re, args.content);
    _this.fs.write(fullPath, body);
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function rewrite(args) {
    // check if splicable is already in the body text
    const re = new RegExp(args.splicable.map(function (line) {
        return `\s*${escapeRegExp(line)}`;
    }).join('\n'));

    if (re.test(args.haystack)) {
        return args.haystack;
    }

    const lines = args.haystack.split('\n');

    let otherwiseLineIndex = -1;
    lines.forEach((line, i) => {
        if (line.indexOf(args.needle) !== -1) {
            otherwiseLineIndex = i;
        }
    });

    let spaces = 0;
    while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
        spaces += 1;
    }

    let spaceStr = '';
    while ((spaces -= 1) >= 0) {
        spaceStr += ' ';
    }

    lines.splice(otherwiseLineIndex, 0, args.splicable.map(line => spaceStr + line).join('\n'));

    return lines.join('\n');
}

// _.classify uses _.titleize which lowercase the string,
// so if the user chooses a proper ClassName it will not rename properly
function classify(string) {
    string = string.replace(/[\W_](\w)/g, match => ` ${match[1].toUpperCase()}`).replace(/\s/g, '');
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function rewriteJSONFile(filePath, rewriteFile, _this) {
    const jsonObj = _this.fs.readJSON(filePath);
    rewriteFile(jsonObj, _this);
    _this.fs.writeJSON(filePath, jsonObj, null, 4);
}

function copyWebResource(source, dest, regex, type, generator, opt, template) {
    let _this = generator || this;
    let _opt = opt || {};
    if (_this.enableTranslation) {
        _this.template(source, dest, _this, _opt);
    } else {
        stripContent(source, regex, _this, _opt, (body) => {
            switch (type) {
            case 'html' :
                body = replacePlaceholders(body, _this);
                break;
            case 'js' :
                body = replaceTitle(body, _this);
                break;
            }
            _this.fs.write(dest, body);
        });
    }
}

function stripContent(source, regex, _this, _opt, cb) {
    ejs.renderFile(path.join(_this.sourceRoot(), source), _this, _opt, (err, res) => {
        if(!err) {
            res = res.replace(regex, '');
            cb(res);
        }
    });
}

function replaceTitle(body, _this) {
    const re = /pageTitle[\s]*:[\s]*[\'|\"]([a-zA-Z0-9\.\-\_]+)[\'|\"]/g;
    let match;

    while ((match = re.exec(body)) !== null) {
        // match is now the next match, in array form and our key is at index 1, index 1 is replace target.
        const key = match[1], target = key;
        const jsonData = geti18nJson(key, _this);
        const keyValue = jsonData !== undefined ? deepFind(jsonData, key) : undefined;

        body = body.replace(target, keyValue !== undefined ? keyValue : _this.baseName);
    }

    return body;
}

function replacePlaceholders(body, _this) {
    const re = /placeholder=[\'|\"]([\{]{2}[\'|\"]([a-zA-Z0-9\.\-\_]+)[\'|\"][\s][\|][\s](translate)[\}]{2})[\'|\"]/g;
    let match;

    while ((match = re.exec(body)) !== null) {
        // match is now the next match, in array form and our key is at index 2, index 1 is replace target.
        const key = match[2], target = match[1];
        const jsonData = geti18nJson(key, _this);
        const keyValue = jsonData !== undefined ? deepFind(jsonData, key, true) : undefined; // dirty fix to get placeholder as it is not in proper json format, name has a dot in it. Assuming that all placeholders are in similar format

        body = body.replace(target, keyValue !== undefined ? keyValue : '');
    }

    return body;
}

function geti18nJson(key, _this) {

    const i18nDirectory = LANGUAGES_MAIN_SRC_DIR + 'i18n/en/';
    const name = _.kebabCase(key.split('.')[0]);
    let filename = i18nDirectory + name + '.json';
    let render;

    if (!shelljs.test('-f', path.join(_this.sourceRoot(), filename))) {
        filename = i18nDirectory + '_' + name + '.json';
        render = true;
    }
    try {
        let file = html.readFileAsString(path.join(_this.sourceRoot(), filename));

        file = render ? ejs.render(file, _this, {}) : file;
        file = JSON.parse(file);
        return file;
    } catch (err) {
        _this.log(err);
        _this.log('Error in file: ' + filename);
        // 'Error reading translation file!'
        return undefined;
    }
}

function deepFind(obj, path, placeholder) {
    const paths = path.split('.');
    let current = obj;
    if (placeholder) {// dirty fix for placeholders, the json files needs to be corrected
        paths[paths.length - 2] = paths[paths.length - 2] + '.' + paths[paths.length - 1];
        paths.pop();
    }
    for (let i = 0; i < paths.length; ++i) {
        if (current[paths[i]] === undefined) {
            return undefined;
        } else {
            current = current[paths[i]];
        }
    }
    return current;
}

function getJavadoc (text, indentSize) {
    let javadoc = _.repeat(' ', indentSize) + '/**';
    const rows = text.split('\n');
    for (let i = 0; i < rows.length; i++) {
        javadoc = javadoc + '\n' + _.repeat(' ', indentSize) + ' * ' + rows[i];
    }
    javadoc = javadoc + '\n' + _.repeat(' ', indentSize) + ' */';
    return javadoc;
}
