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
# 6) [[ -z "${myUnboundVar} ]] return true if "$myUnboundVar" is
#       unbound/unsetted.
#       In JavaScript, corresponding to test "typeof myVar === 'undefined'"
# 7) Do not return something > 0 caused of `set -e`
# 8) files descriptors are not shared between shells

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
#       ( I LAUNCH SCRIPT FOR ALL SAMPLES) ⊇.
#       ( II LAUNCH SCRIPT FOR ONLY ONE SAMPLE) ⊇.
#       ((III 1) GENERATE NODE_MODULES CACHE)
#           AND/THEN (III 2) EXECUTE SCRIPTS ./scripts/*.sh )) ⊇.
#       (IV WRAPPING EXECUTION OF ./scripts/*.sh AND GENERATE NODE_MODULES STEPS)
#   * LOG FILE
#       * Prepare log files. Their name finished by local-travis.log
#       * The main function is createLogFile()
#       * Log files are created for each sample
#       * Used in functions generateNode_Modules_Cache() AND
#           launchScriptForOnlyOneSample()
#           i.e.. Generation of the node_module cache produce an log file,
#               each sample has its own log file.
#   * IV WRAPPING EXECUTION OF ./scripts/*.sh AND GENERATE NODE_MODULES STEPS
#       * Notes for function treatEndOfBuild().
#           Each node_modules takes 1.1 Go. To save disk space, at the and of
#           generation or testandbuild I symlink
#           ./samples/sample-name-sample/node_modules to
#       .   /samples/node_modules_cache-sample/node_modules
#           We must not use symlink during tests:
#           (see https://github.com/ng-bootstrap/ng-bootstrap/issues/2283)
#       * functions errorInBuild*()
#           stop build of current sample or of all script ./build-samples.sh
#           if there is an error during a step.
#       * launchNewBash() who launch ./scripts/*.sh if previous step was
#           not errored.
#   * III 2) EXECUTE SCRIPTS ./scripts/*.sh
#       * functions generateProject() buildAndTestProject() who
#       launch scripts (see explanations in paragraph below).
#   * III 1) GENERATE NODE_MODULES CACHE
#       * Main function is generateNode_Modules_Cache() who generate
#       a single node_modules. Why this?
#       On my computer (JulioJu) I save 10 minutes of time for each sample.
#   * II LAUNCH SCRIPT FOR ONLY ONE SAMPLE
#       * Could be seen as "MAIN" for:
#       `./build-samples.sh generate/buildandtest' (two arguments)
#       * contains launchScriptForOnlyOneSample(),
#       the main function of this subtitle
#       * see explanations in paragrapher below
#   * I LAUNCH SCRIPT FOR ALL SAMPLES
#       * Could be seen as "MAIN" function for:
#       `./build-samples.sh generate/buildandtest sample_name' (three arugments)
#       * contains launchScriptForAllSamples(),
#       the main function of this subtitle
#       * This function launch several function launchScriptForOnlyOneSample()
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
# 2. If we have two parameters
#    (e.g `./build-samples.sh generate ngx-default') we trigger
#    function launchScriptForOnlyOneSample() in foreground.
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
#    we trigger function launchScriptForAllSamples() in foreground.
#    This function retrieve all lines in ../.travis.yml,
#    that match: "    JHIPSTER=ngx-default PROTRACTOR=1 PROFILE=prod"
#    (e.g those under section matrix:)
#   * This function launches several function launchScriptForOnlyOneSample()
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
# me='$(basename "$0")' or ${BASH_SOURCE[0]}. (see reference of me in function usage()
# TODO java send to STDOUT and STDERR

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
        >&4 echo "Exit by user."
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
    1>&2 echo -e "$@" # print in stderr
    exit 10
}

# function printCommandAndEval() {{{2
function printCommandAndEval() {
    if [[ -e /dev/fd/3 ]] && \
        [[ -e /dev/fd/4 ]] ; then
        # See function launchScriptForAllSamples()
        echo "$@" >> >(tee --append /dev/fd/3) 2>> >(tee --append /dev/fd/4)
        eval "$@" >> >(tee --append /dev/fd/3) 2>> >(tee --append /dev/fd/4)
    else
        echo "$@"
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

# Executed when the first argument of the script is "usage" or when there isn't
# argument who match.
# ====================
function usage() {
    local me='$(basename "$0")'
    local list_of_samples=`cut -d ' ' -f 1 <<< "$TRAVIS_DOT_YAML_PARSED"`
    # TODO add info about `yarn link'
    # TODO add info about "*-sample" folders
    echo -e "\n\nScript than emulate well remote Travis CI build " \
        " https://travis-ci.org/jhipster/generator-jhipster.\n"
    # TODO test if it works on MAC
    command -v google-chrome-stable > /dev/null || echo -e "\nERROR: " \
        "\'google-chrome-stable' installed on this computer. " \
        " Please install it and add it in your PATH " \
        "(maybe restart your terminal)\n".
    command -v docker-compose > /dev/null || echo -e "\nWARNING: " \
        "\'docker-compose' isn't installed on this computer. " \
        "You could install it and start tests in a new terminal." \
        "Few tests need \`docker-compose' avaible in your path " \
        "(not mandatory).\n"
    # TODO test if you docker is launched.

    echo -e "\nUsage: '$me' generate [sample_name] " \
        "| buildandtest [sample_name]|clean | help\n" \
    "  * Without optional parameter, 'generate', and 'buildandtest' " \
            "operate for all samples listed below.\n"\
    "  * Arguments 'generate', 'buildandtest' could be apply for " \
            "one sample_name below.\n" \
    "\n'sample_name' could be:\n" \
    "${list_of_samples}\n" \
    "\nThis samples could be deleted under section 'matrix' of " \
    " generator-jhipster/.travis.yml" \
    " Do not hesitate to comment some samples to improve" \
    "speed!" \
    "\nUse always \`./build-samples.sh buildandtest ngx-default' " \
            "(the more complete test). " \
            "Useful for test Server side and Angular client.\n" \
    "  * If you work on the React client try the previous and also " \
            "\`./build-samples.sh buildandtest react-default\n" \
    "  * If you work on an other functionality, chose the corresponding one\n" \
    "\nExamples:\n" \
    "\`$ ./build-samples.sh generate ngx-default' " \
        "=> generate a new project at travis/samples/ngx-default-sample\n" \
    "\`$ ./build-samples.sh buildandtest ngx-default' " \
        "=> generate a new project at travis/samples/ngx-default-sample " \
            "then build and test it.\n" \
    "\`$ ./build-samples.sh generate' =>" \
        " generate all travis/samples/*-sample corresponding of " \
        " samples listed above.\n" \
    "\`$ ./build-samples.sh buildandtest' => generate build and test all " \
        "travis/samples/*-sample corresponding of samples listed above.\n" \
    "\`$ ./build-samples.sh clean' " \
        "=> delete all folders travis/samples/*-sample\n" \
        "=> delete especially the node_modules cache " \
        "(samples/node_modules_cache-sample) to sanitize.\n" \
    "\`$ ./build-samples.sh help' => display the previous message" \
    "\n\nNote1: We recommand to use Node.Js LTS. Check if you use it.\n" \
    "\n\nNote2: each node_modules takes actually (version 5) 1.1 Go." \
    "A symbolic link (symlink) is done at the end of this script between" \
    "./samples/node_modules_cache-sample/node_modules and" \
    "./samples/[sample-name]-sample/node_modules to preserve disk space." \
    "You could open this sample on your IDE without complains concerning" \
    "missing library. However, actually you can't parform tests in it. This" \
    "script copy node_modules folder from node_modules_cache-sample before" \
    "perform tests, and symlink again at the end of the test." \
    "\`yarn install' isn't perform before test to increase speed".

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
    local confirmationFirstParameter=`echo -e "Warning: " \
        "are you sure to delete " \
        "all samples/*-sample [y/n]? "`
    confirmationUser "$confirmationFirstParameter" \
        'echo ""' \
        'exitScriptWithError "ABORTED."'
    unset confirmationFirstParameter

    local foldersSample=$(find "$JHIPSTER_SAMPLES" -maxdepth 1 -type d -name "*-sample")
    if [[ "$foldersSample" == "" ]] ; then
        echo -e "\n\n*********************** No folder ./samples/*-sample to " /
        "delete \n"
    fi

    while IFS=$'\n' read -r dirToRemove ; do
        if [[ -f "$dirToRemove/.yo-rc.json" ]] || \
            [[ "$dirToRemove" == "${NODE_MODULES_CACHE_SAMPLE}" ]] ; then
            echo -e "\n\n*********************** Deleting '$dirToRemove'\n"
            rm -Rf "$dirToRemove"
        else
            echo "'$dirToRemove': Not a JHipster project. Skipping."
        fi
    done <<< "$foldersSample"

    local NODE_MODULE_SHORT_NAME='./samples/node_modules_cache-sample'

    echo -e "\nNote 1: We are sure than '${NODE_MODULE_SHORT_NAME}' " \
        "doesn't  exists:\n     ==> you could launch a sanitzed new build.\n" \
        "Note 2: before each new build, ./sample/[sample-name]-sample " \
        "is systematically erased, contrary to " \
        "'${NODE_MODULE_SHORT_NAME}'.\n" \
        "Node 3: Actually '${NODE_MODULE_SHORT_NAME} takes more " \
        "than 1 Go\n" \
        "Note 4: After a build, [sample-name]-sample/node_modules is a" \
        "symbolic link. " \
        "Therefore, a folder [sample-name]-sample doesn't take" \
        "lot of size (just some megabytes)\n" \
        "Note 5: Do not forget to read \`./build-samples.sh help'"
}

# GENERATE AND TEST SAMPLES `./build-samples.sh generate/buildandtest' {{{1
# ==============================================================================
# ==============================================================================
# ==============================================================================
# ==============================================================================

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
    # 1. if console is branched to /dev/fd/3 (see launchScriptForAllSamples())
    # 2. if we are not in function generateNode_Modules_Cache().
    # Always false if we launch this script with two arguments, like:
    # `./build-samples.sh generate ngx-default'
    if [[ -e /dev/fd/3 ]] && \
        [[ -z "${generationOfNodeModulesCacheMarker+x}" ]] ; then
        >&3 echo -e "\n\n\n" \
            "\n'$@'" \
            "(`date +%r`, '$ELAPSED')\n" \
            "================================================================" \
            "\n"
    fi
    unset ELAPSED
}



# LOG FILE {{{2
# ====================
# ====================

# function testRequierments() {{{3
function testRequierments() {
    # Why "nodejs --version"? For Ubuntu users, please see
    # https://askubuntu.com/a/521571"
    echo -e "\n\n"

    printCommandAndEval "node --version" \
        || printCommandAndEval "nodejs --version" \
        || exitScriptWithError "FATAL ERROR: please install Node. " \
        "If Node is already installed, please add it in your PATH."
    echo "We recommand to use Node.Js LTS. Check if you use it."
    echo

    printCommandAndEval "yarn -v" \
        || exitScriptWithError "FATAL ERROR: please install Yarn. " \
        "If Yarn is already installed, please add it in your PATH."
    echo

    # java send question of this version to stderr. Redirect to stdout.
    printCommandAndEval "java -version 2>&1" || \
        "exitScriptWithError '$argument'" \
            "FATAL ERROR: please install java."
    echo

    # java send question of this version to stderr. Redirect to stdout.
    printCommandAndEval "javac -version 2>&1" || "exitScriptWithError" \
        "FATAL ERROR: please install JDK. "
    echo

    # TODO
    # Ask or search wich version is needed. Java 10 doesn't work also
    javaVersion="$(java -version 2>&1)"
    grep "OpenJDK" <<< "$javaVersion" && exitScriptWithError \
        'Do not use OpenJDK, please install Oracle Java.'
    echo

    jhipster --version > /dev/null || exitScriptWithError \
        "FATAL ERROR: please install JHipster globally. " \
        "(\`$ yarn global install jhipster') " \
        "If JHipster is already installed, please add it in your PATH."
    echo

    # TODO test if it works on mac
    printCommandAndEval "google-chrome-stable --version" \
        || exitScriptWithError "FATAL ERROR: " \
            "please install google-chrome-stable. " \
            "If google-chrome-stable is already installed, "\
            "please add it in your PATH".

    # TODO add requierments such as mysql posgresql

    echo

}


# function printInfoBeforeLaunch() {{{3
function printInfoBeforeLaunch() {
    export PROMPT_COMMAND=""
    export PS1="+ "
    echo -e "\n\n* Your log file will be '$LOGFILENAME'\n" \
        "* When build will finish, The end of this filename shoule be renamed" \
        "'errored' or 'passed'.\n" \
        "* On this file lines started by '$PS1' are bash" \
        "command. Useful to know which command fail.\n" \
        "* See progress in this file. Do not forget to refresh it!"
    # Test if we launch not this function in generateNode_Modules_Cache().
    # True if launched from functions generateProject() and
    # buildAndTestProject().
    if [[ -z "${generationOfNodeModulesCacheMarker+x}" ]] ; then
        # echo constants used in ./scripts/*.sh
        echo -e "LOGFILENAME='$LOGFILENAME'" \
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
            "SPRING_JPA_SHOW_SQL='$SPRING_JPA_SHOW_SQL'"
    fi
}


# function createlogfile() {{{3
function createLogFile() {
    cd "${JHIPSTER_TRAVIS}"
    touch "$LOGFILENAME" || exitScriptWithError "FATAL ERROR: could not " \
        "create '$LOGFILENAME'"

    if [[ "$workOnAllProjects" -eq 0 ]] || \
        [[ ! -z ${generationOfNodeModulesCacheMarker+x} ]]; then
        echo -e "\n\n*********************** Create log file and save output in "${LOGFILENAME}".\n"
        exec 1> >(tee "${LOGFILENAME}") 2> >(tee "${LOGFILENAME}")
    else
        echo -e "\n\n*********************** Create log file and redirect output in "${LOGFILENAME}".\n"
        exec 1> "${LOGFILENAME}" 2> "${LOGFILENAME}"
    fi
    # Otherwise folowing command is started before function createLogFile is
    # finished.
    sleep 2
    printInfoBeforeLaunch
    testRequierments
}

# IV WRAPPING EXECUTION OF ./scripts/*.sh AND GENERATE NODE_MODULES STEPS {{{2
# ====================
# ====================

# function errorInBuild() {{{3
function errorInBuild() {
    # tee print in stdout (either logfile or console) and /dev/fd/4
    # for /dev/fd/4 see function launchScriptForAllSamples()
    if [[ ${JHIPSTER_MATRIX+x} ]] ; then
        if [[ -e dev/fd/4 ]] ; then
            echo -e "'$JHIPSTER_MATRIX' has faild.\n'$@'"  \
                > >(> tee --append /dev/fd/2 /dev/fd/4 > /dev/null)
        else
            >&2 echo -e "'$JHIPSTER_MATRIX' has faild.\n'$@'"
        fi
    fi

    local logrenamed="${beginLogfilename}"".errored.""${endofLogfilename}"
    treatEndOfBuild
    unset logrenamed
}

# function errorInBuildStopCurrentSample() {{{3
function errorInBuildStopCurrentSample() {

    errorInBuild

    local ELAPSED=`echo -e "Elapsed: $(($SECONDS / 3600))" \ "hrs " \
        "$((($SECONDS / 60) % 60)) min " \
        "$(($SECONDS % 60))sec"`
    if [[ -e /dev/fd/4 ]] ; then
        >&2 echo "$@ Error in '$JHIPSTER' at `date +%r`" \
            "(elapsed: '$ELAPSED')" \
            > >(tee --append /dev/fd/2 /dev/fd/4 > /dev/null)
    else
        >&2 echo "$@ Error in '$JHIPSTER' at `date +%r`" \
            "(elapsed: '$ELAPSED')"
    fi
    unset ELAPSED

    # Thanks this variable set to 1, following steps will not start
    # in function launchNewBash above()
    STOPTHISAMPLE=1

    # Do not exit, otherwise we stop this script!
    # exit 15
    # Do not return something > 0 caused of set -e
    return 0
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
    # "$STOPTHISAMPLE" takes a value of 1. Initialised to 0 in function
    # launchScriptForOnlyOneSample()
    if [[ "${STOPTHISAMPLE}" -eq 0 ]] ; then
        cd "${JHIPSTER_TRAVIS}"
        time bash "$pathOfScript" "$JHIPSTER"
        if [[ $? -ne 0 ]] ; then
            errorInBuildStopCurrentSample "'$pathOfScript' finished with error."
        fi
    else
        # tee print in stdout (either logfile or console) and /dev/fd/4
        # for /dev/fd/4 see function launchScriptForAllSamples()
        if [[ -e /dev/fd/4 ]] ; then
            >&2 echo -e "SKIP '${2}' cause of previous error." \
                > >(tee --append /dev/fd/2 /dev/fd/4 > /dev/null)
        else
            >&2 echo -e "SKIP '${2}' cause of previous error."
        fi
    fi
    unset pathOfScript
}

# function treatEndOfBuild() {{{3
function treatEndOfBuild() {
    # TODO treat for REACT. React has its own node_modules.
    # React should not be symlinked.

    printCommandAndEval mv "${LOGFILENAME}" "${logrenamed}"
    # Test if we launch not this function in generateNode_Modules_Cache().
    # True if launched from functions generateProject() and
    # buildAndTestProject().
    if [[ -z "${generationOfNodeModulesCacheMarker+x}" ]] ; then
        # Maybe to let time to fetch disk cache and unlock the folder.
        # For slow computers.
        sleep 2
        # Because node_modules takes 1.1 Go ! Too much !
        if [[ "$JHIPSTER" != *"react"* ]] ; then
            printCommandAndEval "rm -Rf '${APP_FOLDER}/node_modules'"
            printCommandAndEval ln -s \
                "${NODE_MODULES_CACHE_ANGULAR}/node_modules"
                "${APP_FOLDER}"
        fi
    fi
}


# III 2) EXECUTE SCRIPTS ./scripts/*.sh {{{2
# ====================
# ====================

# function doestItTestGeneratorJHipster() {{{3
function doestItTestGeneratorJHipster() {

    if [ "$workOnAllProjects" -eq 0 ] ; then
        echoTitleBuildStep "\\\`yarn test' in generator-jhipster"
        cd "../"
        local confirmationFirstParameter=`echo -e "Do you want execute " \
            "\\\`yarn test' in " \
            "generator-jhipster before generate the project " \
            "(skip 1° if you havn't \\\`docker-compose' installed" \
            "2° if you want only generate a new project)? [y/n] "`
        confirmationUser "$confirmationFirstParameter" \
            "TESTGENERATOR=1 ; \
        echo Generator test will be test after generation or link of \
            generator-jhipster/scripts/node_modules_cache-sample." \
            "echo -e '\n\nSKIP test generator.\n'"
        unset confirmationFirstParameter
    fi
}

# function generateProject() {{{3
# Executed when the first argument of the script is "generate" and
# "buildandtest"
# ====================
# Corresponding of the entry "install" in ../.travis.yml
function generateProject() {

    # TODO: when `./build-samples.sh generate', confirmationUser
    # if he wants test it.
    if [[ "${TESTGENERATOR}" -eq 1 ]] \
        || ( [[ "$workOnAllProjects" -eq 1 ]] && \
        [[ "${JHIPSTER}" == "ngx-default"  ]] )
    then
        # Corresponding to "Install and test JHipster Generator" in
        # ./scripts/00-install-jhipster.sh
        echoTitleBuildStep "\\\`yarn test' in generator-jhipster"
        cd -P "$JHIPSTER_TRAVIS"
        echo "We are at path: '`pwd`'".
        echo "Your branch is: '$BRANCH_NAME'."
        # TODO should we add yarn install?

        # Do not use syntax below.
        # Yarn test launch some processes in background:
        # <CTRL+C> doesn't kill it immediately.
        # Doesn't use syntax below.
        # yarn test || errorInBuildStopCurrentSample \
        #         "Fail during test of the Generator." \
        #         " (command 'yarn test' in `pwd`)"

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

    echo "STOPTHISAMPLE='$STOPTHISAMPLE'"

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
    # TODO it seems we must be sudo
    # Maybe a problem with .dockignore:
    # https://unix.stackexchange.com/questions/413015/docker-compose-cannot-build-without-sudo-but-i-can-run-containers-without-it
    # launchNewBash "./scripts/03-docker-compose.sh" \
    #    "Start docker container-compose.sh for '${JHIPSTER}'"
    launchNewBash "./scripts/04-tests.sh"  "Testing '${JHIPSTER}-sample'"
    launchNewBash "./scripts/05-run.sh" "Run and test '${JHIPSTER}-sample'"
    launchNewBash "./scripts/06-sonar.sh" \
        "Launch Sonar analysis for '${JHIPSTER}'"

}

# III 1) GENERATE NODE_MODULES CACHE {{{2
# ====================
# ====================

# function errorInBuildExitScript() {{{3
function errorInBuildExitScript() {

    errorInBuild

    # TODO actually, line below duplicated is also in function finish()
    # (code duplicated).
    erroredAllPendingLog

    # exit stop current script (./build-samples.sh).
    exit 15
}


# function yarnLink() {{{3
function yarnLink() {
    echo -e "\n\n*********************** yarn link\n"
    mkdir -p "$APP_FOLDER"/
    cd "${APP_FOLDER}"
    yarn init -y
    command yarn link "generator-jhipster" || \
        errorInBuildStopCurrentSample "FATAL ERROR: " \
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
        errorInBuildStopCurrentSample "FATAL ERROR: " \
            "'$JHIPSTER_TRAVISReal and '$GENERATOR_JHIPSTER_FOLDER_REAL' " \
            "are not the same folders"
    else
        echo "Command \`yarn link' seems corect."
    fi
    unset GENERATOR_JHIPSTER_FOLDER JHIPSTER_TRAVISReal
}

# function generateNode_Modules_Cache() {{{3
function generateNode_Modules_Cache() {
    # Display stderr on terminal.
    local beginLogfilename="${NODE_MODULES_CACHE_SAMPLE}"/node_modules_cache
    local endofLogfilename="${BRANCH_NAME}.passed.angular.local-travis.log"
    if ls "$beginLogfilename".*."$endofLogfilename" 1> /dev/null 2> /dev/null
    then
        # TODO ask if you want start new generation.
        # TODO warning if a git pull/merge occured.
        # TODO ask if you want start new generation.
        # TODO warning if a git pull/merge occured.
        # TODO add a git pull hook to create a marker file for
        # generateNode_Modules_Cache().
        # TODO create a react cache
        # TODO I case of git pull. Create a new package.json, then compare
        # package to see if something is changed
        echo -e "A file named" "$beginLogfilename"".*.""$endofLogfilename" \
            "was found." \
            "\n\nBE CARREFUL LOCAL BUILD SAMPLES " \
            "USE CACHED NODE_MODULES\n." \
            "So if you done a \`git pull' " \
            "or if you modifiy something relative to \`package.json', " \
            "you could not see bugs\n. " \
            "To refresh cache, simply run \`./build-samples.sh clean'"
        return 0
    fi
    unset beginLogfilename endofLogfilename

    local -i generationOfNodeModulesCacheMarker=1

    echoTitleBuildStep "Before start, " \
        "'$NODE_MODULES_CACHE_ANGULAR' should be generated.\n"

    local shortDate=`date +%m-%dT%H_%M`
    local beginLogfilename=`echo -e \
        "${JHIPSTER_TRAVIS}"/node_modules_cache."${shortDate}"."${BRANCH_NAME}"`
    local endofLogfilename="angular.local-travis.log"
    local LOGFILENAME="${beginLogfilename}"".pending.""${endofLogfilename}"

    createLogFile

    time {

        echoTitleBuildStep "Generate project" \
            "for retrieve its folder node_modules"

        APP_FOLDER="${NODE_MODULES_CACHE_ANGULAR}"
        rm -Rf "${NODE_MODULES_CACHE_SAMPLE}"
        mkdir -p "${NODE_MODULES_CACHE_ANGULAR}"
        cd "$APP_FOLDER"
        yarnLink || errorInBuildExitScript

        echo -e "\n\n*********************** Generate the JHipster project at `date +%r`\n"
        cp "${JHIPSTER_SAMPLES}/node_modules_cache/angular/.yo-rc.json" \
            "${NODE_MODULES_CACHE_ANGULAR}" || \
            errorInBuildExitScript "FATAL ERROR: not a JHipster project."
        cd "${NODE_MODULES_CACHE_ANGULAR}"
        jhipster --force --no-insight --skip-checks --with-entities --skip-git \
            --skip-commit-hook  && local -i fail=0 || local -i fail=1
        if [[ "${fail}" -eq 0 ]] ; then
            echo "All done."
            local logrenamed="${beginLogfilename}".passed."${endofLogfilename}"
            treatEndOfBuild
            cp "${logrenamed}" "${NODE_MODULES_CACHE_SAMPLE}"
        else
        errorInBuildExitScript "FATAL ERROR: " \
                "Failure during generation of the angular no-entity sample"
        fi
    }

    unset shortDate beginLogfilename endofLogfilename fail
    unset APP_FOLDER logrenamed
    unset generationOfNodeModulesCacheMarker
}

# II LAUNCH SCRIPT FOR ONLY ONE SAMPLE {{{2
# ====================
# ====================

# function retrieveVariablesInFileDotTravisSectionMatrix() {{{3
function retrieveVariablesInFileDotTravisSectionMatrix() {

    # For variable "$JHIPSTER_MATRIX", see section "matrix" of ../.travis.yml
    if [[ "$workOnAllProjects" -eq 0 ]] ; then
        export JHIPSTER="$1"
        JHIPSTER_MATRIX=`grep --color=never "$JHIPSTER\s" \
            <<< "$TRAVIS_DOT_YAML_PARSED"` \
            || exitScriptWithError \
            "\n\nFATAL ERROR: " \
            "$JHIPSTER is not a correct sample." \
            "Please read \`$ ./build-samples.sh help'."
    else
        JHIPSTER_MATRIX="$1"
        export JHIPSTER=`cut -d ' ' -f 1 <<< "$JHIPSTER_MATRIX"`
    fi

    # PROFILE AND PROTRACTOR REDEFINITION
    # Retrieve ../.travis.yml, section matrix
    # `cut -s', because otherwise display first column. Other `cut` should not
    # have this option, for this reason (we want display the first column,
    # even if there isn't several columns.
    local travisVars=`cut -s -d ' ' -f 2- <<< "$JHIPSTER_MATRIX"`
    # https://stackoverflow.com/questions/2821043/allowed-characters-in-linux-environment-variable-names
    if [[ -z "${travisVars+x}" ]] && \
        [[ "$travisVars" =~ "[a-zA-Z0-9_].*" ]] ; then
        while IFS=$' ' read -r defVar ; do
            export "$defVar"
        done <<< "$travisVars"
    fi

}

# function testIfLocalSampleIsReady() {{{3
function testIfLocalSampleIsReady() {
    if [ ! -f "$JHIPSTER_SAMPLES/""$JHIPSTER""/.yo-rc.json" ]; then
        errorInBuildStopCurrentSample "FATAL ERROR: not a JHipster project."
    fi
    [[ "$workOnAllProjects" -eq 1 ]] && rm -rf "${APP_FOLDER}"
    if [[ -e "$APP_FOLDER" ]] ; then
        local confirmationFirstParameter=`echo -e  \
            "Warning: '${APP_FOLDER}' exists. Do you want delete it? [y/n] "`
        local argument="ABORTED: rename this folder, then restart script."
        local execInfirmed="errorInBuildStopCurrentSample '$argument'"
        confirmationUser "$confirmationFirstParameter" \
            "rm -rf '${APP_FOLDER}'" \
            "echo '$execInfirmed'"
        unset confirmationFirstParameter confirmationFirstParameter
        unset argument
    fi
}

# function launchScriptForOnlyOneSample() {{{3
function launchScriptForOnlyOneSample() {
    local methodToExecute="$1"

    # Used in function launchNewBash() to test if we must continue the script.
    # If an error occure in ./scripts/*.sh, in function errorInBuildStopCurrentSample()
    # the value of this variable is changed to 1.
    local -i STOPTHISAMPLE=0

    # define JHIPSTER, and redifine if necessary PROFIL and PROTRACTOR
    retrieveVariablesInFileDotTravisSectionMatrix "$2"

    # redifine APP_FOLDER as explained in MAIN section
    export APP_FOLDER="${JHIPSTER_SAMPLES}/""${JHIPSTER}""-sample"
    testIfLocalSampleIsReady

    local -i TESTGENERATOR=0
    doestItTestGeneratorJHipster

    if [[ "$workOnAllProjects" -eq 0 ]] ; then
        generateNode_Modules_Cache
        # Redefined APP_FOLDER, because erased in generateNode_Modules_Cache()
        # above
        export APP_FOLDER="${JHIPSTER_SAMPLES}/""${JHIPSTER}""-sample"
        echoTitleBuildStep "\n\n'${JHIPSTER_MATRIX}' is launched!!"
    fi

    time {

        # Instantiate LOGFILENAME
        local beginLogfilename=`echo -e \
            "${JHIPSTER_TRAVIS}"/"${BRANCH_NAME}"."${DATEBININSCRIPT}"`
        local endofLogfilename=`echo -e "${JHIPSTER}"".local-travis.log"`
        local LOGFILENAME="${beginLogfilename}"".pending.""${endofLogfilename}"
        # We need to have saved the original descriptors them somewhere to
        # restore
        createLogFile

        if [[ "$JHIPSTER" != *"react"* ]] ; then
            echoTitleBuildStep \
                "Copy '$NODE_MODULES_CACHE_ANGULAR/node_modules' to" \
            "'$APP_FOLDER'"
            mkdir -p "${APP_FOLDER}"
            # No `ln -s' due to
            # https://github.com/ng-bootstrap/ng-bootstrap/issues/2283
            # But `cp -R' works good ! ;-) ! Probably more reliable.
            cp -R "${NODE_MODULES_CACHE_ANGULAR}/node_modules" \
                "${APP_FOLDER}"
        fi
        local oldPATH="${PATH}"
        export PATH="${APP_FOLDER}"/node_modules:"$PATH"
        "${methodToExecute}"
        PATH="${oldPATH}"
        unset oldPATH

    }

    local logrenamed="${beginLogfilename}"".passed.""${endofLogfilename}"
    # If there is an error raised, in function errorInBuildStopCurrentSample()
    # "$STOPTHISAMPLE" takes a value of 1. Initialised to 0 in current function.
    if [[ "$STOPTHISAMPLE" -eq 0 ]] ; then
        treatEndOfBuild
    fi
    unset methodToExecute logrenamed
    # do not unset beginLogfilename and endofLogfilename, unsed in another
    # function
}

# I LAUNCH SCRIPT FOR ALL SAMPLES {{{2
# ====================
# ====================

# function restoreSTDERRandSTDOUTtoConsole() {{{3
function restoreSTDERRandSTDOUTtoConsole() {
    # Restore the originals descriptors.
    # Behaviour changed in function launchScriptForAllSamples()
    if [[ -e /dev/fd/3 ]] ; then
        exec 1>&3
        3<&-
    fi
    if [[ -e /dev/fd/4 ]] ; then
        exec 2>&4
        4<&-
    fi

}

# function wrapperLaunchScript() {{{3
function wrapperLaunchScript() {
    # Display stderr on terminal.
    echoTitleBuildStep \
        "'${localJHIPSTER_MATRIX}' is launched in background!"
    launchScriptForOnlyOneSample "${methodToExecute}" \
        "${localJHIPSTER_MATRIX}" || echo "ERROR IN '${localJHIPSTER_MATRIX}'"
    echoTitleBuildStep "End of '$localJHIPSTER_MATRIX'" ;
    return 0
}

# function launchScriptForAllSamples() {{{3
function launchScriptForAllSamples() {
    local methodToExecute="${1}"

    # save the originals descriptor (stdout to console and stderr to console).
    exec 3>&1 4>&2

    local confirmationFirstParameter=`echo -e "Don't forget to " \
        "check \\\`./build-samples.sh help.'\n" \
        "Warning: are you sure to run" \
        "'${methodToExecute}' and delete all samples/*-sample [y/n]? "`
    confirmationUser "${confirmationFirstParameter}" \
        'echo ""' \
        'exitScriptWithError "ABORTED."'
    unset confirmationFirstParameter

    read -t 1 -n 10000 discard || echo ""
    echo
    local question=`echo -e "How many processes" \
        "do you want to launch in same time (Travis CI launch 4 processes)? " \
        ""`
    local -i typeAnswer=1
    while [[ "$typeAnswer" -eq 1 ]] ; do
        read -p "$question" -n 1 -r
        if [[ "$REPLY" =~ [1-9] ]] ; then
            local -i numberOfProcesses="${REPLY}"
            echo "" ;
            typeAnswer=0
        else
            echo -e "\nPlease answer a number between 1 and 9."
            typeAnswer=1
        fi
        echo "" ;
    done

    generateNode_Modules_Cache

    local -a jhipsterArray
    local -i i=0
    # We need to use an array.
    # For a complex script, loop below doesn't work.
    # Works only for simple loops.
    # It lost the iterator when we use this syntax loop
    # with inner loop and background processes.
    while IFS=$'\n' read -r localJHIPSTER_MATRIX ; do
        jhipsterArray[i]="$localJHIPSTER_MATRIX"
        i=$((i+1))
    done <<< "$TRAVIS_DOT_YAML_PARSED"
    unset i

    local -i i=0
    timeSpan=15
    # Execute accordingly to the array.
    while [[ i -lt "${#jhipsterArray[*]}" ]] ; do
        localJHIPSTER_MATRIX=${jhipsterArray[i]}
        # `ps -o pid,stat,command -C "…"' seems
        # displays more zombies processes (constation of JulioJu).

        # `ps`: see man page:
        # "By default, ps selects all processes
        # associated with the same terminal as the invoker."
        while [ `ps -o pid  \
                | grep "build-samples.sh" \
                | wc -l` -gt $(($numberOfProcesses+3)) ] ; do
            # Do not forget we must count head line of `ps'!
            # If we use `grep bash', do not forget than grep is also returned by
            # `ps'.
            sleep "$timeSpan"
        done
        wrapperLaunchScript &
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

    restoreSTDERRandSTDOUTtoConsole

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
# export APP_FOLDER redefined in function launchScriptForOnlyOneSample()
export UAA_APP_FOLDER="$JHIPSTER_SAMPLES/uaa-sample"
# environment properties
export SPRING_OUTPUT_ANSI_ENABLED="ALWAYS"
export SPRING_JPA_SHOW_SQL="false"

# Send a variable to ./scripts/*.sh to test if the parent is this script
# (./build-samples.sh)
export localTravis=1


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

function tooMuchArguments() {
    firstArgument=`echo -e "\n\n\nFATAL ERROR: to much arguments. " \
        "Please see \\\`./build-samples.sh help'".`
    exitScriptWithError "$firstArgument"
    unset firstArgument
}

if [[ "$#" -gt 2 ]] ; then
    tooMuchArguments
fi
cd "${JHIPSTER_TRAVIS}"
if [[ ! -z "${1+x}" ]] ; then
    if [ "$1" = "help" ]; then
        if [[ ! -z "${2+x}" ]] ; then
            tooMuchArguments
        fi
        usage
        exit 0
    fi
    if [ "$1" = "generate" ]; then
        if [[ ! -z "${2+x}" ]] ; then
            workOnAllProjects=0
            launchScriptForOnlyOneSample "generateProject" "$2"
        else
            workOnAllProjects=1
            time launchScriptForAllSamples "generateProject"
        fi
    elif [ "$1" = "buildandtest" ]; then
        if [[ ! -z "${2+x}" ]] ; then
            workOnAllProjects=0
            launchScriptForOnlyOneSample "buildAndTestProject" "$2"
        else
            workOnAllProjects=1
            time launchScriptForAllSamples "buildAndTestProject"
        fi
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
