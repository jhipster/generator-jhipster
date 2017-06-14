<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
'use strict';

var fs = require('fs');

module.exports = {
    endsWith : endsWith,
    parseVersion : parseVersion,
    isLintFixed : isLintFixed
};

function endsWith(str, suffix) {
    return str.indexOf('/', str.length - suffix.length) !== -1;
}
<% if (buildTool == 'maven') { %>
var parseString = require('xml2js').parseString;
// return the version number from `pom.xml` file
function parseVersion() {
    var version = null;
    var pomXml = fs.readFileSync('pom.xml', 'utf8');
    parseString(pomXml, function (err, result) {
        if (result.project.version && result.project.version[0]) {
            version = result.project.version[0];
        } else if (result.project.parent && result.project.parent[0] && result.project.parent[0].version && result.project.parent[0].version[0]) {
            version = result.project.parent[0].version[0];
        }
    });
    if (version === null) {
        throw new Error('pom.xml is malformed. No version is defined');
    }
    return version;
}
<% } else if (buildTool == 'gradle') { %>
// Returns the second occurrence of the version number from `build.gradle` file
function parseVersion() {
    var versionRegex = /^version\s*=\s*[',"]([^',"]*)[',"]/gm; // Match and group the version number
    var buildGradle = fs.readFileSync('build.gradle', 'utf8');
    return versionRegex.exec(buildGradle)[1];
}
<% } else { %>
// Returns a static version number when server is skipped
function parseVersion() {
    return '0.0.1-SNAPSHOT';
};<% } %>
function isLintFixed(file) {
	// Has ESLint fixed the file contents?
	return file.eslint !== null && file.eslint.fixed;
}
