var fs = require('fs');

module.exports =  {
    endsWith : endsWith,
    parseVersion : parseVersion
}

var endsWith = function (str, suffix) {
    return str.indexOf('/', str.length - suffix.length) !== -1;
};
<% if (buildTool == 'maven') { %>
var parseString = require('xml2js').parseString;
// return the version number from `pom.xml` file
var parseVersion = function() {
    var version;
    var pomXml = fs.readFileSync('pom.xml', 'utf8');
    parseString(pomXml, function (err, result) {
        if (result.project.version && result.project.version[0]) {
            version = result.project.version[0];
        } else if (result.project.parent && result.project.parent[0] && result.project.parent[0].version && result.project.parent[0].version[0]) {
            version = result.project.parent[0].version[0]
        } else {
            throw new Error('pom.xml is malformed. No version is defined');
        }
    });
    return version;
};<% } else { %>
// Returns the second occurrence of the version number from `build.gradle` file
var parseVersion = function() {
    var versionRegex = /^version\s*=\s*[',"]([^',"]*)[',"]/gm; // Match and group the version number
    var buildGradle = fs.readFileSync('build.gradle', 'utf8');
    return versionRegex.exec(buildGradle)[1];
};<% } %>
