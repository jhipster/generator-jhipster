'use strict';
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var dircompare = require('dir-compare');
var _DEBUG = false;

var TestUtils = module.exports = function TestUtils() {
  this.rememberKeyLineStart = '    "rememberMeKey": ';
};

TestUtils.prototype.assertGeneratedFiles = function (expectedFilesDir, targetDir) {
  if (_DEBUG) console.log('Find diff');
  var options = {
    compareSize: true,
    compareContent: true
  };
  var res = dircompare.compareSync(expectedFilesDir, targetDir, options);
  if (_DEBUG || (res.distinct != 0)) {
    console.log('equal: ' + res.equal);
    console.log('distinct: ' + res.distinct);
    console.log('left: ' + res.left);
    console.log('right: ' + res.right);
    console.log('differences: ' + res.differences);
    console.log('same: ' + res.same);
    res.diffSet.forEach(function (entry) {
      var state = {
          'equal' : '==',
          'left' : '->',
          'right' : '<-',
          'distinct' : '<>'
      }[entry.state];
      if (entry.state != 'equal') {
        var name1 = targetDir + (entry.name1 ? entry.relativePath + path.sep + entry.name1 : '');
        var name2 = expectedFilesDir + (entry.name2 ? entry.relativePath + path.sep + entry.name2 : '');
        console.log(" " + entry.type1 + " " +  name1 + " " + state + " " + entry.type2 + " " + name2);
      }
    });
  }
  assert.equal(0, res.distinct, 'Generated files differ from template')
};

TestUtils.prototype.replaceInGeneratedFile = function (file, toReplace, replacement) {
  if (_DEBUG) console.log('Fix file ' + file);
  var content = fs.readFileSync(file);
  content = ('' + content).replace(toReplace, replacement);
  fs.writeFileSync(file, content);
}

TestUtils.prototype.findGeneratedRememberMeKey = function (file) {
  if (_DEBUG) console.log('Fix findGeneratedRememberMeKey in ' + file);
  var array = fs.readFileSync(file).toString().split("\n");
  var len = this.rememberKeyLineStart.length;
  for (var i in array) {
    var line = array[i];
    if (_DEBUG) console.log('line ' + line.substring(0, len));
    if (this.rememberKeyLineStart == line.substring(0, len)) {
    var rememberMeKey = line.substring(len);
      rememberMeKey = rememberMeKey.substring(1, rememberMeKey.length - 1);
      if (_DEBUG) console.log('RemeberMeKey ' + rememberMeKey);
      return rememberMeKey;
    }
  }
  throw 'Remember key line starting with ' + rememberKeyLineStart + ' was not found in ' + file;
}

TestUtils.prototype.fixDateInGeneratedGruntfileJs = function (targetDir) {
  this.replaceInGeneratedFile(path.resolve(targetDir, "Gruntfile.js"), '// Generated on ' + (new Date).toISOString().split('T')[0], '// Generated on 2015-01-01'); 
}

TestUtils.prototype.createTargetPath = function (filename) {
  return path.join(path.dirname(filename), 'temp', path.basename(filename, '.js'));
}

TestUtils.prototype.createArchetypesDir = function (name) {
  return path.join(__dirname, 'archetypes', name);
}