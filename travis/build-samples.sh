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

set -e
set -o nounset

#-------------------------------------------------------------------------------
# Local "Travis Build".
#-------------------------------------------------------------------------------
# Disclaimer: this script emulate Travis builds: it isn't executed on remote
# Travis instance. Only scripts under ./travis/script are executed by Travis CI.
# For a real local Travis build, see
# https://docs.travis-ci.com/user/common-build-problems/#Troubleshooting-Locally-in-a-Docker-Image.

# Notes for developpers of this script: all variables are escaped, it's a good
# practice because if there is space between world, it could cause errors.
# Check if all variables are escaped thanks perl and regex look around :
# $ perl -ne "printf if /(?<\!\")(?<\!')(?<\!\\\\\`)\\\$(?\!\()(?\!\s)/"
        # ./build-samples.sh

# PREPARE SCRIPT {{{1
# *********
# *********
# *********
# *********

# misc {{{2
# Works sometime
trap ctrl_c INT
function ctrl_c() {
    echo "Exit by user."
    exit 130
}

# Works sometime
trap finish EXIT
function finish() {
    # echo -e "\n\n\nSee logs files under '${JHIPSTER_TRAVIS}'" \
    #     " to retrieve logs.\n\n\n"
    cd "${JHIPSTER_TRAVIS}"
}

trap 'errorInScript "$LINENO"' ERR
errorInScript() {
    >&2 echo "Error on line '$1'"
    cd "${JHIPSTER_TRAVIS}"
    exit 5
}

function exitScriptWithError() {
    >&2 echo -e "$@" # print in stderr
    exit 10
}

function printCommandAndEval() {
    echo "$1"
    eval "$1"
    return "$?"
}

function confirmationUser() {
    # empty stdin
    read -t 1 -n 10000 discard || echo ""
    echo
    local -i typeAnswer=1
    while [[ "$typeAnswer" -eq 1 ]] ; do
        read -p "$1" -n 1 -r
        case "$REPLY" in
            [Yy] ) echo "" ; eval "$2"; typeAnswer=1 ; break;;
            [Nn] ) if [ ! -z "${3+x}" ] ; then eval "$3" ; fi ;
                typeAnswer=0;;
            * ) echo -e "\nPlease answer "y" or "n"."; typeAnswer=1 ;;
        esac
        echo ""
    done
}

# HELP {{{1
# ********************
# ********************
# ********************
# ********************

# Executed when the first argument of the script is "usage" or when there isn't
# argument who match.
# ********************
function usage() {
    local me='$(basename "$0")'
    local list_of_samples=`cut -d ' ' -f 1 <<< "$TRAVIS_DOT_YAML_PARSED"`
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

    echo -e "\nUsage: '$me' generate [sample_name] " \
        "| buildandtest [sample_name]|clean [sample_name] | help\n" \
    "  * Without optional parameter, 'generate', 'buildandtest' and 'clean' " \
            "operate for all samples listed below.\n"\
    "  * Arguments 'generate', 'buildandtest' and 'clean' could be apply for " \
            "one sample_name below.\n" \
    "\n'sample_name' could be:\n" \
    "${list_of_samples}\n" \
    "\nUse always \`./build-samples.sh build ngx-default' " \
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
    "\`$ ./build-samples.sh clean ngx-default'" \
        " => delete the folder travis/samples/ngx-default-sample'\n" \
    "\`$ ./build-samples.sh generate' =>" \
        " generate all travis/samples/*-sample corresponding of " \
        " samples listed above.\n" \
    "\`$ ./build-samples.sh buildandtest' => generate build and test all " \
        "travis/samples/*-sample corresponding of samples listed above.\n" \
    "\`$ ./build-samples.sh clean' " \
        "=> delete all folders travis/samples/*-sample\n" \
    "\`$ ./build-samples.sh help' => display the previous message \n"

    exit 0
}

# PREPARE LOCAL SAMPLE {{{1
# ********************
# ********************
# ********************
# ********************

# function testRequierments() {{{2
function testRequierments() {
    # Why "nodejs --version"? For Ubuntu users, please see
    # https://askubuntu.com/a/521571"
    local argument=`echo -e "FATAL ERROR: please install Node. " \
        "If Node is already installed, please add it in your PATH."`
    printCommandAndEval "node --version" \
        || printCommandAndEval "nodejs --version" \
        || exitScriptWithError "$argument"

    local argument=`echo -e "FATAL ERROR: please install Yarn. " \
        "If Yarn is already installed, please add it in your PATH."`
    printCommandAndEval "yarn -v" \
        || "exitScriptWithError '$argument'"
    unset argument

    # TODO test if it works on mac
    local argument=`echo -e \ "FATAL ERROR: " \
            "please install google-chrome-stable. " \
            "If google-chrome-stable is already installed, "\
            "please add it in your PATH".`
    printCommandAndEval "google-chrome-stable --version" \
        || exitScriptWithError "$argument"
    unset argument
}

function printGlobalVariables() {
    # echo value used
    echo -e "JHIPSTER_MATRIX='$JHIPSTER_MATRIX'" \
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
}

# createlogfile {{{2
function createLogFile() {
    local logfilename="$1"
    touch "$logfilename" || exitScriptWithError "FATAL ERROR: could not " \
        "create '$logfilename'"
    if [ $workOnAllProjects -eq 0 ] ; then
        exec > >(tee "${logfilename}") 2> >(tee "${logfilename}")
    else
        printGlobalVariables
        exec > "${logfilename}" 2> >(tee "${logfilename}")
    fi
    echo -e "\n\n* Your log file will be '$logfilename'"
    export PROMPT_COMMAND=""
    export PS1="+ "
    echo -e "* During tests and build, line started by '$PS1' are bash" \
        "command.Useful to know which command fail.\n"
    # Otherwise folowing command is started before function createLogFile is
    # finished.
    sleep 2
    printGlobalVariables
}

# function testIfLocalSampleIsReady() {{{2
function testIfLocalSampleIsReady() {
    if [ ! -f "$JHIPSTER_SAMPLES/""$JHIPSTER""/.yo-rc.json" ]; then
        exitScriptWithError "FATAL ERROR: not a JHipster project."
    fi
    [[ "$workOnAllProjects" -eq 1 ]] && rm -rf "${APP_FOLDER}"
    if [[ -e "$APP_FOLDER" ]] ; then
        local confirmationFirstParameter=`echo -e  \
            "Warning: '${APP_FOLDER}' exists. Do you want delete it? [y/n] "`
        local argument="ABORTED: rename this folder, then restart script."
        local execInfirmed="exitScriptWithError '$argument'"
        confirmationUser "$confirmationFirstParameter" \
            "rm -rf '${APP_FOLDER}'" \
            "echo '$execInfirmed'"
        unset confirmationFirstParameter confirmationFirstParameter
        unset argument
    fi
}

# function retrieveVariablesInFileDotTravisSectionMatrix() {{{2
function retrieveVariablesInFileDotTravisSectionMatrix() {

    # For variable "$JHIPSTER_MATRIX", see section "matrix" of ../.travis.yml
    if [ $workOnAllProjects -eq 0 ] ; then
        JHIPSTER="$1"
        JHIPSTER_MATRIX=`grep --color=never "$JHIPSTER\s" \
            <<< "$TRAVIS_DOT_YAML_PARSED"` \
            || exitScriptWithError \
            "\n\nFATAL ERROR: " \
            "$JHIPSTER is not a correct sample." \
            "Please read \`$ ./build-samples.sh help'."
    else
        JHIPSTER_MATRIX=$1
        JHIPSTER=`cut -d ' ' -f 1 <<< "$JHIPSTER_MATRIX"`
        echo $JHIPSTER
    fi

    # PROFILE AND PROTRACTOR REDEFINITION
    # Retrieve ../.travis.yml, section matrix
    # -s, because otherwise display first column. Other `cut` should not
    # have this option, for this reason (we want display the first column,
    # even if there isn't several columns.
    local travisVars=`cut -s -d ' ' -f 2- <<< "$JHIPSTER_MATRIX"`
    while IFS=$' ' read -r defVar ; do
        eval "$defVar"
    done <<< "$travisVars"

}

# function yarnLink() {{{2
function yarnLink() {
    echo -e "\n\n*********************** yarn link\n"
    mkdir -p "$APP_FOLDER"/.jhipster/
    cd "${APP_FOLDER}"
    yarn init -y
    command yarn link "generator-jhipster" || \
        exitScriptWithError "FATAL ERROR: " \
            "you havn't execute \`yarn link' in a folder " \
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
        exitScriptWithError "FATAL ERROR: " \
            "'$JHIPSTER_TRAVISReal and '$GENERATOR_JHIPSTER_FOLDER_REAL' " \
            "are not the same folders"
    else
        echo "Command \`yarn link' seems corect."
    fi
}

# GENERATE SAMPLES {{{1
# ********************
# ********************
# ********************
# ********************

# Executed when the first argument of the script is "generate" and "buildandtest"
# ********************

# function testGeneratorJhipster() {{{2
function testGeneratorJhipster() {

    echo -e "\n\n*********************** yarn test in generator-jhipster\n"
    if [ "$workOnAllProjects" -eq 0 ] ; then
        # Corresponding to "Install and test JHipster Generator" in
        # ./scripts/00-install-jhipster.sh
        cd -P "$JHIPSTER_TRAVIS"
        cd "../"
        echo "We are at path: '`pwd`'".
        echo "Your branch is: '" `git rev-parse --abbrev-ref HEAD` "'."
        local confirmationFirstParameter=`echo -e "Do you want execute " \
            "\\\`yarn test' in " \
            "generator-jhipster before generate the project " \
            "(skip 1° if you havn't \\\`docker-compose' installed" \
            "2° if you want only generate a new project)? [y/n] "`
        local execConfirmed=`echo -e "command -v " \
            "docker-compose && " \
            "yarn test " \
            "|| exitScriptWithError " \
            "FATAL ERROR: docker-compose not installed. Please install it."`
        confirmationUser "$confirmationFirstParameter" \
            "$execConfirmed"
        unset confirmationFirstParameter execConfirmed
    fi
    # Below executed if ("$workOnAllProjects" -eq 1) and ("$workOnAllProjects"
    # -eq 0 AND response of the question above is 'y')
    yarn test
    if [ $? -gt 0 ] ; then
        return 1
    fi
}

# function generateProject() {{{2
# Corresponding of the entry "install" in ../.travis.yml
function generateProject() {

    testGeneratorJhipster
    # Script below is done with function testGeneratorJhipster() launched above.
    # time source ./scripts/00-install-jhipster.sh

    echo -e "\n\n*********************** Copying entities for '$APP_FOLDER'\n"
    set -x
    cd "${JHIPSTER_TRAVIS}"
    time source ./scripts/01-generate-entities.sh
    set +x
    if [ $? -gt 0 ] ; then
        return 1
    fi

    echo -e "\n\n*********************** Building $APP_FOLDER\n"
    set -x
    cd "${JHIPSTER_TRAVIS}"
    time source ./scripts/02-generate-project.sh
    set +x
    if [ $? -gt 0 ] ; then
        return 1
    fi

    # Do not run command below for this script (this script is only for Travis)
    # time source ./scripts/03-replace-version-generated-project.sh

}


# BUILD AND TEST SAMPLES {{{1
# ********************
# ********************
# ********************
# ********************

# Executed when the first argument of the script is "buildandtest"
# *******************
function buildAndTestProject() {
    # GENERATE PROJECT
    # ********
    # Corresponding of the entry "install" in ../.travis.yml
    generateProject "$1"
    if [ $? -gt 0 ] ; then
        return 1
    fi
    # BUILD AND TEST
    # ********
    # Corresponding of the entry "script" in .travis.yml


    echo -e "\n\n*********************** Start docker container\n"
    set -x
    cd "${JHIPSTER_TRAVIS}"
    command -v docker-compose && \
        time source ./scripts/03-docker-compose.sh || \
        echo "\`docker-compose' not installed. Please install it."
    set +x
    echo -e "\n\n*********************** Testing '$DIR-sample'\n"

    set -x
    cd "${JHIPSTER_TRAVIS}"
    time source ./scripts/04-tests.sh
    set +x
    if [ $? -gt 0 ] ; then
        return 1
    fi

    echo -e "\n\n*********************** Run and test '$DIR-sample'\n"
    set -x
    cd "${JHIPSTER_TRAVIS}"
    time source ./scripts/05-run.sh
    set +x
    if [ $? -gt 0 ] ; then
        return 1
    fi

    echo -e "\n\n*********************** Launch Sonar analysis\n"
    set -x
    cd "${JHIPSTER_TRAVIS}"
    time source ./scripts/06-sonar.sh
    set +x
    if [ $? -gt 0 ] ; then
        return 1
    fi

    return 2
}

# CLEAN SAMPLES {{{1
# ****************
# ****************
# ****************
# ****************

# Executed when the first argument of the script is "clean", without a second
# argument
# *****************
function cleanProject() {
    local dir="$1"
    echo -e "\n\n*********************** Cleaning '$dir'\n"
    rm -rf "$JHIPSTER_SAMPLES/""$dir"
}

# Executed when the first argument of the script is "clean", without second
# argument
function cleanAllProjects() {
    local confirmationFirstParameter=`echo -e "Warning: " \
        "are you sure to delete " \
        "all samples/*-sample [y/n]? "`
    confirmationUser "confirmationFirstParameter" \
        'echo ""' \
        'exitScriptWithError "ABORTED."'
    unset confirmationFirstParameter
    # for dir in $(ls -1 "$JHIPSTER_SAMPLES"); do
    #     if [ -f "$JHIPSTER_SAMPLES/""$dir""-sample/.yo-rc.json" ]; then
    #         cleanProject "$dir-sample"
    #     else
    #         echo "'$dir-sample': Not a JHipster project. Skipping"
    #     fi
    # done
    while IFS= read -r dir ; do
        cleanProject "$dir-sample"
    done <<< "$TRAVIS_DOT_YAML_PARSED"
}


# LAUNCH SCRIPT FOR ONLY ONE SAMPLE {{{1
# ****************
# ****************
# ****************
# ****************

function launchScriptForOnlyOneSample() {
    local methodToExecute="$1"

    # define JHIPSTER, and redifine if necessary PROFIL and PROTRACTOR
    retrieveVariablesInFileDotTravisSectionMatrix "$2"

    # redifine APP_FOLDER as explained in MAIN section
    APP_FOLDER="$JHIPSTER_SAMPLES/""$JHIPSTER""-sample"

    time {
        echo -e "When this build and test will be finished," \
            "the end of this file will be 'errored' (for error) " \
            "or 'finished' (for sucess)." \
            "\n\n'$JHIPSTER_MATRIX' ready to launch!\n" \
            "**********************\n\n"

        # Instantiate logfilename
        local branchName=`git rev-parse --abbrev-ref HEAD`
        local beginLogfilename=`echo -e \
            "${JHIPSTER_TRAVIS}"/"$branchName"-"$DATEBININSCRIPT"-"$JHIPSTER"`
        local logfilename="${beginLogfilename}.pending.local-travis.log"
        createLogFile "$logfilename" "$JHIPSTER"
        echo -e  "\n\n'$JHIPSTER_MATRIX' is launched!\n"

        testIfLocalSampleIsReady
        yarnLink
        oldPATH="$PATH"
        export PATH="${APP_FOLDER}"/node_modules:"$PATH"
        "$methodToExecute"
        PATH="$oldPATH"
    }

    if [ $? -gt 0 ] ; then
        local logrenamed="${beginLogfilename}.errored.local-travis.log"
        mv "$logfilename" "$logrenamed"
        unset logrenamed
    else
        local logrenamed="${beginLogfilename}.passed.local-travis.log"
        mv "$logfilename" "$logrenamed"
        unset logrenamed
    fi
}

# LAUNCH SCRIPT FOR ALL SAMPLES {{{1
# ********************
# ********************
# ********************
# ********************

# function wrapperLaunchScript() {{{2
function wrapperLaunchScript() {
    # Display stderr on terminal.
    echo -e "\n$localJHIPSTER_MATRIX launched in background at " \
        "`date +%r`! \n\n" \
        "See logfiles in `pwd`\n" \
        "When this build and test will be finished," \
        "the end of file will be 'errored' (for error) " \
        "or 'finished' (for sucess)."
    launchScriptForOnlyOneSample "$methodToExecute" \
        "$localJHIPSTER_MATRIX" &
    # exec > >(tee "${logfilename}") 2> >(tee "${logfilename}")
    wait $!
    if [ $? -eq 0 ] ; then
        echo -e "\n\n'$localJHIPSTER_MATRIX' passed."
    else
        echo -e "\n\n'$localJHIPSTER_MATRIX' errored."
    fi
}

function launchScriptForAllSamples() {
    local methodToExecute="$1"
    echo -e "\nWarning: if you run all scripts it could take long time!\n" \
        "Don't forget to check \`./build-samples.sh help"
    local confirmationFirstParameter=`echo -e "Warning: are you sure to run" \
        "'$methodToExecute' and delete all samples/*-sample [y/n]? "`
    confirmationUser "$confirmationFirstParameter" \
        'echo ""' \
        'exitScriptWithError "ABORTED."'
    unset confirmationFirstParameter

    read -t 1 -n 10000 discard || echo ""
    echo
    local question=`echo -e "How many process" \
        "do you want to launch in same time (Travis CI launch 4 process)? " \
        ""`
    local -i typeAnswer=1
    while [[ "$typeAnswer" -eq 1 ]] ; do
        read -p "$question" -n 1 -r
        if [[ "$REPLY" =~ [1-9] ]] ; then
            local -i numberOfProcess=$REPLY
            echo "" ;
            typeAnswer=0
        else
            echo -e "\nPlease answer a number between 1 and 9."
            typeAnswer=1
        fi
        echo "" ;
    done

    timeSpan=15
    while IFS=$'\n' read -r localJHIPSTER_MATRIX ; do
        # TODO ask how many process to launch in same time.
        # Do not use `ps -o pid,stat,command -C "build-samples.sh"'
        # because display zombie process.
        while [ `ps -o pid,command \
                | grep --color=never build-samples.sh \
                | wc -l` -ge $(($numberOfProcess+4)) ] ; do
            # ps -o pid,stat,command | grep "build-samples.sh"
            sleep "$timeSpan"
        done
        ELAPSED=`echo -e "Elapsed: $(($SECONDS / 3600))" \ "hrs " \
            "$((($SECONDS / 60) % 60)) min " \
            "$(($SECONDS % 60))sec"`
        echo -e "\n$ELAPSED\n\n"
        wrapperLaunchScript &
    done <<< "$TRAVIS_DOT_YAML_PARSED"
    wait $!
}

# MAIN {{{1
# ****************
# ****************
# ****************
# ****************

# Global constants and variables {{{2

# GLOBAL CONSTANTS COPIED FROM ../.travis.yml
# ***********
# PROFILE and PROTRACTOR could be redifined in buildAndTestProject
PROFILE="dev"
PROTRACTOR=0

RUN_APP=1
JHIPSTER_TRAVIS="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
JHIPSTER_SAMPLES="$JHIPSTER_TRAVIS/samples"
JHIPSTER_SCRIPTS="$JHIPSTER_TRAVIS/scripts"
# APP_FOLDER redefined in function launchScriptForOnlyOneSample()
# APP_FOLDER="$HOME/app"
UAA_APP_FOLDER="$JHIPSTER_SAMPLES/uaa-sample"
# environment properties
SPRING_OUTPUT_ANSI_ENABLED="ALWAYS"
SPRING_JPA_SHOW_SQL="false"

# GLOBAL CONSTANTS SPECIFIC TO ./build-samples.sh (this script)
# **********
# Should be unique thanks command `date'.
DATEBININSCRIPT=`date +%Y-%m-%dT%H_%M_%S_%N`

## Retrieve ../.travis.yml and parse it
travisDotYml="${JHIPSTER_TRAVIS}/../.travis.yml"
if [ ! -f "$travisDotYml" ] ; then
    exitScriptWithError "'$travisDotYml' doesn't exist."
fi
TRAVIS_DOT_YAML_PARSED="`grep --color=never -E \
    '^    - JHIPSTER=' "$travisDotYml" | sed -n -e 's/    - JHIPSTER=//p'`"
unset travisDotYml

# Count time in this script
SECONDS=0
# Argument parser {{{2
# ****************

if [[ "$#" -gt 2 ]] ; then
    # could not be local because we are not in a function.
    firstArgument=`echo -e "\n\n\nFATAL ERROR: to much arguments. " \
        "Please see \\\`./build-samples.sh help'".`
    exitScriptWithError "$firstArgument"
    unset firstArgument
fi
cd "${JHIPSTER_TRAVIS}"
if [ ! -z "${1+x}" ] ; then
    if [ "$1" = "help" ]; then
        usage
        exit 0
    fi
    testRequierments
    if [ "$1" = "generate" ]; then
        if [ ! -z "${2+x}" ] ; then
            workOnAllProjects=0
            launchScriptForOnlyOneSample generateProject "$2"
        else
            workOnAllProjects=1
            time launchScriptForAllSamples generateProject
        fi
    elif [ "$1" = "buildandtest" ]; then
        if [ ! -z "${2+x}" ] ; then
            workOnAllProjects=0
            launchScriptForOnlyOneSample buildAndTestProject "$2"
        else
            workOnAllProjects=1
            time launchScriptForAllSamples buildAndTestProject
        fi
    elif [ "$1" = "clean" ]; then
        # Don't test with ../.travis.yml, contrary to above
        # Don't test if the directory exists (rm -rf).
        if [ ! -z "${2+x}" ] ; then
            time cleanProject "'$2'-sample"
        else
            time cleanAllProjects
        fi
    else
        firstArgument=`echo -e "\n\n\nFATAL ERROR: incorrect argument. " \
            "Please see \\\`$ ./build-samples.sh help'".`
        exitScriptWithError "$firstArgument"
    fi
else
    usage
fi

# vim: foldmethod=marker sw=4 ts=4 et textwidth=80
