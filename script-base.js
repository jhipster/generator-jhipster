'use strict';
var path = require('path'),
    util = require('util'),
    yeoman = require('yeoman-generator'),
    jhipsterUtils = require('./util.js');

module.exports = Generator;

function Generator() {
    yeoman.generators.NamedBase.apply(this, arguments);

    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    console.log("appPath - " + this.env.options.appPath);

}

util.inherits(Generator, yeoman.generators.NamedBase);

Generator.prototype.addScriptToIndex = function (script) {
    try {
        var appPath = this.env.options.appPath;
        console.log("appPath: " + this.env.options.appPath);
        var fullPath = path.join(appPath, 'index.html');
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: '<!-- endbuild -->',
            splicable: [
                    '<script src="scripts/' + script + '"></script>'
            ]
        });
    } catch (e) {
        console.log('\nUnable to find '.yellow + fullPath + '. Reference to '.yellow + script + '.js ' + 'not added.\n'.yellow);
    }
};