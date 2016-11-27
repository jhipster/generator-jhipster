'use strict';
var path = require('path'),
    html = require('html-wiring'),
    shelljs = require('shelljs'),
    chalk = require('chalk'),
    semver = require('semver'),
    engine = require('ejs').render,
    _ = require('lodash');

const constants = require('./generator-constants'),
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    LANGUAGES_MAIN_SRC_DIR = '../../languages/templates/' + constants.CLIENT_MAIN_SRC_DIR,
    GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES = '2.9.0',
    GENERATOR_JHIPSTER = 'generator-jhipster';

module.exports = {
    rewrite: rewrite,
    rewriteFile: rewriteFile,
    replaceContent: replaceContent,
    classify: classify,
    rewriteJSONFile: rewriteJSONFile,
    copyWebResource: copyWebResource,
    wordwrap: wordwrap,
    initGitRepoIfNeeded: initGitRepoIfNeeded,
    assertNoLocalChangesInRepository: assertNoLocalChangesInRepository,
    gitCheckoutBranch: gitCheckoutBranch,
    getCurrentBranchName: getCurrentBranchName,
    createBranchAndGenerateApp: createBranchAndGenerateApp,
    cleanUpDirBeforeAppGeneration: cleanUpDirBeforeAppGeneration,
    regenerateJHipsterApp: regenerateJHipsterApp
};

function rewriteFile(args, _this) {
    args.path = args.path || process.cwd();
    var fullPath = path.join(args.path, args.file);

    args.haystack = _this.fs.read(fullPath);
    var body = rewrite(args);
    _this.fs.write(fullPath, body);
}

function replaceContent(args, _this) {
    args.path = args.path || process.cwd();
    var fullPath = path.join(args.path, args.file);

    var re = args.regex ? new RegExp(args.pattern, 'g') : args.pattern;

    var body = _this.fs.read(fullPath);
    body = body.replace(re, args.content);
    _this.fs.write(fullPath, body);
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function rewrite(args) {
    // check if splicable is already in the body text
    var re = new RegExp(args.splicable.map(function (line) {
        return '\s*' + escapeRegExp(line);
    }).join('\n'));

    if (re.test(args.haystack)) {
        return args.haystack;
    }

    var lines = args.haystack.split('\n');

    var otherwiseLineIndex = -1;
    lines.forEach(function (line, i) {
        if (line.indexOf(args.needle) !== -1) {
            otherwiseLineIndex = i;
        }
    });

    var spaces = 0;
    while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
        spaces += 1;
    }

    var spaceStr = '';
    while ((spaces -= 1) >= 0) {
        spaceStr += ' ';
    }

    lines.splice(otherwiseLineIndex, 0, args.splicable.map(function (line) {
        return spaceStr + line;
    }).join('\n'));

    return lines.join('\n');
}

// _.classify uses _.titleize which lowercase the string,
// so if the user chooses a proper ClassName it will not rename properly
function classify(string) {
    string = string.replace(/[\W_](\w)/g, function (match) {
        return ' ' + match[1].toUpperCase();
    }).replace(/\s/g, '');
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function rewriteJSONFile(filePath, rewriteFile, _this) {
    var jsonObj = _this.fs.readJSON(filePath);
    rewriteFile(jsonObj, _this);
    _this.fs.writeJSON(filePath, jsonObj, null, 4);
}

function copyWebResource(source, dest, regex, type, _this, _opt, template) {

    _opt = _opt !== undefined ? _opt : {};
    if (_this.enableTranslation) {
        // uses template method instead of copy if template boolean is set as true
        template ? _this.template(source, dest, _this, _opt) : _this.copy(source, dest);
    } else {
        var body = stripContent(source, regex, _this, _opt);
        switch (type) {
        case 'html' :
            body = replacePlaceholders(body, _this);
            break;
        case 'js' :
            body = replaceTitle(body, _this, template);
            break;
        }
        _this.write(dest, body);
    }
}

function stripContent(source, regex, _this, _opt) {

    var body = html.readFileAsString(path.join(_this.sourceRoot(), source));
    //temp hack to fix error thrown by ejs during entity creation, this needs a permanent fix when we add more .ejs files
    _opt.filename = path.join(_this.sourceRoot(), CLIENT_MAIN_SRC_DIR + 'app/entities/ng_validators.ejs');
    body = engine(body, _this, _opt);
    body = body.replace(regex, '');

    return body;
}

function replaceTitle(body, _this, template) {
    var re = /pageTitle[\s]*:[\s]*[\'|\"]([a-zA-Z0-9\.\-\_]+)[\'|\"]/g;
    var match;

    while ((match = re.exec(body)) !== null) {
        // match is now the next match, in array form and our key is at index 1, index 1 is replace target.
        var key = match[1], target = key;
        var jsonData = geti18nJson(key, _this);
        var keyValue = jsonData !== undefined ? deepFind(jsonData, key) : undefined;

        body = body.replace(target, keyValue !== undefined ? keyValue : _this.baseName);
    }

    return body;
}

function replacePlaceholders(body, _this) {
    var re = /placeholder=[\'|\"]([\{]{2}[\'|\"]([a-zA-Z0-9\.\-\_]+)[\'|\"][\s][\|][\s](translate)[\}]{2})[\'|\"]/g;
    var match;

    while ((match = re.exec(body)) !== null) {
        // match is now the next match, in array form and our key is at index 2, index 1 is replace target.
        var key = match[2], target = match[1];
        var jsonData = geti18nJson(key, _this);
        var keyValue = jsonData !== undefined ? deepFind(jsonData, key, true) : undefined; // dirty fix to get placeholder as it is not in proper json format, name has a dot in it. Assuming that all placeholders are in similar format

        body = body.replace(target, keyValue !== undefined ? keyValue : '');
    }

    return body;
}

function geti18nJson(key, _this, template) {

    var i18nDirectory = LANGUAGES_MAIN_SRC_DIR + 'i18n/en/',
        name = _.kebabCase(key.split('.')[0]),
        filename = i18nDirectory + name + '.json',
        render = template;

    if (!shelljs.test('-f', path.join(_this.sourceRoot(), filename))) {
        filename = i18nDirectory + '_' + name + '.json';
        render = true;
    }
    try {
        var file = html.readFileAsString(path.join(_this.sourceRoot(), filename));

        file = render ? engine(file, _this, {}) : file;
        file = JSON.parse(file);
        return file;
    } catch (err) {
        _this.log('error' + err);
        // 'Error reading translation file!'
        return undefined;
    }
}

function deepFind(obj, path, placeholder) {
    var paths = path.split('.'), current = obj, i;
    if (placeholder) {// dirty fix for placeholders, the json files needs to be corrected
        paths[paths.length - 2] = paths[paths.length - 2] + '.' + paths[paths.length - 1];
        paths.pop();
    }
    for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] === undefined) {
            return undefined;
        } else {
            current = current[paths[i]];
        }
    }
    return current;
}

function wordwrap (text, width, separator, keepLF) {
    var wrappedText = '';
    var rows = text.split('\n');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (keepLF === true && i !== 0) {
            wrappedText = wrappedText + '\\n';
        }
        wrappedText = wrappedText + separator + _.padEnd(row,width) + separator;
    }
    return wrappedText;
}

function initGitRepoIfNeeded (_this, callback) {
    var gitInit = function() {
        _this.gitExec('init', function(code, msg, err) {
            if (code !== 0) _this.error('Unable to initialize a new git repository:\n' + msg + ' ' + err);
            _this.log('Initialized a new git repository');
            gitCommitAll('Initial', _this, function() {
                callback();
            });
        }.bind(_this));
    }.bind(_this);
    _this.gitExec(['rev-parse', '-q', '--is-inside-work-tree'], function(code, msg, err) {
        if (code !== 0) gitInit();
        else {
            _this.log('Git repository detected');
            callback();
        }
    }.bind(_this));
}

function assertNoLocalChangesInRepository (_this, callback) {
    _this.gitExec(['status', '--porcelain'], function(code, msg, err) {
        if (code !== 0) _this.error('Unable to check for local changes:\n' + msg + ' ' + err);
        if (msg != null && msg !== '') {
            _this.warning(' local changes found.\n' +
                '\tPlease commit/stash them before proceeding');
            _this.error('Exiting process');
        }
        callback();
    }.bind(_this));
}

function getCurrentBranchName (_this, callback) {
    _this.gitExec(['rev-parse', '-q', '--abbrev-ref', 'HEAD'], function(code, msg, err) {
        if (code !== 0) _this.error('Unable to detect current git branch:\n' + msg + ' ' + err);
        callback(msg.replace('\n',''));
    }.bind(_this));
}

function getGitVersion (_this, callback) {
    _this.gitExec(['--version'], function(code, msg) {
        callback(String(msg.match(/([0-9]+\.[0-9]+\.[0-9]+)/g)));
    }.bind(_this));
}

/*function recordCodeHasBeenGenerated (branch, _this, callback) {
    getGitVersion(_this, function(gitVersion) {
        var args;
        if (semver.lt(gitVersion, GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES)) {
            args = ['merge', '--strategy=ours', '-q', '--no-edit', branch];
        } else {
            args = ['merge', '--strategy=ours', '-q', '--no-edit', '--allow-unrelated-histories', branch];
        }
        _this.gitExec(args, function(code, msg, err) {
            if (code !== 0) _this.error('Unable to record current code has been generated with version ' +
                _this.currentVersion + ':\n' + msg + ' ' + err);
            _this.log('Current code recorded as generated with version ' + _this.currentVersion);
            callback();
        }.bind(_this));
    });
}

function installJhipsterLocally (version, _this, callback) {
    shelljs.exec('npm ll -p --depth=0 ' + GENERATOR_JHIPSTER, { silent: true }, function (code, msg, err) {
        if (code !== 0 || msg.split('@')[1].split(':')[0] !== _this.currentVersion) {
            _this.log('Installing JHipster ' + version + ' locally');
            shelljs.exec('npm install ' + GENERATOR_JHIPSTER + '@' + version, { silent: true }, function (code, msg, err) {
                if (code === 0) _this.log(chalk.green('Installed ' + GENERATOR_JHIPSTER + '@' + version));
                else _this.error('Something went wrong while installing the JHipster generator! ' + msg + ' ' + err);
                callback();
            }.bind(_this));
        } else {
            _this.log('Using already installed JHipster ' + version);
            callback();
        }
    }.bind(_this));
}*/

function createBranchAndGenerateApp (branch, sourceBranch, failIfBranchAlreadyExists, currentVersion, commitMsg, _this, callback) {
    var recordCodeHasBeenGenerated = function() {
        getGitVersion(_this, function(gitVersion) {
            var args;
            if (semver.lt(gitVersion, GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES)) {
                args = ['merge', '--strategy=ours', '-q', '--no-edit', branch];
            } else {
                args = ['merge', '--strategy=ours', '-q', '--no-edit', '--allow-unrelated-histories', branch];
            }
            _this.gitExec(args, function(code, msg, err) {
                if (code !== 0) _this.error('Unable to record current code has been generated with version ' +
                    currentVersion + ':\n' + msg + ' ' + err);
                _this.log('Current code recorded as generated with version ' + currentVersion);
                callback();
            }.bind(_this));
        }.bind(_this));
    }.bind(_this);

    var installJhipsterLocally = function (version, callback) {
        shelljs.exec('npm ll -p --depth=0 ' + GENERATOR_JHIPSTER, { silent: true }, function (code, msg, err) {
            if (code !== 0 || msg.split('@')[1].split(':')[0] !== currentVersion) {
                _this.log('Installing JHipster ' + version + ' locally');
                shelljs.exec('npm install ' + GENERATOR_JHIPSTER + '@' + version, { silent: true }, function (code, msg, err) {
                    if (code === 0) _this.log(chalk.green('Installed ' + GENERATOR_JHIPSTER + '@' + version));
                    else _this.error('Something went wrong while installing the JHipster generator! ' + msg + ' ' + err);
                    callback();
                }.bind(_this));
            } else {
                _this.log('Using already installed JHipster ' + version);
                callback();
            }
        }.bind(_this));
    }.bind(_this);

    var regenerate = function() {
        cleanUpDirBeforeAppGeneration(_this);
        installJhipsterLocally(currentVersion, function() {
            regenerateJHipsterApp(currentVersion, commitMsg, _this, function() {
                gitCheckoutBranch(sourceBranch, _this, function() {
                    // consider code up-to-date
                    recordCodeHasBeenGenerated();
                });
            }.bind(_this));
        }.bind(_this));
    }.bind(_this);

    var createUpgradeBranch = function() {
        _this.gitExec(['checkout', '--orphan', branch], function(code, msg, err) {
            if (code !== 0) _this.error('Unable to create ' + branch + ' branch:\n' + msg + ' ' + err);
            _this.log('Created branch ' + branch);
            regenerate();
        }.bind(_this));
    }.bind(_this);

    _this.gitExec(['rev-parse', '-q', '--verify', branch], function(code, msg, err) {
        if (code !== 0) {
            createUpgradeBranch();
        } else {
            if (failIfBranchAlreadyExists) {
                _this.error('Branch ' + branch + ' already exists. Aborting...');
            } else {
                callback();
            }
        }
    }.bind(_this));
}

function gitCheckoutBranch (branch, _this, callback) {
    _this.gitExec(['checkout', '-q', branch], function(code, msg, err) {
        if (code !== 0) _this.error('Unable to checkout branch ' + branch + ':\n' + err);
        _this.log('Checked out branch \"' + branch + '\"');
        callback();
    }.bind(_this));
}

function cleanUpDirBeforeAppGeneration (_this) {
    shelljs.ls('-A').forEach( file => {
        if(['.yo-rc.json', '.jhipster', 'node_modules', '.git'].indexOf(file) === -1) {
            shelljs.rm('-rf', file);
        }
    });
    _this.log('Cleaned up directory');
}

function generateJhipsterApp (version, _this, callback) {
    _this.log('Regenerating app with jhipster ' + version + '...');
    shelljs.exec('yo jhipster --with-entities --force --skip-install', {silent:false}, function (code, msg, err) {
        if (code === 0) _this.log(chalk.green('Successfully regenerated app with jhipster ' + version));
        else _this.error('Something went wrong while generating project! '+ err);
        callback();
    }.bind(_this));
}

function gitCommitAll (commitMsg, _this, callback) {
    var commit = function() {
        _this.gitExec(['commit', '-q', '-m', '\"' + commitMsg + '\"', '-a', '--allow-empty'], function(code, msg, err) {
            if (code !== 0) _this.error('Unable to commit in git:\n' + err);
            _this.log('Committed with message \"' + commitMsg + '\"');
            callback();
        }.bind(_this));
    }.bind(_this);
    _this.gitExec(['add', '-A'], {maxBuffer: 1024 * 500}, function(code, msg, err) {
        if (code !== 0) _this.error('Unable to add resources in git:\n' + err);
        commit();
    }.bind(_this));
}

function regenerateJHipsterApp (version, commitMsg, _this, callback) {
    generateJhipsterApp(version, _this, function() {
        gitCommitAll(commitMsg, _this, function() {
            callback();
        }.bind(_this));
    }.bind(_this));
}
