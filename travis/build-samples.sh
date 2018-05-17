#!/usr/bin/env bash

#  Copyright 2013-2018 the original author or authors from the JHipster project.
#
# This file is part of the JHipster project, see https://www.jhipster.tech/
# for more information.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#-------------------------------------------------------------------------------
# Local "Travis Build".
#-------------------------------------------------------------------------------

# README {{{1
# ==============================================================================
# ==============================================================================
# ==============================================================================
# ==============================================================================

# DISCLAIMER {{{2
# ============
# This script emulate Travis builds: it isn't executed on remote Travis
# instance.
# Only scripts under ./travis/script are executed by Travis CI.
# For a real local Travis build, see
# https://docs.travis-ci.com/user/common-build-problems/#Troubleshooting-Locally-in-a-Docker-Image.

# NOTES FOR DEVELOPPERS OF THIS SCRIPT {{{2
# ============
# 1) This code is avaible at:
# https://github.com/jhipster/generator-jhipster/blob/master/travis/build-samples.sh
# 2) This script is optimisated to be readden with vim. "zo" to open fold. "zc"
# to close fold.
# 3) All variables are escaped, it's a good practice because if there is space
# between world, it could cause errors.
# Check if all variables are escaped thanks perl and regex look around :
# $ perl -ne "printf if /(?<\!\(\()(?<\!\")(?<\!')(?<\!\\\\\`)\\\$(?\!\()(?\!\s)(?\!\?)(?\!\\')/" build-samples.sh
# 4) In Bah local variables are seen, and could be modified by inner functions.
# 5) keyword "export" exports variables to scripts ./scripts/*.sh
# 6) [[ -z "${myUnboundVar+x} ]] return true if "$myUnboundVar" is
#       unbound/unsetted.
#       In JavaScript, corresponding to test "typeof myVar === 'undefined'"
# 7) Do not return something > 0 caused of `set -e`
# 8) files descriptors are not shared between shells.
# 9) For logs files, always use `tee --append' and `1>>' and `2>>' !!
#        otherwise do strange things if files (without overwrite previous logs).
#       See examples in function createLogFile().
# 10) Do not use `while read' or `for' for complexes loops. It losts the
#       iterator in the loop. Use arrays.
# 11) Do not use syntax below:
#       Yarn test launch some processes in background:
#       <CTRL+C> doesn't kill it immediately.
#       yarn test || errorInBuildStopCurrentSample \
#               "Fail during test of the Generator." \
#               " (command 'yarn test' in `pwd`)"
# 12) Do not use loop for. Sometimes it fail. For example:
        # IFS=$' ' read -ra dockerContainers <<< `docker ps -q`
        # for i in ${dockerContainers[@]} ; do
        #     printCommandAndEval docker kill "$i" || exitScriptWithError \
        #         "FATAL ERROR: couldn't kill docker container '$i'"
        # done
# 13) we could unset even if a variable is not setted.

# HOW WORKS THIS SCRIPT. {{{2
# ============

# First of all, see `./build-samples.sh help'.
# This script is a little bit long. But I think it's better to distribute only
# one file.


# This file is splitted under six main titles. It could be seen as six files.
# README
# PREPARE SCRIPT
#   Add bash option. Trap errors, <CTRL+C>, end of script. Define functions
#   used in all this file (confirmationUser, printCommandAndEval)
# PRINT HELP `./build-samples.sh help'
# CLEAN SAMPLES `./build-samples.sh/ clean'
#   `./build-samples.sh clean [sample_name]'
# GENERATE AND TEST SAMPLES `./build-samples.sh generate/buildandtest'
#   `./build-samples.sh generate [sample_name]'
#   or
#   `./build-samples.sh buildandtest [sample_name]'
#   * See also paragrapher below to understand how this works.
#   * This part of this file is splitted under six subtitles:
#   * Each subtitle could be written in one independant file.
#   * Following subtitules could be seen as russian dolls.
#       The sign "⊇." means "is a superset of":
#       ( I LAUNCH SAMPLE(S) IN BACKGROUND) ⊇.
#       ( II LAUNCH ONLY ONE SAMPLE) ⊇.
#       ((III 1) GENERATE NODE_MODULES CACHE)
#           AND/THEN (III 2) EXECUTE SCRIPTS ./scripts/*.sh )) ⊇.
#       (IV WRAPPING EXECUTION OF ./scripts/*.sh
#           AND GENERATE NODE_MODULES STEPS)
#   * LOG FILE
#       * Prepare log files. Their name finished by local-travis.log
#       * The main function is createLogFile()
#       * Log files are created for each sample
#       * Used in functions generateNode_Modules_Cache() AND
#           launchOnlyOneSample()
#           i.e.. Generation of the node_module cache produce an log file,
#               each sample has its own log file.
#   * IV WRAPPING EXECUTION OF ./scripts/*.sh AND GENERATE NODE_MODULES STEPS
#       * Notes for function treatEndOfBuild().
#           * If there was an error during build, log file is renamed "errored".
#           Otherwise it is renamed "passed"
#           * When "skipClient= false",
#           Each node_modules takes 1.1 Go. To save disk space, at the and of
#           generation or testandbuild I symlink
#           ./samples/sample-name-sample/node_modules to
#       .   /samples/node_modules_cache-sample/node_modules
#           We must not use symlink during tests:
#           (see https://github.com/ng-bootstrap/ng-bootstrap/issues/2283)
#       * launchNewBash() who launch ./scripts/*.sh if previous step was
#           not errored.
#   * III 2) EXECUTE SCRIPTS ./scripts/*.sh
#       * functions generateProject() buildAndTestProject() who
#       launch scripts (see explanations in paragraph below).
#   * III 1) GENERATE NODE_MODULES CACHE
#       * Main function is generateNode_Modules_Cache() who generate
#       a single node_modules. Why this?
#       On my computer (JulioJu) I save 10 minutes of time for each sample.
#   * II LAUNCH ONLY ONE SAMPLE
#       * Could be seen as "MAIN" for:
#       `./build-samples.sh generate/buildandtest sample_name --consoleverbose' \
#           (three mandatory arguments)
#       * contains launchOnlyOneSample(),
#       the main function of this subtitle
#       * see explanations in paragrapher below
#   * I LAUNCH SAMPLE(S) IN BACKGROUND
#       * Could be seen as "MAIN" function for:
#       `./build-samples.sh generate/buildandtest \
#           [sample_name[,samle_name][,...]]' \
#               (one mandatory arguments + one optional arugments)
#       * contains launchSamplesInBackground(),
#       the main function of this subtitle
#       * This function launch one or several function launchOnlyOneSample()
#           in background.
#       * see explanations in paragrapher below
# MAIN
#   * Define global variables and constants.
#   * Argument parser


# More explanation about parameter `generate' and `buildandtest':
# * All code corresponding to parameters `generate' and `buildandtest'
# it's in this file under title
# GENERATE AND TEST SAMPLES `./BUILD-SAMPLES.SH GENERATE/BUILDANDTEST'
# Sequential explanation.
# 1. If ./samples/node_modules_cache-sample/node_modules_cache.*.passed.local-travis.log
#    doesn't exits, we trigger generateNode_Modules_Cache() to generate this
#    cache.
# 2. If we have three parameters
#    (e.g `./build-samples.sh generate ngx-default --consoleverbose') we trigger
#    function launchOnlyOneSample() in foreground.
#    * In this file we retrieve line who match "    JHIPSTER=ngx-default".
#    (we test in same time if this sample exists
#    under section "matrix" of ../.travis.yml).
#    * In this line, we retrieve its parameters if they are defined,
#    for example PROTRACTOR=1 and PROFILE=prod.
#    * If the second argument is `generate', we launch
#    only function generateProject().
#       It askes to launch `yarn test` in folder ../generator-jhipster
#           (corresponding to ./scripts/00-install-jhipster.sh)
#       It launches ./scripts/01-generate-entities.sh and
#           ./scripts/02-generate-project.sh
#    * If the second argument is `buildandtest', we launch
#    only function buildAndTestProject()
#    who launch function generateProject() and scripts ./scripts/04-tests.sh,
#    ./scripts/05-run.sh, ./scripts/06-sonar.sh.
# 3. If we have one parameters (e.g. `./build-samples.sh generate')
#    Or if we have two parameters
#       (e.g. `./build-samples.sh generate ngx-default,other_samples,...)
#    we trigger function launchSamplesInBackground().
#    This function retrieve lines in ../.travis.yml,
#    that match: "    JHIPSTER="
#    (e.g those under section matrix:)
#   * This function launches one or several functions launchOnlyOneSample()
#       in background, for each sample.
#   * `yarn test' in generator-jhipster is launched for sample 'ngx-default'

# TODO: {{{2
# ========
# TODO check if variables are properly unsetted in functions belong of a scope.
# In bash, inner functions belong same scope than outer function (we could
# see that with keyword "local"
# TODO tell to the original author of this script: don't use keyword "source"
# it launches script in current execution context. So exit 0 exit all!
# TODO check if all escapes of set -e with `command || commandIfFailure' are
# goode. Otherwise replace it by if statement.
# TODO add a test to check if we have enough size.
# TODO check https://google.github.io/styleguide/shell.xml
# TODO See others todo in this file.
#   See corresponding TODO in function generateProject().
# TODO too much echo /dev/fd/[34]. Factorize it, remove not useful.
# TODO do not printCommandAndEval() several times testRequierments in console.
# TODO replace all references of the name of this script by local
# me='$(basename "$0")'
# or "${BASH_SOURCE[0]}". (see reference of me in function usage()
# TODO java send to STDOUT and STDERR
# TODO actually there is collisions when we launch several builds in same time
#   they want all port 8080 and 9060.
# TODO escape ANSI codes and Maven download progress bar for logfile (or advise
#   Vim;-))
# TODO add option to minimize output in console when we generate and
#   testandbuild only one sample.
# TODO improve comments.
# TODO do not advaise to change ../.travis.yml, instead let option to
#   pass several samples in command line.
# TODO stop docker containers.
# TODO explain how to launch docker without sudo for linux users.

# PREPARE SCRIPT {{{1
# ==============================================================================
# ==============================================================================
# ==============================================================================
# ==============================================================================

# option -x for debug purpose.
# set -x
# # DO NOT REMOVE `set -e`
set -e
set -o nounset

# Treat end of script {{{2

function erroredAllPendingLog() {
    find -maxdepth 1 -name "*local-travis.log" -print0 | \
        while IFS= read -d '' -r file ; do
            if [[ "$file" == *".pending."* ]] ; then
                mv "$file" `sed 's/.pending./.errored./g' <<< "$file"`
            fi
        done
}

# Seems work if there is not several <CTRL-c>
# Do not add `sleep'!
trap ctrl_c INT
function ctrl_c() {
    cd "${JHIPSTER_TRAVIS}"
    erroredAllPendingLog
    # TODO ln -s all node_modules folders
    1>&2 echo "Exit by user."
    if [[ -e /dev/fd/4 ]] ; then
        1>&4 echo "Exit by user."
    fi
    exit 131
}

# Never raised with set -e
trap finish EXIT
function finish() {

    # https://en.wikipedia.org/wiki/Defensive_programming
    erroredAllPendingLog

    echo -e "\n\n\nIt's the end of ./build-samples.sh.\n\n"
}

# works for this type of command:
# echo hello | grep foo  # This is line number 9
trap 'errorInScript "$LINENO"' ERR
errorInScript() {
    1>&2 echo "In ./build-samples.sh, error on line: '$1'"
    cd "${JHIPSTER_TRAVIS}"
    exit 5
}

function exitScriptWithError() {
    1>&2 echo -e "\n\n$@" # print in stderr
    exit 10
}

# function printFileDescriptor3() {{{2
function printFileDescriptor3() {
    [[ -e /dev/fd/3 ]] && echo -e "\n""$@" | tee --append /dev/fd/3 \
        || echo -e "\n""$@"
}

# function printCommandAndEval() {{{2
function printCommandAndEval() {
    if [[ -e /dev/fd/3 ]] && \
        [[ -e /dev/fd/4 ]] ; then
        # See function launchSamplesInBackground()
        echo "${PS1}${@}" >> >(tee --append /dev/fd/3) 2>> >(tee --append /dev/fd/4)
        eval "$@" >> >(tee --append /dev/fd/3) 2>> >(tee --append /dev/fd/4)
    else
        echo "${PS1}${@}"
        # https://google.github.io/styleguide/shell.xml#Eval
        # says don't use eval. But doesn't work without.
        eval "$@"
    fi
}

# function confirmationUser() {{{2
function confirmationUser() {
    # empty stdin
    read -t 1 -n 10000 discard || echo ""
    echo
    local -i typeAnswer=1
    while [[ "$typeAnswer" -eq 1 ]] ; do
        read -p "$1" -n 1 -r
        case "$REPLY" in
            [Yy] ) echo "" ; eval "$2"; typeAnswer=1 ; break;;
            [Nn] ) if [[ ! -z "${3+x}" ]] ; then eval "$3" ; fi ;
                typeAnswer=0;;
            * ) echo -e "\nPlease answer "y" or "n"."; typeAnswer=1 ;;
        esac
        echo ""
    done
}

# PRINT HELP `./build-samples.sh help' {{{1
# ==============================================================================
# ==============================================================================
# ==============================================================================
# ==============================================================================

function usageClean() {
    local NODE_MODULE_SHORT_NAME='./samples/node_modules_cache-sample'
    echo -e "\n\n\`./build-samples.sh clean'\n" \
        "—————————————————————————————————————\n" \
        "—————————————————————————————————————\n" \
        "1) Before each new build, ./sample/[sample-name]-sample " \
        "is systematically erased, contrary to " \
        "'${NODE_MODULE_SHORT_NAME}'.\n" \
        "2) Actually '${NODE_MODULE_SHORT_NAME} takes more " \
        "than 1 Go\n" \
        "3) After a build, [sample-name]-sample/node_modules is a" \
        "symbolic link. " \
        "Therefore, a folder [sample-name]-sample doesn't take" \
        "lot of size (just some megabytes)\n"
}

# Executed when the first argument of the script is "usage" or when there isn't
# argument who match.
# ====================
function usage() {
    local me=$(basename "$0")
    local list_of_samples=`cut -d ' ' -f 1 <<< "$TRAVIS_DOT_YAML_PARSED"`

    echo -e "\n\nScript than emulate well remote Travis CI build " \
        " https://travis-ci.org/jhipster/generator-jhipster.\n"

    echo -e "\nSynopsis: \n" \
        "'$me' \n" \
        "\tgenerate [ \n" \
            "\t\tsample_name [--consoleverbose] \n" \
            "\t\t | sample_name[,sample_name][,...] \n" \
        "\t\t]\n" \
        "\tbuildandtest [ \n" \
            "\t\tsample_name [--consoleverbose] \n" \
            "\t\t | sample_name[,sample_name][,...] \n" \
        "\t\t]\n" \
        "\tclean\n" \
        "\thelp\n\n" \
    " \`./build-samples.sh generate/buildandtest'\n" \
        "—————————————————————————————————————\n" \
        "—————————————————————————————————————\n" \
        "* They will create the travis sample project under the './samples'" \
        "folder with folder name \`[sample_name]-sample'." \
        "* 'generate' generate only a JHipster project with entities. " \
            "It will ask you if you want execute \`yarn test' in" \
            "the folder generate-project before launch generation.\n" \
            "You will can open this application in your " \
            "editor or IDE to check it further." \
        "* 'buildandtest' generate then test project(s), as Travis CI.\n" \
    "  * Without optional parameter, 'generate', and 'buildandtest' " \
            "operate for all samples listed below.\n" \
    "  * Arguments 'generate', 'buildandtest' could be apply for " \
            "one sample_name below.\n" \
    "  * For each sample, an independant log file is created. During" \
            "built time, its name contains 'pending'. " \
            "If there is a fail, its name" \
            "will contain 'errored'. If it finishes with success, its name" \
            "will contain 'passed'\n" \
    "   * When all samples are launched, there are launched in parralel." \
            "The program will ask you how much you want" \
            "launch in same time\n " \
        "* Before launch this commands, type \`yarn link' in the folder" \
            "./genertor-jhipster. Now you will test this generator, and not" \
            "the npm genertor-jhipster." \
    "\n\n'[sample_name]' could be:\n" \
    "——————————————————\n" \
    "${list_of_samples}\n\n" \
    "* Use always \`./build-samples.sh buildandtest ngx-default' " \
            "(the more complete test). " \
            "Useful for test Server side and Angular client.\n" \
    "  * If you work on the React client try the previous and also " \
            "\`./build-samples.sh buildandtest react-default\n" \
    "  * If you work on an other functionality, chose the corresponding one\n" \
    "Name of samples indicate their test goal. They have different application"\
    "configurations (defined in '.yo-rc.json') and different entity" \
    "configurations (defined in the folder .jhipster of a " \
    "'./scripts/sample-name-sample' folder)."

    usageClean

    echo -e "\nExamples:\n" \
        "—————————————————————————————————————\n" \
        "—————————————————————————————————————\n" \
    "\`$ ./build-samples.sh generate ngx-default' " \
        "=> generate a new project at travis/samples/ngx-default-sample\n" \
    "\`$ ./build-samples.sh generate ngx-default --consoleverbose' " \
        "=> all is printed in the console (thanks \`--consoleverbose' lot of logs, not advise)\n" \
    "\`$ ./build-samples.sh buildandtest ngx-default' " \
        "=> generate a new project at travis/samples/ngx-default-sample " \
            "then build and test it.\n" \
    "\`$ ./build-samples.sh generate' =>" \
        " generate all travis/samples/*-sample corresponding of " \
        " samples listed above.\n" \
    "\`$ ./build-samples.sh generate ngx-default,react-default' =>" \
        " generate \`ngx-default' and \`react-default'.\n"  \
        " samples listed above.\n" \
    "\`$ ./build-samples.sh buildandtest' => generate build and test all " \
        "travis/samples/*-sample corresponding of samples listed above.\n" \
    "\`$ ./build-samples.sh clean' " \
        "=> delete all folders travis/samples/*-sample\n" \
        "=> delete especially the node_modules cache " \
        "(samples/node_modules_cache-sample) to sanitize.\n" \
    "\`$ ./build-samples.sh help' => display this help\n" \
    "\nNotes:\n" \
    "—————————————————————————————————————\n" \
    "—————————————————————————————————————\n" \
    "Note1: We recommand to use Node.Js LTS. Check if you use it.\n" \
    "Note2: for tests with a client (ngx-*, react-*): " \
    "each node_modules takes actually " \
    "(version 5) 1.1 Go." \
    "A symbolic link (symlink) is done at the end of this script between" \
    "./samples/node_modules_cache-sample/node_modules and" \
    "./samples/[sample-name]-sample/node_modules to preserve disk space." \
    "You could open this sample on your IDE without complains concerning" \
    "missing library. However, actually you can't parform tests in it. This" \
    "script copy node_modules folder from node_modules_cache-sample before" \
    "perform tests, and symlink again at the end of the test." \
    "\`yarn install' isn't perform before test to increase speed". \
    "\n\nJust remind of sample_name:\n" \
    "——————————————————\n" \
    "——————————————————\n" \
    "${list_of_samples}\n"

    exit 0
}

# CLEAN SAMPLES `./build-samples.sh/ clean' {{{1
# ==============================================================================
# ==============================================================================
# ==============================================================================
# ==============================================================================

# Executed when the first argument of the script is "clean", without a second
# argument
# ====================

# Executed when the first argument of the script is "clean", without second
# argument
function cleanAllProjects() {

    usageClean
    echo -e "4) Do not forget to read \`./build-samples.sh help'\n"

    local confirmationFirstParameter=`echo -e "Warning: " \
        "are you sure to delete " \
        "all samples/*-sample [y/n]? "`
    confirmationUser "$confirmationFirstParameter" \
        'echo ""' \
        'exitScriptWithError "ABORTED."'
    unset confirmationFirstParameter

    local foldersSample=$(find "$JHIPSTER_SAMPLES" -maxdepth 1 \
        -type d -name "*-sample")
    if [[ "$foldersSample" == "" ]] ; then
        echo -e "\n\n*********************** No folder ./samples/*-sample to " /
        "delete \n"
    fi

    while IFS=$'\n' read -r dirToRemove ; do
            echo -e "\n\n*********************** Deleting '$dirToRemove'\n"
            rm -Rf "$dirToRemove"
    done <<< "$foldersSample"

    local NODE_MODULE_SHORT_NAME='./samples/node_modules_cache-sample'

    echo -e "\nNote: We are sure than '${NODE_MODULE_SHORT_NAME}' " \
        "doesn't  exists:\n     ==> you could launch a sanitzed new build.\n"
}

# GENERATE AND TEST SAMPLES `./build-samples.sh generate/buildandtest' {{{1
# ==============================================================================
# ==============================================================================
# ==============================================================================
# ==============================================================================
# function echoTitleBuildStep() {{{3
function echoSmallTitle() {
    local ELAPSED=`echo -e "Elapsed: $(($SECONDS / 3600))" \ "hrs " \
        "$((($SECONDS / 60) % 60)) min " \
        "$(($SECONDS % 60))sec"`
    echo -e "\n\n\n" \
        "\n'$@'" \
        "(`date +%r`, '$ELAPSED')\n" \
        "================================================================" \
        "\n"
    unset ELAPSED
}

# function echoTitleBuildStep() {{{3
function echoTitleBuildStep() {
    # Echo in STDOUT
    local ELAPSED=`echo -e "Elapsed: $(($SECONDS / 3600))" \ "hrs " \
        "$((($SECONDS / 60) % 60)) min " \
        "$(($SECONDS % 60))sec"`
    echo -e "\n" \
        "================================================================" \
        "================================================================" \
        "================================================================" \
        "\n'$@'" \
        "(`date +%r`, '$ELAPSED')\n" \
        "================================================================" \
        "================================================================" \
        "================================================================" \
        "\n"

    # ECHO in console:
    # 1. if console is branched to /dev/fd/3 (see launchSamplesInBackground())
    # 2. if we are not in function generateNode_Modules_Cache().
    # Always false if we launch this script with two arguments, like:
    # `./build-samples.sh generate ngx-default'
    if [[ -e /dev/fd/3 ]] ; then
        1>&3 echoSmallTitle "$@"
    fi
}

# TEST REQUIERMENTS  {{{2
# ====================
# ====================

# I suppose ipoute 2 is installed on main linux distro.
# function testIfPortIsFreeWithSs() {{{3
# TODO BIG WARNING
function testIfPortIsFreeWithSs() {
    ss -nl | grep "$1" 1>> /dev/null \
        && errorInBuildExitCurrentSample "FATAL ERROR: " \
        "port '$1' is busy. Please stop the software who uses it" \
        "(\`sudo ss -nap | grep '$1'' to know it)" || \
        printFileDescriptor3 "Port '$1' is free."
}

# function testRequierments() {{{3
function testRequierments() {
    # Why "nodejs --version"? For Ubuntu users, please see
    # https://askubuntu.com/a/521571"
    echo -e "\n\n"

    printCommandAndEval "node --version" \
        || printCommandAndEval "nodejs --version" \
        || errorInBuildExitCurrentSample "FATAL ERROR: please install Node. " \
        "If Node is already installed, please add it in your PATH."
    echo "We recommand to use Node.Js LTS. Check if you use it."
    echo

    printCommandAndEval "yarn -v" \
        || errorInBuildExitCurrentSample "FATAL ERROR: please install Yarn. " \
        "If Yarn is already installed, please add it in your PATH."
    echo

    # java send question of this version to stderr. Redirect to stdout.
    printCommandAndEval "java -version 2>&1" || \
        errorInBuildExitCurrentSample "FATAL ERROR: please install java."
    echo

    # java send question of this version to stderr. Redirect to stdout.
    printCommandAndEval "javac -version 2>&1" || errorInBuildExitCurrentSample \
        "FATAL ERROR: please install JDK. "
    echo

    javaVersion="$(java -version 2>&1)"
    grep "OpenJDK" <<< "$javaVersion" && errorInBuildExitCurrentSample \
        'FATAL ERROR: do not use OpenJDK, please install Oracle Java.'
    echo
    # TODO SHOULD WE ADD TEST TO CHECK IF WE ARE ON JDK8?

    command -v jhipster --version 1>> /dev/null || \
        errorInBuildExitCurrentSample \
        "FATAL ERROR: please install JHipster globally. " \
        "(\`$ yarn global install jhipster') " \
        "If JHipster is already installed, please add it in your PATH."
    echo

    if [[ "$isBuildAndTest" -eq 1 ]] ; then

        if uname -a | grep -i darwin 1>> /dev/null ; then
            printCommandAndEval \
                "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome\
                --version" \
            || printCommandAndEval \
                "/Applications/Chromium.app/Contents/MacOS/Chromium \
                --version" \
            || errorInBuildExitCurrentSample "FATAL ERROR: please install" \
                "Google Chrome or Chromium." \
        else
            # For Linux or BSD
            printCommandAndEval "google-chrome-stable --version" \
                || printCommandAndEval "chromium --version" \
                || errorInBuildExitCurrentSample "FATAL ERROR: " \
                "please install google-chrome-stable or chromium. " \
                "If google-chrome-stable or chromium is already installed, "\
                "please add it in your PATH".
        fi

        local -i skipDockerTests=0
        if [[ "$skipDockerTests" -eq 0 ]] ; then
            printCommandAndEval "docker --version" || \
                (errorInBuildExitCurrentSample \
                "FATAL ERROR: please install docker and start the service. " \
                && skipDockerTests=1)
            echo

            printCommandAndEval "docker-compose --version" || \
                (errorInBuildExitCurrentSample \
                "FATAL ERROR: please install docker-compose. " && skipDockerTests=1)
            echo
        fi

        if [[ "$skipDockerTests" -eq 0 ]] && \
            command -v systemctl --version 1>> /dev/null 2>&1 ; then
                systemctl is-active docker.service 1>> /dev/null 2>&1 \
                    ||  (errorInBuildExitCurrentSample "FATAL ERROR: please " \
                    "launch docker service" \
                    "(\`sudo systemctl start docker.service')" && \
                    skipDockerTests=1)
        fi

        if [[ "$skipDockerTests" -eq 0 ]] ; then
            command -v docker info 1>> /dev/null || \
                errorInBuildExitCurrentSample "\nFATAL ERROR: " \
                "please manage docker as a non-root user (" \
                "see https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user" \
                "– don't forget to restart your computer after this " \
                "configuration).\n" \
                "Do not forget to start the docker service."
        fi

        # TODO I not test all ports in
        # ../generators/server/templates/src/main/docker
        # because I'm afraid: it could fail too often!
        # And if it fail too often, nobody will use this script
        # For a simple test for ngx-default, it's not mandotory
        # to check all!
        if command -v ss 1>> /dev/null ; then
            testIfPortIsFreeWithSs 8080
            testIfPortIsFreeWithSs 8081
            testIfPortIsFreeWithSs 3636
            testIfPortIsFreeWithSs 27017
            testIfPortIsFreeWithSs 5432
            testIfPortIsFreeWithSs 9000
        else
            # TODO add tests for other tools
            printFileDescriptor3 "WARNING: could not test if ports" \
                "8080 8081 3636 27017 5432 9000 are free. " \
                "This build could fail if this ports are not free." \
                "Especially, do not forget to shutdown mysql service, " \
                "postgresql service or mongodb service."
            sleep 30
        fi
    fi

}

# LOG FILE AND REDIRECTION OF STDOUT/STDERR {{{2
# ====================
# ====================

# function printInfoBeforeLaunch() {{{3
function printInfoBeforeLaunch() {
    printFileDescriptor3 "\n\n* Your log file will be '$LOGFILENAME'\n" \
        "* When build will finish, The end of this filename shoule be renamed" \
        "'errored' or 'passed'.\n" \
        "* On this file lines started by '$PS1' are bash" \
        "command. Useful to know which command fail.\n" \
        "* See progress in this file. Do not forget to refresh it!"
    # Test if we launch not this function in generateNode_Modules_Cache().
    # True if launched from functions generateProject() and
    # buildAndTestProject().
    if [[ -z "${isGenerationOfNodeModulesCache+x}" ]] ; then
        # echo constants used in ./scripts/*.sh
        printFileDescriptor3 "LOGFILENAME='$LOGFILENAME'" \
                "(variable not used in ./travis/script/*.sh." \
                "The end of this filename shoule be renamed errored or passed" \
                "at the end of this script)\n" \
            "JHIPSTER_MATRIX='$JHIPSTER_MATRIX'" \
                "(variable not used in ./travis/script/*.sh)\n" \
            "JHIPSTER='$JHIPSTER'\n" \
            "PROFILE='$PROFILE'\n" \
            "PROTRACTOR='$PROTRACTOR'\n" \
            "RUN_APP='$RUN_APP'\n" \
            "JHIPSTER_TRAVIS='$JHIPSTER_TRAVIS'\n" \
            "JHIPSTER_SAMPLES='$JHIPSTER_SAMPLES'\n" \
            "JHIPSTER_SCRIPTS='$JHIPSTER_SCRIPTS'\n" \
            "APP_FOLDER='$APP_FOLDER'\n" \
            "UAA_APP_FOLDER='$UAA_APP_FOLDER'\n" \
            "SPRING_OUTPUT_ANSI_ENABLED='$SPRING_OUTPUT_ANSI_ENABLED'\n" \
            "SPRING_JPA_SHOW_SQL='$SPRING_JPA_SHOW_SQL'\n\n"
    fi
}

# function createlogfile() {{{3
function createLogFile() {

    cd "${JHIPSTER_TRAVIS}"
    touch "$LOGFILENAME" || exitScriptWithError "FATAL ERROR: could not " \
        "create '$LOGFILENAME'"

    if [[ "$isLaunchSamplesInBackground" -eq 0 ]] ; then
        echoSmallTitle "Create log file and save output in '${LOGFILENAME}'"
        exec 1>> >(tee --append "${LOGFILENAME}") 2>&1
    else
        # save the originals descriptor (stdout to console and stderr to console).
        exec 3>&1 4>&2
        echoSmallTitle "Create log file and redirect output in '${LOGFILENAME}'"
        exec 1>> "${LOGFILENAME}" 2>> "${LOGFILENAME}"
    fi
    # Otherwise folowing command is started before function createLogFile is
    # finished.
    sleep 5
    echoTitleBuildStep "\n\n'${JHIPSTER_MATRIX}' is launched!!"
    printInfoBeforeLaunch
    testRequierments
}

# IV WRAPPING EXECUTION OF ./scripts/*.sh AND GENERATE NODE_MODULES STEPS {{{2
# ====================
# ====================

# function restoreSTDERRandSTDOUTtoConsole() {{{3
function restoreSTDERRandSTDOUTtoConsole() {
    # Restore the originals descriptors.
    # Behaviour changed in function launchSamplesInBackground()
    if [[ -e /dev/fd/3 ]] ; then
        exec 1>&3
        3<&-
    fi
    if [[ -e /dev/fd/4 ]] ; then
        exec 2>&4
        4<&-
    fi

}

# function treatEndOfBuild() {{{3
function treatEndOfBuild() {
    # TODO treat for REACT. React has its own node_modules.
    # React should not be symlinked.

    echoTitleBuildStep "Finishing '$JHIPSTER_MATRIX'"

    # Let time, in case of the disk isn't flushed, or if there is
    # java or node background processes not completly finished.
    # Should not be necessary.
    sleep 10

    # TODO improve it. Actually, kill all docker commands. Not cool!
    IFS=$' ' read -ra dockerContainers <<< `docker ps -q`
    # If `docker ps -q` is empty, "${#dockerContainers[0]}" takes value 1.
    if [[ "${#dockerContainers[0]}" -gt 1 ]] ; then
        # Don't use `for' syntax:
        # for i in ${dockerContainers[@]} ; do
        #     printCommandAndEval docker kill "$i" || exitScriptWithError \
        #         "FATAL ERROR: couldn't kill docker container '$i'"
        # done
        local -i i=0
        while [[ i -lt "${#dockerContainers[*]}" ]] ; do
            printCommandAndEval docker kill "${dockerContainers[i]}" \
                || exitScriptWithError \
                "FATAL ERROR: couldn't kill docker container " \
                "'${dockerContainers[i]}'"
            i=$((i+1))
        done
    fi

    if [[ "$ERROR_IN_SAMPLE" -eq 0 ]] ; then
        local logrenamed="${beginLogfilename}"".passed.""${endofLogfilename}"
    else
        local logrenamed="${beginLogfilename}"".errored.""${endofLogfilename}"
    fi

    printCommandAndEval mv "${LOGFILENAME}" "${logrenamed}"

    # Test if we launch not this function in generateNode_Modules_Cache().
    # True if launched from functions generateProject() and
    # buildAndTestProject().
    if [[ -z "${isGenerationOfNodeModulesCache+x}" ]] ; then
        sleep 2
        if ! isSkipClientInFileYoRcDotConf ; then
            # Because node_modules takes 1.1 Go ! Too much !
            if [[ "$JHIPSTER" != *"react"* ]] ; then
                printCommandAndEval "rm -Rf '${APP_FOLDER}/node_modules'"
                printCommandAndEval ln -s \
                    "${NODE_MODULES_CACHE_ANGULAR}/node_modules" \
                    "${APP_FOLDER}"
            fi
        fi
    else
        if [[ "${ERROR_IN_SAMPLE}" -eq 0 ]] ; then
            cp "${logrenamed}" "${NODE_MODULES_CACHE_SAMPLE}"
        else
            exit 200
        fi
    fi

    if [[ "$isLaunchSamplesInBackground" -eq 1 ]] ; then
        restoreSTDERRandSTDOUTtoConsole
    fi

    unset logrenamed
}

# function errorInBuildStopCurrentSample() {{{3
function errorInBuildStopCurrentSample() {

    local ELAPSED=`echo -e "Elapsed: $(($SECONDS / 3600))" \ "hrs " \
        "$((($SECONDS / 60) % 60)) min " \
        "$(($SECONDS % 60))sec"`
    if [[ -e /dev/fd/4 ]] ; then
        1>&2 echo "$@. Error in '$JHIPSTER_MATRIX' at `date +%r`" \
            "(elapsed: '$ELAPSED')" \
            >> >(tee --append /dev/fd/2 /dev/fd/4 >> /dev/null)
    else
        1>&2 echo "$@. Error in '$JHIPSTER_MATRIX' at `date +%r`" \
            "(elapsed: '$ELAPSED')"
    fi
    unset ELAPSED

    # Thanks this variable set to 1
    # 1. function launchNewBash() will not launch new ./scripts/*.sh
    # 2. function treatEndOfBuild() will rename the log file with word "errored"
    #
    ERROR_IN_SAMPLE=1

    # Do not exit, otherwise we stop this script!
    # exit 15
    # Do not return something > 0 caused of `set -e'
    return 0
}

# errorInBuildExitCurrentSample() {{{2
errorInBuildExitCurrentSample() {
    if [[ ! -z ${JHIPSTER+x} ]] && \
        [[ ! -z ${JHIPSTER_MATRIX+x} ]]; then
        errorInBuildStopCurrentSample "$@"
        treatEndOfBuild
        exit 80
    else
        # For function testRequierments() launched in function
        # launchSamplesInBackground()
        exitScriptWithError "$@"
    fi
}

# function isSkipClientInFileYoRcDotConf() {{{3
# test if skipClient=true in ./samples/"$JHIPSTER"/.yo-rc.conf
function isSkipClientInFileYoRcDotConf() {
    pushd "$JHIPSTER_SAMPLES/""$JHIPSTER"
    [[ $(grep -E '"skipClient":\s*true' .yo-rc.json) ]] && \
        return 0 || \
        return 1
    popd
}

# function yarnLink() {{{3
function yarnLink() {
    cd "$APP_FOLDER"
    echoTitleBuildStep "yarn link"
    yarn init -y
    command yarn link "generator-jhipster" || \
        errorInBuildExitCurrentSample "FATAL ERROR: " \
            "you havn't executed \`yarn link' in a folder " \
            "named 'generator-jhipster'. " \
            "Please read https://yarnpkg.com/lang/en/docs/cli/link/."
    local GENERATOR_JHIPSTER_FOLDER="`pwd`/node_modules/generator-jhipster"
    ls -la "$GENERATOR_JHIPSTER_FOLDER"
    # Test if `yarn link' is correct
    cd -P "${JHIPSTER_TRAVIS}/.."
    local JHIPSTER_TRAVISReal=`pwd -P`
    cd "$GENERATOR_JHIPSTER_FOLDER"
    local GENERATOR_JHIPSTER_FOLDER_REAL=`pwd -P`
    if [ "$JHIPSTER_TRAVISReal" != "$GENERATOR_JHIPSTER_FOLDER_REAL" ] ; then
        errorInBuildExitCurrentSample "FATAL ERROR: " \
            "'$JHIPSTER_TRAVISReal and '$GENERATOR_JHIPSTER_FOLDER_REAL' " \
            "are not the same folders"
    else
        echo "Command \`yarn link' seems corect."
    fi
    unset GENERATOR_JHIPSTER_FOLDER JHIPSTER_TRAVISReal
}

# function launchNewBash() {{{3
function launchNewBash() {
    local pathOfScript="$1"
    local print="$2"
    # "$JHIPSTER" argument is used only to know which build is launched.
    # It's only a marker for when we call "ps -C bash. The argument "$1"
    # is not readden in any ./scripts/*.sh

    echoTitleBuildStep "$2" "('$1')"
    # If there is an error raised, in function errorInBuildStopCurrentSample()
    # "$ERROR_IN_SAMPLE" takes a value of 1. Initialized to 0 in function
    # launchOnlyOneSample() or generateNode_Modules_Cache()
    if [[ "${ERROR_IN_SAMPLE}" -eq 0 ]] ; then
        cd "${JHIPSTER_TRAVIS}"
        set +e
        time bash "$pathOfScript" "$JHIPSTER"
        if [[ $? -ne 0 ]] ; then
            errorInBuildStopCurrentSample "'$pathOfScript' finished with error."
        fi
        set -e
    else
        # tee print in stdout (either logfile or console) and /dev/fd/4
        # for /dev/fd/4 see function launchSamplesInBackground()
        if [[ -e /dev/fd/4 ]] ; then
            1>&2 echo -e "SKIP '${2}' cause of previous error." \
                >> >(tee --append /dev/fd/2 /dev/fd/4 1>> /dev/null)
        else
            1>&2 echo -e "SKIP '${2}' cause of previous error."
        fi
    fi
    unset pathOfScript
}

# III 2) EXECUTE SCRIPTS ./scripts/*.sh {{{2
# ====================
# ====================

# function doesItTestGenerator() {{{3
function doesItTestGenerator() {
    local confirmationFirstParameter=`echo -e "Do you want execute " \
        "\\\`yarn test' in " \
        "generator-jhipster '$1'? [y/n] "`
    confirmationUser "$confirmationFirstParameter" \
        "TESTGENERATOR=1 ; \
        echo Generator test will be test later." \
        "TESTGENERATOR=0 ; echo -e '\n\nSKIP test generator.\n'"
    unset confirmationFirstParameter
}

# function generateProject() {{{3
# Executed when the first argument of the script is "generate" and
# "buildandtest"
# ====================
# Corresponding of the entry "install" in ../.travis.yml
function generateProject() {

    # `./build-samples.sh generate', confirmationUser
    # if he wants test it.
    # `./build-samples.sh generate/buildandtest sample-name', confirmationUser
    # if he wants test it.
    if ([[ "${TESTGENERATOR}" -eq 1 ]] && \
        [[ "${isLaunchSamplesInBackground}" -eq 0 ]] ) || \
        ( [[ "${TESTGENERATOR}" -eq 1 ]] && \
        [[ "$isLaunchSamplesInBackground" -eq 1 ]] && \
        [[ "${JHIPSTER}" == "ngx-default"  ]] )
    then
        # Corresponding to "Install and test JHipster Generator" in
        # ./scripts/00-install-jhipster.sh
        echoTitleBuildStep "\\\`yarn test' in generator-jhipster"
        cd -P "$JHIPSTER_TRAVIS"
        echo "We are at path: '`pwd`'".
        echo "Your branch is: '$BRANCH_NAME'."
        # TODO should we add yarn install?

        set +e
        yarn test
        if [[ $? -ne 0 ]] ; then
            errorInBuildStopCurrentSample \
                "Fail during test of the Generator." \
                " (command 'yarn test' in `pwd`)"
        fi
        set -e

    fi
    # Script below is done with code above.
    # launchNewBash "./scripts/00-install-jhipster.sh" \
    #     "Install JHipster"

    launchNewBash "./scripts/01-generate-entities.sh" \
        "Copying entities for '$APP_FOLDER'"
    launchNewBash "./scripts/02-generate-project.sh" "Building '$APP_FOLDER'"
    # Do not run command below for this script (this script is only for Travis)
    # launchNewBash "./scripts/03-replace-version-generated-project.sh" \
    #     "Replace version generated-project'"

}



# function buildAndTestProject() {{{3
# Executed when the first argument of the script is "buildandtest"
# ====================
function buildAndTestProject() {

    # GENERATE PROJECT
    # ====================
    # Corresponding of the entry "install" in ../.travis.yml
    generateProject

    # BUILD AND TEST
    # ====================
    # Corresponding of the entry "script" in .travis.yml
    launchNewBash "./scripts/03-docker-compose.sh" \
       "Start docker container-compose.sh for '${JHIPSTER}'"
    launchNewBash "./scripts/04-tests.sh"  "Testing '${JHIPSTER}-sample'"
    launchNewBash "./scripts/05-run.sh" "Run and test '${JHIPSTER}-sample'"
    launchNewBash "./scripts/06-sonar.sh" \
        "Launch Sonar analysis for '${JHIPSTER}'"

}

# III 1) GENERATE NODE_MODULES CACHE {{{2
# ====================
# ====================

function generateNode_Modules_Cache() {

    echoSmallTitle "Check node_modules cache"

    # Save JHIPSTER_MATRIX
    if [[ "$isLaunchSamplesInBackground" -eq 0 ]] ; then
        JHIPSTER_MATRIX_SAVED=${JHIPSTER_MATRIX}
    fi
    # Used in functions errorInBuildExitCurrentSample() and createLogFile()
    local JHIPSTER_MATRIX="${NODE_MODULES_CACHE_SAMPLE}"

    # Display stderr on terminal.
    local beginLogfilename="${NODE_MODULES_CACHE_SAMPLE}"/node_modules_cache
    local endofLogfilename="passed.angular.local-travis.log"
    if ls "$beginLogfilename".*."$endofLogfilename" 1> /dev/null 2>> /dev/null
    then
        # TODO
        # Test if package.json.ejs has changed remotly for the last
        # generation of node_modules
        echo -e "A file named" "$beginLogfilename"".*.""$endofLogfilename" \
            "was found." \
            "\n\nBE CARREFUL LOCAL BUILD SAMPLES " \
            "USE CACHED NODE_MODULES\n." \
            "So if you done a \`git pull' " \
            "or if you modifiy something relative to \`package.json', " \
            "you could not see bugs\n. " \
            "To refresh cache, simply run \`./build-samples.sh clean'"
        return 0
    else
        echo "No node_modules cache founded. It must be generated first."
    fi
    unset beginLogfilename endofLogfilename
    rm -Rf "${NODE_MODULES_CACHE_SAMPLE}"

    local -i ERROR_IN_SAMPLE=0
    local APP_FOLDER="${NODE_MODULES_CACHE_ANGULAR}"

    local -i isGenerationOfNodeModulesCache=1

    time {

        local shortDate=`date +%m-%dT%H_%M`
        local beginLogfilename=`echo -e \
            "${JHIPSTER_TRAVIS}"/node_modules_cache."${shortDate}"`
        local endofLogfilename="angular.local-travis.log"
        local LOGFILENAME="${beginLogfilename}".pending."${endofLogfilename}"

        createLogFile

        rm -Rf "${APP_FOLDER}"
        mkdir -p "$APP_FOLDER"/
        cd "${APP_FOLDER}"
        yarnLink

        echoTitleBuildStep "JHipster generation."
        cp "${JHIPSTER_SAMPLES}/node_modules_cache/angular/.yo-rc.json" \
            "${NODE_MODULES_CACHE_ANGULAR}" || \
            errorInBuildExitCurrentSample "FATAL ERROR: not a JHipster project."
        cd "${NODE_MODULES_CACHE_ANGULAR}"
        local jhipstercommand="jhipster --force --no-insight --skip-checks \
            --with-entities --skip-git --skip-commit-hook"
        printFileDescriptor3 "$jhipstercommand"
        eval "$jhipstercommand"

        treatEndOfBuild
    }

    if [[ "$isLaunchSamplesInBackground" -eq 0 ]] ; then
        unset JHIPSTER_MATRIX
        declare -g JHIPSTER_MATRIX=${JHIPSTER_MATRIX_SAVED}
    fi
}

# II LAUNCH ONLY ONE SAMPLE {{{2
# ====================
# ====================

# function retrieveVariablesInFileDotTravisSectionMatrix() {{{3
function retrieveVariablesInFileDotTravisSectionMatrix() {

    export JHIPSTER=`cut -d ' ' -f 1 <<< "$JHIPSTER_MATRIX"`

    # PROFILE AND PROTRACTOR REDEFINITION
    # Retrieve ../.travis.yml, section matrix
    # `cut -s', because otherwise display first column. Other `cut` should not
    # have this option, for this reason (we want display the first column,
    # even if there isn't several columns.
    local travisVars=`cut -s -d ' ' -f 2- <<< "$JHIPSTER_MATRIX"`
    if [[ ! -z "${travisVars+x}" ]] ; then
        # Do not escape with quotes $travisVars, because rightly we  want
        # word spliting!
        IFS=$' ' export $travisVars > /dev/null
    fi

    # Should never be raised because we check ../.travis.yml.
    # Maybe in case of the user delete all folders sample!
    if [ ! -f "$JHIPSTER_SAMPLES/""$JHIPSTER""/.yo-rc.json" ]; then
        exitScriptWithError "FATAL ERROR: not a JHipster project."
    fi

}


# function createFolderNodeModulesAndLogFile() {{{3
function createFolderNodeModulesAndLogFile() {
    if ! isSkipClientInFileYoRcDotConf ; then

        if [[ "$isLaunchSamplesInBackground" -eq 0 ]] ; then
            generateNode_Modules_Cache
        # else; done in function launchSamplesInBackground()
        fi

        createLogFile

        # TODO make for react
        if [[ "$JHIPSTER" != *"react"* ]] ; then
            echoTitleBuildStep \
                "Copy '$NODE_MODULES_CACHE_ANGULAR/node_modules' to" \
                "'$APP_FOLDER'"
            # No `ln -s' due to
            # https://github.com/ng-bootstrap/ng-bootstrap/issues/2283
            # But `cp -R' works good ! ;-) ! Probably more reliable.
            cp -R "${NODE_MODULES_CACHE_ANGULAR}/node_modules" \
                "${APP_FOLDER}"
        else
            errorInBuildExitCurrentSample "FATAL ERROR: script not implemented" \
            "for React"
        fi
        # Even if there is already a correct symlink, we must launch it again.
        yarnLink
    else
        createLogFile
        yarnLink
        yarn install
    fi
}

# function launchOnlyOneSample() {{{3
function launchOnlyOneSample() {

    # define JHIPSTER, and redifine if necessary PROFIL and PROTRACTOR
    # If "$isLaunchSamplesInBackground -eq 0", test if the second argument
    # of command line is correct.
    retrieveVariablesInFileDotTravisSectionMatrix

    # if "$isLaunchSamplesInBackground" -eq 1
    # doesItTestGenerator is done in
    # function launchSamplesInBackground()
    if [[ "$isLaunchSamplesInBackground" -eq 0 ]] ; then
        export APP_FOLDER="${JHIPSTER_SAMPLES}/""${JHIPSTER}""-sample"
        local -i TESTGENERATOR=1
        doesItTestGenerator "before generate the project".
        if [[ -e "$APP_FOLDER" ]] ; then
            local confirmationFirstParameter=`echo -e  \
                "Warning: '${APP_FOLDER}' exists. Do you want delete it?" \
                "[y/n] "`
            local argument="ABORTED: rename this folder, then restart script."
            local execInfirmed="errorInBuildStopCurrentSample '$argument'"
            confirmationUser "$confirmationFirstParameter" \
                "rm -rf '${APP_FOLDER}'; mkdir -p '$APP_FOLDER'" \
                "echo '$execInfirmed'"
            unset confirmationFirstParameter confirmationFirstParameter
            unset argument
        else
            mkdir -p "$APP_FOLDER"
        fi
    else
        # Defined "$APP_FOLDER" as explained in the MAIN section of this file.
        export APP_FOLDER="${JHIPSTER_SAMPLES}/""${JHIPSTER}""-sample"
        rm -rf "${APP_FOLDER}"
        mkdir -p "$APP_FOLDER"/
    fi

    # Used in function launchNewBash() to test if we must continue the script.
    # If an error occure in ./scripts/*.sh, in function
    # errorInBuildStopCurrentSample() the value of this variable is changed to
    # 1.
    local -i ERROR_IN_SAMPLE=0

    time {

        # Instantiate LOGFILENAME
        local beginLogfilename=`echo -e \
            "${JHIPSTER_TRAVIS}"/"${BRANCH_NAME}"."${DATEBININSCRIPT}"`
        local endofLogfilename=`echo -e "${JHIPSTER}"".local-travis.log"`
        local LOGFILENAME="${beginLogfilename}"".pending.""${endofLogfilename}"
        createFolderNodeModulesAndLogFile

        cd "${APP_FOLDER}"

        local oldPATH="${PATH}"
        export PATH="${APP_FOLDER}"/node_modules:"$PATH"
        if [[ "$isBuildAndTest" -eq 1 ]] ; then
            buildAndTestProject
        else
            generate
        fi
        PATH="${oldPATH}"
        unset oldPATH

    }

    treatEndOfBuild
    # do not unset beginLogfilename and endofLogfilename, unsed in another
    # function
}

# I LAUNCH SAMPLE(S) IN BACKGROUND {{{2
# ====================
# ====================

# function wrapperLaunchScript() {{{3
function wrapperLaunchScript() {
    # Display stderr on terminal.
    echoTitleBuildStep \
        "'${JHIPSTER_MATRIX}' is launched in background!"
    launchOnlyOneSample || echo "ERROR IN '${JHIPSTER_MATRIX}'"
    echoTitleBuildStep "End of '$JHIPSTER_MATRIX'" ;
    return 0
}

# function launchSamplesInBackground() {{{3
function launchSamplesInBackground() {

    local -i TESTGENERATOR=1

    if [[ "$isBuildAndTest" -eq 0 ]] ; then
        doesItTestGenerator "during generation of 'ngx-default'"
    fi

    echo
    local -i i=0
    while [[ "$i" -lt "${#JHIPSTER_MATRIX_ARRAY[*]}" ]] ; do
        local APP_FOLDER="${JHIPSTER_SAMPLES}/""${JHIPSTER_MATRIX_ARRAY[i]}""-sample"
        if [[ -e "$APP_FOLDER" ]] ; then
            echo -e "WARNING: if you continue the old folder '$APP_FOLDER'" \
                "will be deleted."
        fi
        i=$((i+1))
    done

    confirmationUser "Are you sure to contiune? [y/n] " \
        'echo ""' \
        'exitScriptWithError "ABORTED."'
    unset confirmationFirstParameter

    # TODO Actually numberOfProcesses should be 1 because there is port conflict
    # TODO add test if there is only few samples to test
    read -t 1 -n 10000 discard || echo ""
    echo
    local question=`echo -e "How many processes" \
        "do you want to launch in same time (Travis CI launch 4 processes)? " \
        ""`
    local -i typeAnswer=1
    while [[ "$typeAnswer" -eq 1 ]] ; do
        read -p "$question" -n 1 -r
        if [[ "$REPLY" =~ ^[1-9]$ ]] ; then
            local -i numberOfProcesses="${REPLY}"
            echo "" ;
            typeAnswer=0
        else
            echo -e "\nPlease answer a number between 1 and 9."
            typeAnswer=1
        fi
        echo "" ;
    done
    unset typeAnswer

    testRequierments

    # TODO
    # do not launch this if there is only projects with "skipClient: true"
    # in ../.travis.yml
    generateNode_Modules_Cache

    local -i i=0
    timeSpan=15
    # Execute accordingly to the array.
    while [[ "$i" -lt "${#JHIPSTER_MATRIX_ARRAY[*]}" ]] ; do
        local JHIPSTER_MATRIX="${JHIPSTER_MATRIX_ARRAY[i]}"
        # `ps' man page:
        # "By default, ps selects all processes
        # associated with the same terminal as the invoker."
        while [ `ps -o pid,command  \
                | grep "build-samples.sh" \
                | grep -v "grep" \
                | wc -l` -gt $(($numberOfProcesses+1)) ] ; do
            # If we use `grep build-samples.sh', do not forget than grep is also
            # returned by `ps'.
            sleep "$timeSpan"
        done
        wrapperLaunchScript &
        # ps -o pid,command  | grep "build-samples.sh"

        # ps -o pid,stat,command,%cpu,%mem -C "bash ./build-samples.sh"
        # Sleep to not have too much logs at start up.
        sleep 25
        i=$((i+1))
    done

    # Wait background process before continuing
    # Do not return the focus to the user.
    # If we delete line after, when loop before is finished
    # this foreground script ./build-samples.sh is ended.
    # The focus return to the user.
    wait

    echo "All build are finished"

}

# MAIN {{{1
# ==============================================================================
# ==============================================================================
# ==============================================================================
# ==============================================================================

# Global constants and variables {{{2
# ====================
# ====================

# GLOBAL CONSTANTS COPIED FROM ../.travis.yml
# ====================
# PROFILE and PROTRACTOR could be redifined in function
# retrieveVariablesInFileDotTravisSectionMatrix()
# In ../.travis.yml, under section matrix
# its value corresponding to second and third column if they exists
export PROFILE="dev"
export PROTRACTOR=0

# Defined in function retrieveVariablesInFileDotTravisSectionMatrix()
# In ../.travis.yml, under section matrix,
# its value corresponding to the first column
# export JHIPSTER=ngx-default

export RUN_APP=1
export JHIPSTER_TRAVIS="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export JHIPSTER_SAMPLES="$JHIPSTER_TRAVIS/samples"
export JHIPSTER_SCRIPTS="$JHIPSTER_TRAVIS/scripts"
# export APP_FOLDER redefined in function launchOnlyOneSample()
export UAA_APP_FOLDER="$JHIPSTER_SAMPLES/uaa-sample"
# environment properties
export SPRING_OUTPUT_ANSI_ENABLED="ALWAYS"
export SPRING_JPA_SHOW_SQL="false"

# Send a variable to ./scripts/*.sh to test if the parent is this script
# (./build-samples.sh)
export localTravis=1

# GLOBAL CONSTANTS not copiend in ../.travis.yml
# ====================

# Define prompt (used by `set -x` for scripts in ./scripts/*)
export PROMPT_COMMAND=""
export PS1="+ "

# GLOBAL CONSTANTS SPECIFIC TO ./build-samples.sh (this script)
# ====================
# Should be unique thanks command `date'. Thanks lot of `sleep' in this script
# we sure DATEBININSCRIPT will be unique.
DATEBININSCRIPT=`date +%Y-%m-%dT%H_%M_%S`

## Retrieve ../.travis.yml and parse it
travisDotYml="${JHIPSTER_TRAVIS}/../.travis.yml"
if [ ! -f "$travisDotYml" ] ; then
    exitScriptWithError "'$travisDotYml' doesn't exist."
fi
TRAVIS_DOT_YAML_PARSED="`grep --color=never -E \
    '^    - JHIPSTER=' "$travisDotYml" | sed 's/    - JHIPSTER=//'`"
unset travisDotYml

# Count time in this script
SECONDS=0

BRANCH_NAME=`git rev-parse --abbrev-ref HEAD`

# See also ./scripts/02-generate-project.sh.
# The string "node_modules_cache-sample" is used.
NODE_MODULES_CACHE_SAMPLE="${JHIPSTER_SAMPLES}/node_modules_cache-sample"
NODE_MODULES_CACHE_ANGULAR="${NODE_MODULES_CACHE_SAMPLE}"/angular
# TODO
# NODE_MODULES_CACHE_REACT="${NODE_MODULES_CACHE_SAMPLE}"/react

# Argument parser {{{2
# ====================
# ====================

function returnJHIPSTER_MATRIXofFileTravisDotYml() {
    # "$1" is the name of the variable we want assign
    # example https://stackoverflow.com/a/38997681
    local -n returned="$1"
    local JHIPSTER_LOCAL="$2"
    returned=`grep -E --color=never "$JHIPSTER_LOCAL(\s|$)" \
        <<< "$TRAVIS_DOT_YAML_PARSED"` \
        || exitScriptWithError "\n\nFATAL ERROR: " \
        "'$JHIPSTER_LOCAL' is not a correct sample." \
        "Please read \`$ ./build-samples.sh help'."

    # Should never be raised because we check ../.travis.yml.
    # Maybe in case of the user delete all folders sample!
    if [ ! -f "$JHIPSTER_SAMPLES/""$JHIPSTER_LOCAL""/.yo-rc.json" ]; then
        exitScriptWithError "FATAL ERROR: not a JHipster project."
    fi

}

function define_JHIPSTER_MATRIX_ARRAY() {
    if [[ -z "${sample_list+x}" ]] ; then
        IFS=$'\n' read -ra JHIPSTER_MATRIX_ARRAY  <<< "$TRAVIS_DOT_YAML_PARSED"
    elif [[ "${sample_list}" =~ ^[a-z0-9-]*$ ]] ; then
        returnJHIPSTER_MATRIXofFileTravisDotYml JHIPSTER_MATRIX_ARRAY[0] \
            "$sample_list"
    elif [[ ${sample_list} =~ ^[a-z0-9,-]*$ ]] ; then
        local -a tmpSampleListArray
        IFS=$',' read -ra tmpSampleListArray  <<< "$sample_list"
        local -i i=0
        while [[ "$i" -lt "${#tmpSampleListArray[*]}" ]] ; do
            returnJHIPSTER_MATRIXofFileTravisDotYml JHIPSTER_MATRIX_ARRAY[$i] \
                "${tmpSampleListArray[i]}"
            i=$((i+1))
        done
    else
        exitScriptWithError "FATAL ERROR: not a valid sample name, or" \
            "list of samples name.\n" \
            "A sample name contains only alphanumeric characters and dash.\n" \
            "A list of samples name is seperated by the character ','.\n" \
            "Please read \`./build-samples.sh help'."
    fi
}

function launchSamples() {
    if [[ "$ONLY_ONE_SAMPLE_VERBOSE_OUTPUT" -eq 1 ]] ; then
        isLaunchSamplesInBackground=0
        local JHIPSTER_MATRIX
        returnJHIPSTER_MATRIXofFileTravisDotYml JHIPSTER_MATRIX "$sample_list"
        unset sample_list
        time launchOnlyOneSample
    else
        isLaunchSamplesInBackground=1
        define_JHIPSTER_MATRIX_ARRAY
        echo -e "\n\nYou will build:" ${JHIPSTER_MATRIX_ARRAY[*]}
        unset sample_list
        time launchSamplesInBackground
    fi
}

function tooMuchArguments() {
    exitScriptWithError "\n\n\nFATAL ERROR: to much arguments. " \
        "Please see \`./build-samples.sh help'."
}

if [[ "$#" -gt 3 ]] ; then
    tooMuchArguments
fi
if [[ ! -z "${1+x}" ]] && \
    ([[ "$1" = 'buildandtest' ]] || \
    [[ "$1" = 'generate' ]]) ; then
    ONLY_ONE_SAMPLE_VERBOSE_OUTPUT=0
    if [[ ! -z  "${3+x}" ]] && \
        [[ "$3" -eq "--consoleverbose" ]] ; then
        ONLY_ONE_SAMPLE_VERBOSE_OUTPUT=1
        if [[ ${2} =~ ^[a-z1-9,-]*$ ]] ; then
            exitScriptWithError "\n\n\nFATAL ERROR '--consoleverbose' " \
                "option could " \
                "be used only when there is only one sample to build." \
                "Please see \`./build-samples.sh help'."
        fi
    fi
fi

cd "${JHIPSTER_TRAVIS}"
if [[ ! -z "${1+x}" ]] ; then
    if [ "$1" = "help" ]; then
        if [[ ! -z "${2+x}" ]] ; then
            tooMuchArguments
        fi
        usage
        exit 0
    elif [[ "$1" = "generate" ]] || [[ "$1" = "buildandtest" ]] ; then
        [[ "$1" = "generate" ]] && isBuildAndTest=0 || isBuildAndTest=1
        if [[ ! -z "${2+x}" ]] ; then
            sample_list="$2"
            declare -a JHIPSTER_MATRIX_ARRAY
        fi
        launchSamples
    elif [ "$1" = "clean" ]; then
        if [[ ! -z "${2+x}" ]] ; then
            tooMuchArguments
        fi
        cleanAllProjects
    else
        firstArgument=`echo -e "\n\n\nFATAL ERROR: incorrect argument. " \
            "Please see \\\`$ ./build-samples.sh help'".`
        exitScriptWithError "$firstArgument"
    fi
else
    usage
fi

# vim: foldmethod=marker sw=4 ts=4 et textwidth=80 foldlevel=0
