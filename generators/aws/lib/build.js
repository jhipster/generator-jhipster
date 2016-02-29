'use strict';
var exec = require('child_process').exec;
var os = require('os');

exports.buildProduction = function (buildTool, err) {
    var buildCmd = 'mvn package -Pprod -DskipTests=true -B';

    if (buildTool === 'gradle') {
        if(os.platform() === 'win32') {
            buildCmd = 'gradlew -Pprod bootRepackage -x test';
        } else {
            buildCmd = './gradlew -Pprod bootRepackage -x test';
        }
    }

    var child = exec(buildCmd, err);

    return child.stdout;
};

