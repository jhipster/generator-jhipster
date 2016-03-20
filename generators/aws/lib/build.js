'use strict';
var exec = require('child_process').exec;
var os = require('os');

exports.buildProduction = function (buildTool, err) {
    var buildCmd = 'mvnw package -Pprod -DskipTests=true -B';

    if (buildTool === 'gradle') {
        buildCmd = 'gradlew bootRepackage -Pprod -x test';
    }

    if (os.platform() !== 'win32') {
        buildCmd = './' + buildCmd;
    }

    var child = exec(buildCmd, err);

    return child.stdout;
};
