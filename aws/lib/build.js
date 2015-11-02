'use strict';
var exec = require('child_process').exec;

exports.buildProduction = function (buildTool, err) {
    var buildCmd = 'mvn package -Pprod -DskipTests=true -B';

    if (buildTool === 'gradle') {
        buildCmd = './gradlew -Pprod bootRepackage -x test';
    }

    var child = exec(buildCmd, err);

    return child.stdout;
};

