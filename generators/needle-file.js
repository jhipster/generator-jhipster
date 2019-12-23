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
const ejs = require('ejs');
const path = require('path');
// const jhipsterUtils = require('./utils');

const ANY_HTML_NEEDLE = / *<!-- jhipster-needle-start-(?<name>[\w-]*)( - (?<comment>.*))? -->\n?(?<needle>[\S\s]*)<!-- jhipster-needle-end-\k<name> -->\n?/gi;
const htmlNeedleReader = name =>
    new RegExp(
        ` *<!-- jhipster-needle-start-${name}( - (?<comment>.*))? -->\n?(?<needle>[\\S\\s]*)<!-- jhipster-needle-end-${name} -->\n?`,
        'gi'
    );
const htmlNeedleWriter = name => new RegExp(` *<!-- jhipster-needle-${name}( - (?<comment>.*))? -->\n?`, 'gi');

const getNeedleGroup = result => {
    if (!result || !result.groups || !result.groups.needle) {
        return undefined;
    }
    // Remove trailing empty spaces
    return result.groups.needle.replace(/( +)$/, '');
};

module.exports = class {
    constructor(filePath, fs, reader) {
        if (!path.isAbsolute(filePath)) {
            this.path = path.join(process.cwd(), filePath);
        } else {
            this.path = filePath;
        }
        this.fs = fs;
        const ext = path.extname(this.path);
        if (ext === '.html' || ext === '.ejs') {
            this.anyRegexp = ANY_HTML_NEEDLE;
            this.regexp = reader ? htmlNeedleReader : htmlNeedleWriter;
        } else {
            throw new Error(`Needle not implemented for type ${ext}`);
        }
    }

    read() {
        return this.fs.read(this.path);
    }

    write(content) {
        this.fs.write(this.path, content);
    }

    writeNeedle(needleName, needleContent, options = {}) {
        const content = this.read();
        const result = this.findNeedle(needleName, content);
        if (!result) {
            return false;
        }
        this.write(content.slice(0, result.index) + needleContent + content.slice(result.index));
        return true;
    }

    render(needleName, obj, options = {}) {
        const content = this.read();
        const result = this.findNeedle(needleName, content);
        if (!result) {
            return undefined;
        }
        const needle = getNeedleGroup(result);
        if (!needle) {
            return undefined;
        }
        return ejs.render(needle, obj, { ...options, delimiter: '$' });
    }

    removeNeedles(content) {
        const matches = this.findNeedles(content);
        content = content || this.read();
        matches.reverse().forEach(match => {
            content = content.slice(0, match.index) + content.slice(match.lastIndex);
        });
        this.write(content);
        return content;
    }

    findNeedle(needleName, content) {
        return this.regexp(needleName).exec(content || this.read());
    }

    getNeedle(needleName) {
        return getNeedleGroup(this.findNeedle(needleName));
    }

    findNeedles(content) {
        content = content || this.read();
        const regex = RegExp(this.anyRegexp.source, this.anyRegexp.flags);
        const allMatches = [];
        let matches = regex.exec(content);
        while (matches) {
            allMatches.push(matches);
            matches.lastIndex = regex.lastIndex;
            matches = regex.exec(content);
        }
        return allMatches;
    }

    getNeedles() {
        const content = this.read();
        const regex = RegExp(this.anyRegexp.source, this.anyRegexp.flags);
        const allNames = [];
        let matches = regex.exec(content);
        while (matches) {
            if (matches.groups && matches.groups.name) {
                allNames.push(matches.groups.name);
            }
            matches = regex.exec(content);
        }
        return allNames;
    }

    _generateFileModel(aFile, needleTag, ...content) {
        return {
            file: aFile,
            needle: needleTag,
            splicable: content
        };
    }
};
