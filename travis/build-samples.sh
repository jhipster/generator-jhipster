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

# Disclaimer: this script emulate Travis builds: it isn't executed on remote
# Travis instance. Only scripts under ./travis/script are executed by Travis CI.
# For a real local Travis build, see
# https://docs.travis-ci.com/user/common-build-problems/#Troubleshooting-Locally-in-a-Docker-Image.

# Notes for developpers of this script: all variables are escaped, it's a good
# practice because if there is space between world, it could cause errors.
# Check if all variables are escaped thanks perl and regex look around :
# $ perl -ne "printf if /(?<\!\(\()(?<\!\")(?<\!')(?<\!\\\\\`)\\\$(?\!\()(?\!\s)(?\!\?)(?\!\\')/" build-samples.sh

# TODO check if variables are properly unsetted in functions belong of a scope.
# In bash, inner functions belong same scope than outer function (we could
# see that with keyword "local"
# TODO say to the original author of this script: don't use keyword "source"
# it launches script in current execution context. So exit 0 exit all!
# TODO check if all escapes of set -e with `command || commandIfFailure' are
# goode. Otherwise replace it by if statement.
# TODO add a test to check if we have enough size.
# TODO check https://google.github.io/styleguide/shell.xml

# TODO improve separations in log files between start of ./scripts/*.sh
# log file

# PREPARE SCRIPT {{{1
# *********
# *********
# *********
# *********

# option -x for debug purpose.
# set -x
# # DO NOT REMOVE `set -e`
set -e
set -o nounset

function erroredAllPendingLog() {
    # Wait all
    sleep 5
    find -maxdepth 1 -name "*local-travis.log" -print0 | \
        while IFS= read -d '' -r file ; do
            if [[ $file == *".pending."* ]] ; then
                mv "$file" `sed 's/.pending./.errored./g' <<< "$file"`
            fi
        done
}

# Works sometime
# TODO ADD THIS TRAP ON ./script/*.sh, because doesn't raised here.
trap ctrl_c INT
function ctrl_c() {
    cd "${JHIPSTER_TRAVIS}"
    erroredAllPendingLog
    echo "Exit by user."
    exit 130
}

# Works sometime
trap finish EXIT
function finish() {
    # Do not add line below, because this script finish before
    # all its childs finish (background processes).
    # erroredAllPendingLog
    echo "It's the end of this process."
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
    echo "$@"
    eval "$@"
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
    # TODO test if you docker is launched.

    echo -e "\nUsage: '$me' generate [sample_name] " \
        "| buildandtest [sample_name]|clean [sample_name] | help\n" \
    "  * Without optional parameter, 'generate', 'buildandtest' and 'clean' " \
            "operate for all samples listed below.\n"\
    "  * Arguments 'generate', 'buildandtest' and 'clean' could be apply for " \
            "one sample_name below.\n" \
    "\n'sample_name' could be:\n" \
    "${list_of_samples}\n" \
    "\nThis samples could be deleted generator-jhipster/.travis.yml" \
    "under section 'matrix'. Do not hesitate to delete some build to improve" \
    "speed!" \
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
    "\`$ ./build-samples.sh help' => display the previous message" \
    "\n\nNote: We recommand to use Node.Js LTS. Check if you use it.\n"

    exit 0
}

# PREPARE LOCAL SAMPLE {{{1
# ********************
# ********************
# ********************
# ********************

# function treatEndOfBuild() {{{2
function treatEndOfBuild() {
    # TODO treat for REACT. React has its own node_modules.
    # React should not be symlinked.
    printCommandAndEval mv "${LOGFILENAME}" "${logrenamed}"
    # Because take 1.1 Go ! Too much !
    if [[ -z "${generateNode_Modules_Cache_Var+x}" ]] ; then
        printCommandAndEval rm -Rf "${APP_FOLDER}/node_modules"
        printCommandAndEval ln -s "${NODE_MODULES_CACHE_SAMPLE}/node_modules" \
            "${APP_FOLDER}"
    fi
}

# function finishSampleWithError() {{{2
function finishSampleWithError() {
    >&2 echo -e "$JHIPSTER_MATRIX has faild.\n$@" | tee /dev/fd/4
    local logrenamed="${beginLogfilename}"".errored.""${endofLogfilename}"
    treatEndOfBuild
    unset logrenamed
    exit 15
}

# function launchNewBash() {{{2
function launchNewBash() {
    local pathOfScript="$1"
    time bash "$pathOfScript" || \
        finishSampleWithError "'$pathOfScript' finished with error."
    unset pathOfScript
}

# function printWarningUseCacheNodeModules() {{{2
function printWarningUseCacheNodeModules() {
    # TODO add a git pull hook to delete automatically "generated" file
    # TODO if we build only one sample
    # (eg. `./build-samples.sh generate react-default')
    # test if it is a react sample.
    # TODO when above done modify below
    if [[ -d "${NODE_MODULES_CACHE_SAMPLE}" ]] ; then
        echo -e "\n\nBE CARREFUL LOCAL BUILD FOR ANGULAR SAMPLES " \
            "USE CACHED NODE_MODULES\n." \
            "So if you done a \`git pull' " \
            "or if you modifiy something relative to \`package.json', " \
            "you could not see bugs\n. " \
            "In this case, remove '${NODE_MODULES_CACHE_SAMPLE}', " \
            "then launch tests again" \
            "(e.g. \`./build-samples.sh buildandtest ngx-default'): " \
            "it will don't use node_modules cache. \n\n"
        sleep 3
    fi
}

# function testRequierments() {{{2
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

    printCommandAndEval "java -version" || "exitScriptWithError '$argument'" \
        "FATAL ERROR: please install java."
    echo

    printCommandAndEval "javac -version" || "exitScriptWithError" \
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
    echo

}

# function printInfoBeforeLaunch() {{{2
function printInfoBeforeLaunch() {
    export PROMPT_COMMAND=""
    export PS1="+ "
    echo -e "\n\n* Your log file will be '$LOGFILENAME'\n" \
        "* When build will finish, The end of this filename shoule be renamed" \
        "'errored' or 'passed'.\n" \
        "* On this file lines started by '$PS1' are bash" \
        "command. Useful to know which command fail.\n" \
        "* See progress in this file. Do not forget to refresh it!"
    # echo value used
    if [[ -z "${generateNode_Modules_Cache_Var+x}" ]] ; then
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

# createlogfile() {{{2
function createLogFile() {
    cd "${JHIPSTER_TRAVIS}"
    touch "$LOGFILENAME" || exitScriptWithError "FATAL ERROR: could not " \
        "create '$LOGFILENAME'"
    if [ "$workOnAllProjects" -eq 0 ] ; then
        exec > >(tee "${LOGFILENAME}") 2> >(tee "${LOGFILENAME}")
    else
        printInfoBeforeLaunch
        exec > "${LOGFILENAME}" 2> "${LOGFILENAME}"
    fi
    # Otherwise folowing command is started before function createLogFile is
    # finished.
    sleep 5
    printInfoBeforeLaunch
    testRequierments
}

# function testIfLocalSampleIsReady() {{{2
function testIfLocalSampleIsReady() {
    if [ ! -f "$JHIPSTER_SAMPLES/""$JHIPSTER""/.yo-rc.json" ]; then
        finishSampleWithError "FATAL ERROR: not a JHipster project."
    fi
    [[ "$workOnAllProjects" -eq 1 ]] && rm -rf "${APP_FOLDER}"
    if [[ -e "$APP_FOLDER" ]] ; then
        local confirmationFirstParameter=`echo -e  \
            "Warning: '${APP_FOLDER}' exists. Do you want delete it? [y/n] "`
        local argument="ABORTED: rename this folder, then restart script."
        local execInfirmed="finishSampleWithError '$argument'"
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
    # -s, because otherwise display first column. Other `cut` should not
    # have this option, for this reason (we want display the first column,
    # even if there isn't several columns.
    local travisVars=`cut -s -d ' ' -f 2- <<< "$JHIPSTER_MATRIX"`
    echo "$travisVars"
    # https://stackoverflow.com/questions/2821043/allowed-characters-in-linux-environment-variable-names
    if [[ -z "$travisVars" ]] && \
        [[ "$travisVars" =~ "[a-zA-Z0-9_].*" ]] ; then
        while IFS=$' ' read -r defVar ; do
            export "$defVar"
        done <<< "$travisVars"
    fi

}

# function yarnLink() {{{2
function yarnLink() {
    echo -e "\n\n*********************** yarn link\n"
    mkdir -p "$APP_FOLDER"/
    cd "${APP_FOLDER}"
    yarn init -y
    command yarn link "generator-jhipster" || \
        finishSampleWithError "FATAL ERROR: " \
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
        finishSampleWithError "FATAL ERROR: " \
            "'$JHIPSTER_TRAVISReal and '$GENERATOR_JHIPSTER_FOLDER_REAL' " \
            "are not the same folders"
    else
        echo "Command \`yarn link' seems corect."
    fi
    unset GENERATOR_JHIPSTER_FOLDER JHIPSTER_TRAVISReal
}

# GENERATE SAMPLES {{{1
# ********************
# ********************
# ********************
# ********************

# function generateNode_Modules_Cache() {{{2
function generateNode_Modules_Cache() {
    # Display stderr on terminal.
    if ls "${NODE_MODULES_CACHE_SAMPLE}"/*."${BRANCH_NAME}".*.local-travis.log \
        1> /dev/null 2>&1
    then
        return 0
    fi

    echo -e "\n\n*********************** Before start, " \
        "'$NODE_MODULES_CACHE_SAMPLE' should be created.\n"

    rm -Rf "${NODE_MODULES_CACHE_SAMPLE}"
    local shortDate=`date +%m-%dT%H_%M`
    local beginLogfilename=`echo -e \
        "${JHIPSTER_TRAVIS}"/node_modules_cache."${shortDate}"."${BRANCH_NAME}"`
    local endofLogfilename="local-travis.log"

    printWarningUseCacheNodeModules

    local LOGFILENAME="${beginLogfilename}"".pending.""${endofLogfilename}"

    local -i generateNode_Modules_Cache_Var=1
    # We need to have saved the original descriptors them somewhere to restore
    # the original descriptors.
    # Behaviour changed in below createLogFile()
    exec 3>&1 4>&2
    createLogFile

    time {
        mkdir -p "${NODE_MODULES_CACHE_SAMPLE}"
        cd "${JHIPSTER_TRAVIS}"
        cp './samples/node_modules_cache/.yo-rc.json' \
            "${NODE_MODULES_CACHE_SAMPLE}" || \
            finishSampleWithError "FATAL ERROR: not a JHipster project."


        echo -e "\nGenerate empty sample in foreground " \
            "to cache node_modules at `date +%r`! \n\n"

        APP_FOLDER="${NODE_MODULES_CACHE_SAMPLE}"
        cd "$APP_FOLDER"
        yarnLink || finishSampleWithError

        echo -e "\n\n*********************** Generate project " \
            "for retrieve its folder node_modules\n"
        cd "${NODE_MODULES_CACHE_SAMPLE}"
        jhipster --force --no-insight --skip-checks --with-entities --skip-git \
            --skip-commit-hook  && local -i fail=0 || local -i fail=1
        if [[ "${fail}" -eq 0 ]] ; then
            echo "All done."
            local logrenamed="${beginLogfilename}".passed."${endofLogfilename}"
            treatEndOfBuild
            cp "${logrenamed}" "${NODE_MODULES_CACHE_SAMPLE}"
            else
            finishSampleWithError "FATAL ERROR: " \
                "Failure during generation of the no-entity sample"
        fi
    }

    # Restore the originals descriptors.
    # Behaviour changed in createLogFile()
    exec 1>&3 2>&4

    unset shortDate beginLogfilename endofLogfilename fail
    unset APP_FOLDER logrenamed
    unset generateNode_Modules_Cache_Var
}


# function doestItTestGeneratorJHipster() {{{2
function doestItTestGeneratorJHipster() {

    if [ "$workOnAllProjects" -eq 0 ] ; then
        echo -e "\n\n*********************** yarn test in generator-jhipster\n"
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

# function generateProject() {{{2
# Executed when the first argument of the script is "generate" and
# "buildandtest"
# ********************
# Corresponding of the entry "install" in ../.travis.yml
function generateProject() {

    if [[ "${TESTGENERATOR}" -eq 1 ]] \
        || ( [[ "$workOnAllProjects" -eq 1 ]] && \
        [[ "${JHIPSTER}" == "ngx-default"  ]] ) ; then
        # Corresponding to "Install and test JHipster Generator" in
        # ./scripts/00-install-jhipster.sh
    echo -e "\n\n*********************** yarn test in generator-jhipster\n"
        echo "We are at path: '`pwd`'".
        echo "Your branch is: '$BRANCH_NAME'."
        cd -P "$JHIPSTER_TRAVIS"
        printCommandAndEval pwd
        # TODO should we add yarn install?
        yarn test || finishSampleWithError "Fail during test of the Generator." \
            " (command 'yarn test' in `pwd`)"
    fi
    # Script below is done with function code above.
    # time bash ./scripts/00-install-jhipster.sh

    echo -e "\n\n*********************** Copying entities for '$APP_FOLDER'\n"
    cd "${JHIPSTER_TRAVIS}"
    launchNewBash "./scripts/01-generate-entities.sh"

    echo -e "\n\n*********************** Building '$APP_FOLDER'\n"
    cd "${JHIPSTER_TRAVIS}"
    launchNewBash "./scripts/02-generate-project.sh"

    # Do not run command below for this script (this script is only for Travis)
    # time bash ./scripts/03-replace-version-generated-project.sh

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

    generateProject
    # BUILD AND TEST
    # ********
    # Corresponding of the entry "script" in .travis.yml

    echo -e "\n\n*********************** Start docker container\n"
    set -x
    cd "${JHIPSTER_TRAVIS}"
    # TODO it seems we must be sudo
    # Maybe a problem with .dockignore:
    # https://unix.stackexchange.com/questions/413015/docker-compose-cannot-build-without-sudo-but-i-can-run-containers-without-it
    # launchNewBash "./scripts/03-docker-compose.sh"

    echo -e "\n\n*********************** Testing '${JHIPSTER}-sample'\n"
    cd "${JHIPSTER_TRAVIS}"
    launchNewBash "./scripts/04-tests.sh"

    echo -e "\n\n*********************** Run and test '${JHIPSTER}-sample'\n"
    cd "${JHIPSTER_TRAVIS}"
    launchNewBash "./scripts/05-run.sh"

    echo -e "\n\n*********************** Launch Sonar analysis\n"
    cd "${JHIPSTER_TRAVIS}"
    launchNewBash "./scripts/06-sonar.sh"

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
    export APP_FOLDER="${JHIPSTER_SAMPLES}/""${JHIPSTER}""-sample"
    testIfLocalSampleIsReady

    declare -i TESTGENERATOR=0
    doestItTestGeneratorJHipster

    if [[ "$workOnAllProjects" -eq 0 ]] ; then
        generateNode_Modules_Cache
        # Redefined APP_FOLDER, because erased in generateNode_Modules_Cache()
        # above
        export APP_FOLDER="${JHIPSTER_SAMPLES}/""${JHIPSTER}""-sample"
    fi

    time {
        echo -e "\n\n'${JHIPSTER_MATRIX}' ready to launch!\n" \
            "**********************\n\n"

        # Instantiate LOGFILENAME
        local beginLogfilename=`echo -e \
            "${JHIPSTER_TRAVIS}"/"${BRANCH_NAME}"."${DATEBININSCRIPT}"`
        local endofLogfilename=`echo -e "${JHIPSTER}"".local-travis.log"`
        local LOGFILENAME="${beginLogfilename}"".pending.""${endofLogfilename}"
        # We need to have saved the original descriptors them somewhere to restore
        # the original descriptors.
        # Behaviour changed in below createLogFile()
        exec 3>&1 4>&2
        createLogFile
        echo -e  "\n\n'${JHIPSTER_MATRIX}' is launched!\n"

        echo -e "\n\n*********************** Link " \
            "'$NODE_MODULES_CACHE_SAMPLE' to '$APP_FOLDER'\n"
        mkdir -p "${APP_FOLDER}"
        # No `ln -s' due to
        # https://github.com/ng-bootstrap/ng-bootstrap/issues/2283
        # But `cp -R' works good ! ;-) ! Probably more reliable.
        cp -R "${NODE_MODULES_CACHE_SAMPLE}/node_modules" \
            "${APP_FOLDER}"
        local oldPATH="${PATH}"
        export PATH="${APP_FOLDER}"/node_modules:"$PATH"
        "${methodToExecute}"
        PATH="${oldPATH}"
        unset oldPATH

        # Restore the originals descriptors.
        # Behaviour changed in createLogFile()
        exec 1>&3 2>&4
    }

    # Thanks option `set -e`, if we are here we are sure it's a success!
    local logrenamed="${beginLogfilename}"".passed.""${endofLogfilename}"
    treatEndOfBuild
    unset methodToExecute logrenamed
    # do not unset beginLogfilename and endofLogfilename, unsed in another
    # function
}

# LAUNCH SCRIPT FOR ALL SAMPLES {{{1
# ********************
# ********************
# ********************
# ********************


# function wrapperLaunchScript() {{{2
function wrapperLaunchScript() {
    # Display stderr on terminal.
    echo -e "\n'${localJHIPSTER_MATRIX}' launched in background at " \
        "`date +%r`! \n\n"
    launchScriptForOnlyOneSample "${methodToExecute}" \
        "${localJHIPSTER_MATRIX}" &
    # exec > >(tee "${LOGFILENAME}") 2> >(tee "${LOGFILENAME}")
}

# function launchScriptForAllSamples() {{{2
function launchScriptForAllSamples() {
    local methodToExecute="${1}"
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

    timeSpan=15
    while IFS=$'\n' read -r localJHIPSTER_MATRIX ; do
        # TODO ask how many processes to launch in same time.
        # Do not use `ps -o pid,stat,command -C "…"'
        # because display zombie processes.
        while [ `ps -o pid,command \
                | grep --color=never bash \
                | wc -l` -gt $(($numberOfProcesses+2)) ] ; do
            # do not forget there is also `grep bash` returned by `ps` !
            ps -o pid,stat,command | grep "bash"
            sleep "$timeSpan"
        done
        ELAPSED=`echo -e "Elapsed: $(($SECONDS / 3600))" \ "hrs " \
            "$((($SECONDS / 60) % 60)) min " \
            "$(($SECONDS % 60))sec"`
        echo -e "\n'$ELAPSED'\n" \
            "=========end of "$localJHIPSTER_MATRIX" ===========\n\n\n" ;
        sleep 10
        wrapperLaunchScript &
    done <<< "$TRAVIS_DOT_YAML_PARSED"
    wait
}

# MAIN {{{1
# ****************
# ****************
# ****************
# ****************

# Global constants and variables {{{2

# GLOBAL CONSTANTS COPIED FROM ../.travis.yml
# ***********
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
# **********
# Should be unique thanks command `date'. Thanks lot of `sleep' in this script
# we sure DATEBININSCRIPT will be unique.
DATEBININSCRIPT=`date +%Y-%m-%dT%H_%M_%S`

## Retrieve ../.travis.yml and parse it
travisDotYml="${JHIPSTER_TRAVIS}/../.travis.yml"
if [ ! -f "$travisDotYml" ] ; then
    exitScriptWithError "'$travisDotYml' doesn't exist."
fi
TRAVIS_DOT_YAML_PARSED="`grep --color=never -E \
    '^    - JHIPSTER=' "$travisDotYml" | sed 's/    - JHIPSTER=//p'`"
unset travisDotYml

# Count time in this script
SECONDS=0

BRANCH_NAME=`git rev-parse --abbrev-ref HEAD`

# See also ./scripts/02-generate-project.sh.
# The string "node_modules_cache-sample" is used.
NODE_MODULES_CACHE_SAMPLE="${JHIPSTER_SAMPLES}/node_modules_cache-sample"

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
            launchScriptForOnlyOneSample "generateProject" "$2"
        else
            workOnAllProjects=1
            time launchScriptForAllSamples "generateProject"
        fi
    elif [ "$1" = "buildandtest" ]; then
        if [ ! -z "${2+x}" ] ; then
            workOnAllProjects=0
            launchScriptForOnlyOneSample "buildAndTestProject" "$2"
        else
            workOnAllProjects=1
            time launchScriptForAllSamples "buildAndTestProject"
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
