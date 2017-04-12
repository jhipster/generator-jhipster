<%#
 Copyright 2013-2017 the original author or authors.

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

var notify = require("gulp-notify");
var argv = require('yargs').argv;

module.exports = function() {

    var args = Array.prototype.slice.call(arguments);
    var notification = argv.notification === undefined ? true : argv.notification;
    // Send error to notification center with gulp-notify
    if(notification) {
        notify.onError({
            title:    "JHipster Gulp Build",
            subtitle: "Failure!",
            message:  "Error: <%= error.message %>",
            sound:    "Beep"
        }).apply(this, args);
    }
    // Keep gulp from hanging on this task
    this.emit('end');

};
