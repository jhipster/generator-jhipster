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
# (Travis Docker image take lot of size, several Go for each test)

# NOTES FOR DEVELOPPERS OF THIS SCRIPT {{{2
# ============
# 1) This code is avaible at:
# https://github.com/jhipster/generator-jhipster/blob/master/travis/build-samples.sh
# 2) This script is optimisated to be readden with vim. "zo" to open fold. "zc"
# to close fold.
# 3) All variables are escaped, it's a good practice because if there is space
# between world, it could cause errors.
# Check if all variables are escaped thanks perl and regex look around :
# $ perl -ne "printf if /(?<\!\(\()(?<\!\")(?<\!')(?<\!\\\`)\\\$(?\!\()(?\!\s)(?\!\?)(?\!\\')/" build-samples.sh
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
        #         "Couldn't kill docker container '$i'"
        # done
# 12) Not about `read' built-in command

    # For new lines, the correct solution is:
    # IFS=$'\n' readarray -d '\n' array <<< "abcd
    # efj"
    # OR:
    # IFS=$'\n' readarray -d '' array <<< "abcd
    # efj"
    # OR: IFS=$'\n' readarray -d '' array <<< "abcd
    # IFS= readarray -d '\n' array <<< "abcd
    # efj"
    # OR:
    # IFS= readarray -d '' array <<< "abcd
    # efj"
    # IFS= readarray -d '' array <<< "$variableWithCariageReturn"
    # DO NOT FORGET TO SURROUND WITH CHARACTER '"', even if don't work!
    # BUT NOT
    # IFS=$"\\n" read -d \\n' -ra array <<< "abcd
    # efj"
    # ("$?" -eq 1)
    # BUT NOT
    # IFS= read -d '\n' -ra array <<< "abcd
    # efj"
    # ("$?" -eq 1)
    # BUT NOT:
    # IFS=$"\\n" read -ra array <<< "abcd
    # efj"

    # IFS=$"," read -d '\r' -ra array <<< "abcd,efj"
    # OR (beceause echo `docker ps -a` don't print new lines
    # as echo $varWithNewLines (without escapes).
    # IFS=$' ' read -ra dockerContainers <<< \
        # `docker ps -aq --filter "name=jhipster-travis-build*"`
    # IFS=$"," read -ra array <<< "abcd,efj"
    # BUT NOT
    # IFS= read -d ',' -ra array <<< "abcd,efj"
    # BUT NOT
    # IFS=$"," read -d ',' -ra array <<< "abcd,efj"
    # BUT NOT
    # IFS=$',' readarray array <<< "abcd,efj"
    # (echo "${array[0]}" = "abcd,")
    # BUT NOT
    # IFS=$"," readarray -d ',' array <<< "abcd,efj"
    # (echo "${array[0]}" = "abcd,")
    # BUT NOT
    # IFS=$"," readarray -d ',' array <<< "abcd,efj"
    # (echo "${array[0]}" = "abcd,")
    # BUT NOT:
    # IFS=$"," readarray -d '' array <<< "abcd,efj"
    # (echo "${array[0]}" = "abcd,efj")

    # To well understand `read' built-in command, see
    # how parse csv files.

    # Warning: `read -a' is not POSIX compliant, as `readarray'. Don't work
    #   for Zsh.
    # We could use also `while read' (POSIX) loop or maybe `for in' loop. "
    #    But too much verbose for a bash script.
    # I don't like `for' because I've seen there is problems
    #   for very very very long lists in an other project, in opposite of while.
    # There is an example above.
# 13) we could unset even if a variable is not setted.
# 14) Do not forget to read `man bash', especially sections " \
#    "SHELL BUILT-IN COMMANDS" AND "BUGS".
# 15)
#       function func() { local -r cc=dd ; inner ; echo -n $cc ; } && \
#       inner() { echo -n $cc ; local -r cc=gg ; echo -n $cc ;} && func
#       AS
#       function func() { local cc=dd ; inner ; echo -n $cc ; } && \
#       inner() { echo -n $cc ; ^C echo -n $cc ;} && func
#       ==> ddggdd
#       CONTRARY TO
#       function func() { cc=dd ; inner ; echo -n $cc ; } && \
#       inner() { echo -n $cc ; cc=gg ; echo -n $cc ;} && func
#       ===> ddgggg
#       We use this behaviour in generateNode_Modules_Cache()
# 16) readonly isn't transimtted to subshell (`export readonly'). But
#       a var could be marked readonly in any moment.
# 17) Use: https://github.com/koalaman/shellcheck
# 18) Use: https://github.com/universal-ctags and
#       https://github.com/JulioJu/vimrc/blob/master/dotFilesOtherSoftwareVimCompliant/ctags.d/sh.ctags
#       My convention:
#       In function I use keyword `local' to define local variable.
#       When I use keyword `declare' it's a global variable.
#       I never declare a global variable like `name=aa'
#       Note: `declare -g' in a function declare a global variable.
#       Note: `declare' without `-g' in a function declare a local variable.
#           but I never use that (by convention). Useful for my regex
#           pattern.
# 19) SC2015
#       Note that A && B || C is not if-then-else. C may run when A is true.
# 20) Pitfalls with `eval' command, read:
    # http://wiki.bash-hackers.org/rcwatson
    # http://wiki.bash-hackers.org/commands/builtin/eval
    # khttps://stackoverflow.com/questions/17529220/why-should-eval-be-avoided-in-bash-and-what-should-i-use-instead
    # https://medium.com/dot-debug/the-perils-of-bash-eval-cc5f9e309cae
    # always write `eval "$1"' to escape properly.
    # Write `eval' "$@"
    # If you could, prefere simple quotes than double quotes.
# 21)
    # trap of INT int ../build-samples.sh
    # is raised after trap of ./scripts/05-run.sh :-). Good.
# 23) # set -e doesn't kill the current script if a background process fail.
# 24) There is not solution to test if we are STDOUT is terminal, or not.
    # https://stackoverflow.com/questions/911168/how-to-detect-if-my-shell-script-is-running-through-a-pipe
    # https://stackoverflow.com/questions/911168/how-to-detect-if-my-shell-script-is-running-through-a-pipe

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
# GENERATE AND TEST SAMPLES `./build-samples.sh generate/generateandtest'
#   `./build-samples.sh generate [sample_name]'
#   or
#   `./build-samples.sh generateandtest [sample_name]'
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
#       * functions generateProject() generateAndTestProject() who
#       launch scripts (see explanations in paragraph below).
#   * III 1) GENERATE NODE_MODULES CACHE
#       * Main function is generateNode_Modules_Cache() who generate
#       a single node_modules. Why this?
#       On my computer (JulioJu) I save 10 minutes of time for each sample.
#   * II LAUNCH ONLY ONE SAMPLE
#       * Could be seen as "MAIN" for:
#       `./build-samples.sh generate/generateandtest sample_name \
#               --consoleverbose' \
#           (three mandatory arguments)
#       * contains launchOnlyOneSample(),
#       the main function of this subtitle
#       * see explanations in paragrapher below
#   * I LAUNCH SAMPLE(S) IN BACKGROUND
#       * Could be seen as "MAIN" function for:
#       `./build-samples.sh generate/generateandtest \
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


# More explanation about parameter `generate' and `generateandtest':
# * All code corresponding to parameters `generate' and `generateandtest'
# it's in this file under title
# GENERATE AND TEST SAMPLES `./BUILD-SAMPLES.SH GENERATE/generateandtest'
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
#    * If the second argument is `generateandtest', we launch
#    only function generateAndTestProject()
#    who launch function generateProject() and scripts ./scripts/04-tests.sh,
#    ./scripts/05-run.sh
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
# TODO tell to the original author of this script: don't use keyword "source"
# it launches script in current execution context. So exit 0 exit all!
# TODO add a test to check if we have enough size.
# TODO check https://google.github.io/styleguide/shell.xml
# TODO See others todo in this file.
# TODO replace all references of the name of this script by local
# me='$(basename "$0")'
# or "${BASH_SOURCE[0]}". (see reference of me in function usage()
# TODO actually there is collisions when we launch several builds in same time
#   they want all port 8080.
# TODO improve comments.
# TODO the convention should be: uppercase only global variabless.
    # scriptcheck check if variable is assigned only for variables
    # with lowercase
    # https://github.com/koalaman/shellcheck/wiki/SC2154
    # Morover, always use immutable variable is good, so uppercase all
    # immutables variables is a no sens because almost all variables
    # should be constants.
    # Differ from
    # https://google.github.io/styleguide/shell.xml?showone=Constants_and_Environment_Variable_Names#Constants_and_Environment_Variable_Names
# TODO check if is use only lower Camel Case and snake case for capitals.

# PREPARE SCRIPT {{{1
# ==============================================================================
# ==============================================================================
# ==============================================================================
# ==============================================================================

# After expanding each simple command, for command, case command, select
# command, or arithmetic for command, display the expanded value of PS4,
# followed by the command and its expanded arguments or  associated  word list.
# set -x

# Print all lines in the script before executing them, which helps identify
# which steps failed. For debug purpose.
# set -v

# # DO NOT REMOVE `set -e`
# Exit as soon as one command returns a non-zero exit code.
set -e

# Treat unset variables as an error
set -u

# Any trap on ERR is inherited by shell functions, command substitutions, and
# commands executed in a subshell environment.  The ERR trap is normally not
# inherited in such cases.
set -E

# Any traps on DEBUG and RETURN are inherited by shell functions, command
# substitutions, and commands executed in a subshell environment.
set -T

# elapsedF() {{{2

elapsedF() {
    local -n ELAPSEDLOC="$1"
    # shellcheck disable=2034
    ELAPSEDLOC="($(date +%r) — Elapsed: $((SECONDS / 3600)) hrs \
$(((SECONDS / 60) % 60)) min $((SECONDS % 60)) sec)"
}

# Treat end of script {{{2

function erroredAllPendingLog() {
    find . -maxdepth 1 -name "*local-travis.log" -print0 | \
        while IFS= read -d '' -r file ; do
            if [[ "$file" == *".pending."* ]] ; then
                mv "$file" "$(sed 's/.pending./.errored./g' <<< "$file")"
            fi
        done
}

trap ctrl_c INT
function ctrl_c() {
    cd "${JHIPSTER_TRAVIS}"
    # dockerKillThenRm
    1>&2 echo "Exit by user."
    if [[ -e /dev/fd/4 ]] ; then
        1>&4 echo "Exit by user."
    fi
    exit 131
}

trap finish EXIT
# Raised also if receive INT command
# But not raised if there is an ubound variable.
function finish() {

    # https://en.wikipedia.org/wiki/Defensive_programming
    erroredAllPendingLog

    local WE_WANT_A_PROMPT=0
    dockerKillThenRm
    unset WE_WANT_A_PROMPT

    echo -e "\\n\\n\\nIt's the end of ./build-samples.sh.\\n\\n"
}

# trap ERR is not always performed
# https://unix.stackexchange.com/a/209507
trap 'errorInScript "$LINENO"' ERR
errorInScript() {
    1>&2 echo "In ./build-samples.sh, error on line: '$1'"
    cd "${JHIPSTER_TRAVIS}"
    erroredAllPendingLog

    local WE_WANT_A_PROMPT=0
    dockerKillThenRm
    unset WE_WANT_A_PROMPT

    exit 5
}

function exitScriptWithError() {
    1>&2 echo -e "$BRED""\\n\\nFATAL ERROR: " "${@}" "$NC""\\n\\n"
    exit 10
}

# warning() {{{3
warning() {
    echo -e "$BRED"" WARNING: " "$@" "$NC"
}


# ps4b() {{{3
ps4b() {
    echo -en "\\033[1;32m""$USER@""$HOSTNAME""\\033[0m"": "\
        "\\033[1;34m""$(dirs +0)""\\033[0m"" $ "
}

# function printFileDescriptor3() {{{2
function printFileDescriptor3() {
    [[ -e /dev/fd/3 ]] && echo -e "\\n" "$@" | tee --append /dev/fd/3 \
        || echo -e "\\n" "$@"
}

# function printCommandAndEval() {{{2
function printCommandAndEval() {
    if [[ -e /dev/fd/3 ]] && \
        [[ -e /dev/fd/4 ]] ; then
        # See function launchSamplesInBackground()
        ps4b
        echo "${@}" 1> >(tee --append /dev/fd/3) \
            2> >(tee --append /dev/fd/4)
        eval "$@" > >(tee --append /dev/fd/3) 2> >(tee --append /dev/fd/4)
    else
        ps4b
        echo "${@}"
        # https://google.github.io/styleguide/shell.xml#Eval
        # says don't use eval. But doesn't work without.
        eval "$@"
    fi
}

# function confirmationUser() {{{2
function confirmationUser() {
    # empty stdin
    # "_" is the throwaway variable
    read -r -t 1 -n 10000 _ || echo ""
    echo
    local -i typeAnswer=1
    echo -en "$BLUE"
    while [[ "$typeAnswer" -eq 1 ]] ; do
        read -p "$1" -n 1 -r
        case "$REPLY" in
            [Yy] ) echo "" ; eval "$2"; typeAnswer=1 ; break;;
            [Nn] ) if [[ ! -z "${3+x}" ]] ; then eval "$3" ; fi ;
                typeAnswer=0;;
            * ) echo -e "\\nPlease answer 'y' or 'n'."; typeAnswer=1 ;;
        esac
        echo ""
    done
    echo -en "$NC"
}

# PRINT HELP `./build-samples.sh help' {{{1
# ==============================================================================
# ==============================================================================
# ==============================================================================
# ==============================================================================

function usageClean() {
    local NODE_MODULE_SHORT_NAME='./samples/node_modules_cache-sample'
    echo -e "\\n\\t""$URED""\`./build-samples.sh clean'""$NC""\\n" \
        "1) Before each new build, ./sample/[sample-name]-sample " \
        "is systematically erased, contrary to " \
        "'${NODE_MODULE_SHORT_NAME}'\\n" \
        "2) Actually '${NODE_MODULE_SHORT_NAME} takes more " \
        "than 1 G\\n" \
        "3) After a build, [sample-name]-sample/node_modules is a" \
        "symbolic link. " \
        "Therefore, a folder [sample-name]-sample doesn't take" \
        "lot of size (just some megabytes\\n"
}

# Executed when the first argument of the script is "usage" or when there isn't
# argument who match.
# ====================
function usage() {
    local -r me=$(basename "$0")
    local -r list_of_samples=$(cut -d ' ' -f 1 <<< "$TRAVIS_DOT_YAML_PARSED")

    echo -e "\\n\\tScript than emulate well remote Travis CI build " \
        " https://travis-ci.org/jhipster/generator-jhipster\\n"

    echo -e "\\t""$URED""Usage:""$NC\\n" \
        "'$me'\\n" \
        "\\tgenerate [\\n" \
            "\\t\\tsample_name [--consoleverbose] [--skippackageapp]\\n" \
            "\\t\\t | sample_name[,sample_name][,...]\\n" \
        "\\t\\t\\n" \
        "\\t\\t[ --colorizelogfile ]\\n" \
        "\\tgenerateandtest [\\n" \
            "\\t\\tsample_name [ --consoleverbose ]\\n" \
            "\\t\\t | sample_name[,sample_name][,...]\\n" \
        "\\t\\t\\n" \
        "\\t\\t[ --colorizelogfile ]\\n" \
        "\\tstartapplication sample_nam\\n" \
        "\\tclean\\n" \
        "\\thelp\\n\\n" \
    "* \`--consoleverbose\\n" \
        "\\t=> all is printed in the console.\\n" \
        "\\tCould be used only with if there you build only one sample_name\\n"\
        "\\t(too much logs in console, not advise).\\n" \
    "* \`--colorizelogfile\\n" \
        "\\t""$BRED""This parameter is strongly advis\\n""$NC" \
        "\\t=> Keep colors in log file\\n" \
        "\\t* For Vim users install:" \
            "https://github.com/powerman/vim-plugin-AnsiEsc\\n" \
        "\\t* For IntelliJ/JetBrains users try:" \
            "https://plugins.jetbrains.com/plugin/9707-ansi-highlighte\\n" \
        "\\t* For Visual Studio Code users try:" \
            "https://marketplace.visualstudio.com/items?itemName=IBM.output-colorizer\\n" \
    "* \`--skippackageapp\\n" \
        "\\tUsable only with command \`./build-samples.sh generate [...]'\\n'"\
        "\\t=> Skip package of application. " \
            "If you want only " \
            "generate the sample to check files generated.\\n" \
        "\\t=> After this, you can't start the application with." \
            "\`./build-samples.sh startapplication sample_name'.\\n" \
        "\\t=> This parameter implies automatically ``--consoleverbose' and " \
        "\`--colorizelogfile'.\\n\\n" \
    "\\t""$URED""\`./build-samples.sh generate/generateandtest'""$NC""\\n" \
        " * They will create the travis sample project under the './samples'" \
        "folder with folder name \`[sample_name]-sample'.\\n" \
        " * \`generate' generate only a JHipster project with entities.\\n" \
        " * \`generateandtest' generate then test project(s), as Travis CI\\n" \
    "  * Without optional parameter, 'generate', and 'generateandtest' " \
            "operate for all samples listed below\\n" \
    "  * Arguments 'generate', 'generateandtest' could be apply for " \
            "one sample_name below\\n" \
    "  * For each sample, an independant log file is created. During" \
            "built time, its name contains 'pending'. " \
            "If there is a fail, its name" \
            "will contain 'errored'. If it finishes with success, its name" \
            "will contain 'passed\\n" \
    "   * When all samples are launched, there are launched in parralel." \
            "The program will ask you how much you want" \
            "launch in same tim\\n " \
        "* Before launch this commands, type \`yarn link' in the folder" \
            "./genertor-jhipster. Now you will test this generator, and not" \
            "the npm genertor-jhipster."

    echo -e "\\n\\t""$URED""\`./build-samples.sh startapplication " \
        "sample_name""$NC""\\n" \
        "Start the application generated with \`generate' " \
        "or \`generateandtest'. You could open the app on a Web browser " \
        "if it has a client."

    usageClean

    echo -e "\\t""$URED""Examples:""$NC""\\n" \
    "\`$ ./build-samples.sh generate ngx-default --colorizelogfile' " \
        "=> generate a new project at travis/samples/ngx-default-sampl\\n" \
    "\`$ ./build-samples.sh generateandtest ngx-default --colorizelogfile' " \
        "=> generate a new project at travis/samples/ngx-default-sample " \
            "then build and test it\\n" \
    "\`$ ./build-samples.sh generate --colorizelogfile' =>" \
        " generate all travis/samples/*-sample corresponding of " \
        " samples listed above\\n" \
    "\`$ ./build-samples.sh generate ngx-default,react-default " \
        "--colorizelogfile' =>" \
        " generate \`ngx-default' and \`react-default'\\n"  \
        " samples listed above\\n" \
    "\`$ ./build-samples.sh generateandtest --colorizelogfile' " \
        "=> generate build and test all " \
        "travis/samples/*-sample corresponding of samples listed above\\n" \
    "\`$ ./build-samples.sh clean' " \
        "=> delete all folders travis/samples/*-sampl\\n" \
        "=> delete especially the node_modules cache " \
        "(samples/node_modules_cache-sample) to sanitize\\n" \
    "\`$ ./build-samples.sh startapplication ngx-default' " \
        "=> start application generated. Open a Web browser at " \
        "http://localhost:8080\\n" \
    "\`$ ./build-samples.sh help' => display this hel\\n" \
    "\\n\\n\\t""$URED""Notes:""$NC""\\n" \
    "Note1: We recommand to use Node.Js LTS. Check if you use it\\n" \
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
    "\\n\\n\\t""$URED""sample_name:""$NC\\n"

    echo -e "\\n${list_of_samples}\\n\\n" \
    "* Use always \`./build-samples.sh generateandtest ngx-default' " \
            "(the more complete test). " \
            "Useful for test Server side and Angular client\\n" \
    "  * If you work on the React client try the previous and also " \
            "'react-default'\\n" \
    "  * If you work on an other functionality, chose the corresponding on\\n" \
    "* Generated files wil be under folder ./samples/sample_name-sample\\n" \
    "* Name of samples indicate their test goal. " \
    "Their configuration is (defined in '.yo-rc.json'. " \
    "Their entity is generated from folder '.jhipster'"


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
    echo -e "4) Do not forget to read \`./build-samples.sh help\\n"

    local confirmationFirstParameter=\
"Warning: are you sure to delete all samples/*-sample [y/n]? "
    confirmationUser "$confirmationFirstParameter" \
        "echo ''" \
        "exitScriptWithError 'ABORTED by user.'"
    unset confirmationFirstParameter

    local foldersSample
    foldersSample=$(find . "$JHIPSTER_SAMPLES" -maxdepth 1 \
        -type d -name "*-sample")
    if [[ -z "$foldersSample" ]] ; then
        echo -e "\\n\\n*********************** No folder ./samples/*-sample to " \
            "delete\\n"
    else
        while IFS=$'\n' read -r dirToRemove ; do
                echo -e "\\n\\n********************** Deleting '$dirToRemove\\n"
                rm -Rf "$dirToRemove"
        done <<< "$foldersSample"
    fi


    local -r NODE_MODULE_SHORT_NAME='./samples/node_modules_cache-sample'

    echo -e "\\nNote: We are sure than '${NODE_MODULE_SHORT_NAME}' " \
        "doesn't  exists:\\n     ==> you could launch a sanitzed new build\\n"
}

# GENERATE AND TEST SAMPLES `./build-samples.sh generate/generateandtest' {{{1
# ==============================================================================
# ==============================================================================
# ==============================================================================
# ==============================================================================
# function echoSmallTitle() {{{3
function echoSmallTitle() {
    if [[ "$1" == "end" ]] ; then
        local -r colorEchoTitleBuildStep="${BRED}"
    else
        local -r colorEchoTitleBuildStep="${BLUE}"
    fi
    local ELAPSED
    elapsedF ELAPSED
    echo -e "$colorEchoTitleBuildStep""\\n\\n\\n" \
        "${@:2}" " '$ELAPSED'\\n" \
        "====================================================================="\
        "\\n$NC"
}

# function echoTitleBuildStep() {{{3
function echoTitleBuildStep() {
    if [[ "$1" == "end" ]] ; then
        local -r colorEchoTitleBuildStep="${BRED}"
    else
        local -r colorEchoTitleBuildStep="${BLUE}"
    fi
    local ELAPSED
    elapsedF ELAPSED
    echo -e "${colorEchoTitleBuildStep}""\\n" \
        "===============================================================\\n" \
        "===============================================================\\n" \
        "===============================================================\\n" \
        "${@:2}" " '$ELAPSED'\\n" \
        "===============================================================\\n" \
        "===============================================================\\n" \
        "===============================================================\\n" \
        "$NC\\n"

    # ECHO in console:
    # 1. if console is branched to /dev/fd/3 (see launchSamplesInBackground())
    # 2. if we are not in function generateNode_Modules_Cache().
    # Always false if we launch this script with two arguments, like:
    # `./build-samples.sh generate ngx-default'
    if [[ -e /dev/fd/3 ]] ; then
        1>&3 echoSmallTitle "$@"
    fi
}

dockerKillThenRm() {
    # We could write in one line, like `docker kill $(docker ps -q)`
    # but less controls.
    local -a dockerContainers

    # If docker is not started.
    if ! docker info 1>> /dev/null 2>&1 ; then
        return 0
    fi

    IFS=$' ' read -ra dockerContainers <<< \
        "$(docker ps -q --filter "name=jhipster-travis-build*")"
    printCommandAndEval "docker ps -q --filter 'name=jhipster-travis-build*'"

    if [[ "$WE_WANT_A_PROMPT" -eq 1 ]] ; then
        # If `docker ps -q` is empty, "${#dockerContainers[0]}" takes value 1.
        # (IS_CONSOLEVERBOSE=1 when we are in startapplication).
        if [[ "${#dockerContainers[0]}" -gt 1 ]] ; then
            printFileDescriptor3 "There is already docker with named prefixed"\
                "by 'jhipster-travis-build*':"
            docker ps -q --filter "name=jhipster-travis-build*"
            confirmationUser "Do you want to \`kill' then \`rm' them? [y/n] " \
                "echo 'Deleting this docker images...'" \
                "errorInBuildExitCurrentSample 'ABORTED by user'"
        fi
    fi
    if [[ "${#dockerContainers[0]}" -gt 1 ]] ; then
        local -i i=0
        while [[ i -lt "${#dockerContainers[*]}" ]] ; do
            printFileDescriptor3 "Trying to kill docker container:\\n" \
                "$(docker ps --filter "id=${dockerContainers[i]}")"
            printCommandAndEval "docker kill '${dockerContainers[i]}'" \
                || exitScriptWithError "couldn't kill docker container " \
                    "'${dockerContainers[i]}'"
            printFileDescriptor3 "Docker containers killed with success."
            i=$((i+1))
        done
    fi

    IFS=$' ' read -ra dockerContainers <<< \
        "$(docker ps -qa --filter "name=jhipster-travis-build*")"
    if [[ "${#dockerContainers[0]}" -gt 1 ]] ; then
        local -i i=0
        while [[ i -lt "${#dockerContainers[*]}" ]] ; do
            printFileDescriptor3 "Trying to rm docker container:\\n" \
                "$(docker ps -a --filter "id=${dockerContainers[i]}")"
            printCommandAndEval "docker rm '${dockerContainers[i]}'" \
                || exitScriptWithError "couldn't rm docker container " \
                    "'${dockerContainers[i]}'"
            printFileDescriptor3 "Docker containers deleted with success."
            i=$((i+1))
        done
    fi

}

# TEST REQUIERMENTS  {{{2
# ====================
# ====================

# function testIfPortIsFreeWithSs() {{{3
# I suppose iproute 2 is installed on main linux distro.
function testIfPortIsFreeWithSs() {
    if [[ ! -z "${2+x}" ]] ; then
        if ss -nl | grep -q ":$1[[:space:]]" 1>> /dev/null ; then
            errorInBuildExitCurrentSample "port '$1' is busy. " \
            "It's the Server Port. You could change it in file:" \
            "'$APP_FOLDER/.yo-rc.json' Or you could stop software who uses it" \
            "(\`sudo ss -nap | grep ':$1[[:space:]]'' " \
            "to know it, then \`kill PID')."\
        else
             printFileDescriptor3 "Port '$1' is free."
         fi
    fi
    if ss -nl | grep -q ":$1[[:space:]]" 1>> /dev/null ; then
        errorInBuildExitCurrentSample "port '$1' is busy. " \
        "Please stop the software who uses it" \
        "(\`sudo ss -nap | grep '$1'' to know it, then \`kill PID')"
    else
        printFileDescriptor3 "Port '$1' is free."
    fi
}

# function testRequierments() {{{3

warningOS() {
    warning "we don't know if it could work on '$MACHINE'." \
        "If you test, please report it by open a new issue."
    sleep 20
}

function testRequierments() {
    # Why "nodejs --version"? For Ubuntu users, please see
    # https://askubuntu.com/a/521571"
    echo -e "\\n\\n"

    local -r unameOut="$(uname -s)"

    local MACHINE
    # TODO test on it ;-).
    case "${unameOut}" in
        Linux*)     MACHINE="Linux" ;;
        *BSD*)      MACHINE="BSD" ; warningOS ;;
        Darwin*)    MACHINE="Mac" ; warningOS ;;
        Microsoft*) MACHINE="WSL" ; warningOS ;;
        CYGWIN*)    exitScriptWithError "this Script could not work on Cygwin" \
            "because Node.js isn't implemented on Cygwin" ;;
        MINGW*)     MACHINE="MinGW" ; warningOS ;;
        *)          MACHINE="notKnow" ; warningOS ;;
    esac

    printCommandAndEval "node --version" \
        || errorInBuildExitCurrentSample "please install Node. " \
        "If Node is already installed, please add it in your PATH."
    echo "We recommand to use Node.Js LTS. Check if you use it."
    echo

    printCommandAndEval "yarn -v" \
        || errorInBuildExitCurrentSample "please install Yarn. " \
        "If Yarn is already installed, please add it in your PATH."
    echo

    # java send question of this version to stderr. Redirect to stdout.
    printCommandAndEval "java -version 2>&1" || \
        errorInBuildExitCurrentSample "please install java."
    echo

    # java send question of this version to stderr. Redirect to stdout.
    printCommandAndEval "javac -version 2>&1" || errorInBuildExitCurrentSample \
        "please install JDK. "
    echo

    local -r javaVersion="$(java -version 2>&1)"
    if grep -q "OpenJDK" <<< "$javaVersion" ; then
        errorInBuildExitCurrentSample \
        'do not use OpenJDK, please install Oracle Java.'
    else
        printFileDescriptor3 "No OpenJDK: good."
    # TODO SHOULD WE ADD TEST TO CHECK IF WE ARE ON JDK8?
    fi

    jhipster --version 1>> /dev/null || \
        errorInBuildExitCurrentSample \
        "please install JHipster globally. " \
        "(\`$ yarn global install jhipster') " \
        "If JHipster is already installed, please add it in your PATH."
    echo

    if [[ "$IS_STARTAPPLICATION" -eq 0 ]] \
        && [[ "$IS_GENERATEANDTEST" -eq 1 ]] ; then
        if [[ "$MACHINE" == "Mac" ]] ; then
            printCommandAndEval \
               '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'\
                    '--version' \
                || printCommandAndEval \
                    "/Applications/Chromium.app/Contents/MacOS/Chromium \
                        --version" \
                || errorInBuildExitCurrentSample "please install" \
                        "Google Chrome or Chromium."
        elif [[ "$MACHINE" == 'WSL' ]] ; then
            # TODO test it
            # Maybe we should make an alias. Test it.
            printCommandAndEval \
                'C:\Program Files (x86)\Google\Chrome\Application/chrome.exe
                    --version' \
                || printCommandAndEval \
                    'C:\Program Files (x86)\Chromium\Application/chromium.exe
                    --version' \
                || errorInBuildExitCurrentSample "please install" \
                    "Google Chrome or Chromium in disk C."
        else
            # For Linux or BSD or other one
            printCommandAndEval "google-chrome-stable --version" \
                || printCommandAndEval "chromium --version" \
                || errorInBuildExitCurrentSample "please install " \
                    "\`google-chrome-stable' or \`chromium'. " \
                    "If \`google-chrome-stable' or \`chromium' is already " \
                    "installed, please add it in your PATH".
        fi
    fi

    if [[ "$IS_STARTAPPLICATION" -eq 0 ]] \
        && [[ "$IS_GENERATEANDTEST" -eq 1 ]] ; then

        printCommandAndEval "docker --version" || \
            errorInBuildExitCurrentSample \
                "please install docker and start the service. "
        echo

        printCommandAndEval "docker-compose --version" || \
            errorInBuildExitCurrentSample "please install docker-compose. "
        echo

        if command -v systemctl --version 1>> /dev/null 2>&1 ; then
            if systemctl is-active docker.service 1>> /dev/null 2>&1 ; then
                printFileDescriptor3 "Docker is started. Good."
            else
                errorInBuildExitCurrentSample "please " \
                    "launch docker service" \
                    "(\`sudo systemctl start docker.service')."
            fi
            if docker info 1>> /dev/null ; then
                printFileDescriptor3 "Docker is usable " \
                    "by the computer user '$USER'. Good."
            else
                errorInBuildExitCurrentSample "please" \
                    "manage docker as a non-root user (" \
                    "see https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user" \
                    "– don't forget to restart your computer after this " \
                    "configuration)\\n"
            fi
        elif [[ "$MACHINE" = "Linux" ]] || [[ "$MACHINE" = "BSD" ]] ; then
            if docker info 1>> /dev/null ; then
                printFileDescriptor3 "Docker is started and usable " \
                    "by the computer user '$USER'."
            else
                errorInBuildExitCurrentSample "please" \
                    "start docker and manage docker as a non-root user (" \
                    "see https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user" \
                    "– don't forget to restart your computer after this " \
                    "configuration)\\n"
            fi
        else
            if docker info 1>> /dev/null ; then
                printFileDescriptor3 "Docker is started. Good."
            else
                errorInBuildExitCurrentSample "please start docker"
            fi
        fi

        # Declare "$WE_WANT_A_PROMPT" before launch dockerKillThenRm
        dockerKillThenRm

        # TODO I not test all ports in
        # ../generators/server/templates/src/main/docker
        # because I'm afraid: it could fail too often!
        # And if it fail too often, nobody will use this script
        # For a simple test for ngx-default, it's not mandotory
        # to check all!

        local -ir serverPort=$(grep --color=never -E \
            '"serverPort"\s*:\s*"[0-9]+"' .yo-rc.json \
            | grep --color=never -Eo '[0-9]+' \
            || echo 8080)
        if command -v ss 1>> /dev/null ; then
            testIfPortIsFreeWithSs "$serverPort" "serverPort"
            testIfPortIsFreeWithSs 3306
            testIfPortIsFreeWithSs 27017
            testIfPortIsFreeWithSs 5432
            testIfPortIsFreeWithSs 9000
        else
            # TODO add tests for other tools
            printFileDescriptor3 "$BRED""\\n\\nWARNING: could not test if ports" \
                "8080 8081 3636 27017 5432 9000 are free. " \
                "This build could fail if this ports are not free." \
                "Especially, do not forget to shutdown mysql service, " \
                "postgresql service or mongodb service." \
                "Note: you could change server port in file " \
                "'$APP_FOLDER/.yo-rc.json'\\n\\n""$NC"
            sleep 30
        fi
    fi

}

# LOG FILE AND REDIRECTION OF STDOUT/STDERR {{{2
# ====================
# ====================

# function printInfoBeforeLaunch() {{{3
function printInfoBeforeLaunch() {
    if [[ "$IS_STARTAPPLICATION" -eq 0 ]] ; then
        printFileDescriptor3 "\\n\\n* Your log file will be '$LOGFILENAME'\\n" \
            "* When build will finish, " \
            "the end of this filename should be renamed" \
            "'errored' or 'passed'\\n" \
            "* On this file lines started by '${ps4Light}' are bash" \
            "command. Useful to know which command fail\\n" \
            "* See progress in this file. Do not forget to refresh it!"
        printFileDescriptor3 "\\nLOGFILENAME='$LOGFILENAME'" \
            "(variable not used in ./travis/script/*.sh." \
            "The end of this filename shoule be renamed errored or passed" \
            "at the end of this script\\n\\n\\n"
    fi
    printFileDescriptor3 "\\nPATH='$PATH'\\n" \
        "JHIPSTER_MATRIX='$JHIPSTER_MATRIX'" \
        "(variable not used in ./travis/script/*.sh\\n" \
        "APP_FOLDER='$APP_FOLDER'\\n" \
        "JHIPSTER='$JHIPSTER'\\n\\n" \
        "JHIPSTER_TRAVIS='$JHIPSTER_TRAVIS'\\n" \
        "JHIPSTER_SAMPLES='$JHIPSTER_SAMPLES'\\n" \
        "JHIPSTER_SCRIPTS='$JHIPSTER_SCRIPTS'\\n"
    if [[ -z "${IS_GENERATION_NODE_MODULES_CACHE+x}" ]] ; then
        # True if it's not launched from function generateNode_Modules_Cache()
        printFileDescriptor3 "PROFILE='$PROFILE'\\n" \
            "PROTRACTOR='$PROTRACTOR'\\n" \
            "UAA_APP_FOLDER='$UAA_APP_FOLDER'\\n" \
            "SPRING_OUTPUT_ANSI_ENABLED='$SPRING_OUTPUT_ANSI_ENABLED'\\n" \
            "SPRING_JPA_SHOW_SQL='$SPRING_JPA_SHOW_SQL'\\n\\n" \
            "IS_TRAVIS_CI='$IS_TRAVIS_CI'\\n" \
            "IS_STARTAPPLICATION='$IS_STARTAPPLICATION'\\n" \
            "IS_SKIP_CLIENT='$IS_SKIP_CLIENT'\\n"
            if [[ "$IS_STARTAPPLICATION" -eq 0 ]] ; then
                printFileDescriptor3 "IS_GENERATEANDTEST=""'$IS_GENERATEANDTEST'\\n" \
                "IS_SKIPPACKAGEAPP='$IS_SKIPPACKAGEAPP'\\n"
            fi
    fi

}

# function createlogfile() {{{3
function createLogFile() {

    cd "${JHIPSTER_TRAVIS}"
    touch "$LOGFILENAME" || exitScriptWithError "could not " \
        "create '$LOGFILENAME'"

    if [[ "$IS_CONSOLEVERBOSE" -eq 1 ]] ; then
        echoSmallTitle "start" \
            "Create log file and save output in '${LOGFILENAME}'"
        exec 1>> >(tee --append "${LOGFILENAME}") 2>&1
    else
        # save the originals descriptor
        # (stdout to console and stderr to console).
        exec 3>&1 4>&2
        echoSmallTitle "start" \
            "Create log file and redirect output in '${LOGFILENAME}'"
        exec 1>> "${LOGFILENAME}" 2>> "${LOGFILENAME}"
    fi
    # Otherwise folowing command is started before function createLogFile is
    # finished.
    sleep 5
    echoTitleBuildStep "start" "\\n\\n'${JHIPSTER_MATRIX}' is launched!!"
    printInfoBeforeLaunch

    if [[ "$IS_CONSOLEVERBOSE" -eq 1 ]] ; then
        local WE_WANT_A_PROMPT=1
    else
        # https://en.wikipedia.org/wiki/Defensive_programming
        # If in a function launchSamplesInBackground()
        # a sample isn't gracefully finished, and a Docker is still running.
        # Especially for Errors that could not be trapped.
        local WE_WANT_A_PROMPT=0
    fi
    testRequierments
    unset WE_WANT_A_PROMPT
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
        true 3<&-
    fi
    if [[ -e /dev/fd/4 ]] ; then
        exec 2>&4
        true 4<&-
    fi

}

# function treatEndOfBuild() {{{3
function treatEndOfBuild() {
    # TODO treat for REACT. React has its own node_modules.
    # React should not be symlinked.

    echoTitleBuildStep "end" "Finishing '$JHIPSTER_MATRIX'"

    if [[ "$IS_GENERATEANDTEST" -eq 0 ]] && \
        [[ "$IS_SKIPPACKAGEAPP" -eq 1 ]]; then
        local -r \
            IS_NOT_PACKAGED_FILE="$APP_FOLDER""/not_packaged.local-travis.log"
        touch "$IS_NOT_PACKAGED_FILE"
        # To test in startApplication() if it was packaged or not.
    fi

    local WE_WANT_A_PROMPT=0
    dockerKillThenRm
    unset WE_WANT_A_PROMPT

    # Let time, in case of the disk isn't flushed, or if there is
    # java or node background processes not completly finished.
    # Should not be necessary.
    sleep 10

    if [[ "$IS_COLORIZELOGFILE" -eq 0 ]] ; then
        printFileDescriptor3 "Note: on the following \`sed' command, " \
            "there is: "\
            "https://en.wikipedia.org/wiki/Control_character"
        printFileDescriptor3 "${ps4Light}$(dirs +0) $ "\
            "sed -i -E 's/^H/g ;" \
            's/^Progress.*^M.*Downloaded from/Downloaded from/g ;' \
            's/^M//g ;' \
            's/\033[\[[^[0-9;]*[a-zA-Z]//g'"'" \
            's/^[\[([0-9]{1,2};)?[0-9]{1,2}m//g ;' \
            's/^[//g'"'" \
            "'${LOGFILENAME}' 1>> /dev/null"
        sed -i -E 's///g ;
            s/^Progress.*.*Downloaded from/Downloaded from/g ;
            s///g ;
            s/\[([0-9]{1,2};)?[0-9]{1,2}m//g' \
            "${LOGFILENAME}" 1>> /dev/null
    else
        printFileDescriptor3 "${ps4Light}$(dirs +0) $ "\
            "sed -i -E 's/^H/g ;" \
            "s/^Progress.*^M.*Downloaded from/Downloaded from/g ;" \
            "s/^M//g'" \
            "'${LOGFILENAME}' 1>> /dev/null"
        sed -i -E 's///g ;
            s/^Progress.*.*Downloaded from/Downloaded from/g ;
            s///g ' \
            "${LOGFILENAME}" 1>> /dev/null
    fi

    if [[ -z "${IS_GENERATION_NODE_MODULES_CACHE+x}" ]] ; then
        # True only if is not launched from function
        # generateNode_Modules_Cache()
        sleep 2
        if [[ "$IS_SKIP_CLIENT" -eq 0 ]] ; then
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
            printCommandAndEval "cp '$FILE_ANGULAR_PACKAGE_JSON' \
                '$FILE_ANGULAR_PACKAGE_JSON_CACHED'"
        else
            exit 200
        fi
    fi

    if [[ "$ERROR_IN_SAMPLE" -eq 0 ]] ; then
        local -r LOGRENAMED="${beginLogfilename}"".passed.""${endofLogfilename}"
    else
        local -r LOGRENAMED="${beginLogfilename}"".errored.${endofLogfilename}"
    fi
    printCommandAndEval mv "${LOGFILENAME}" "${LOGRENAMED}"

    if [[ "$IS_CONSOLEVERBOSE" -eq 0 ]] ; then
        restoreSTDERRandSTDOUTtoConsole
    fi

    printCommandAndEval "cp '${LOGRENAMED}' '${APP_FOLDER}'"
}

# function errorInBuildStopCurrentSample() {{{3
function errorInBuildStopCurrentSample() {

    local ELAPSED
    elapsedF ELAPSED
    local -r
    if [[ -e /dev/fd/4 ]] ; then
        1>&2 echo -e "$BRED""FATAL ERROR: " "$@" \
            "Error in '$JHIPSTER_MATRIX' " "$ELAPSED" "$NC" \
            >> >(tee --append /dev/fd/2 /dev/fd/4 >> /dev/null)
    else
        1>&2 echo -e "$BRED FATAL ERROR: " "$@" \
            "Error in '$JHIPSTER_MATRIX'" "$ELAPSED" "$NC"
    fi

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

# errorInBuildExitCurrentSample() {{{3
errorInBuildExitCurrentSample() {
    if [[ "$IS_STARTAPPLICATION" -eq 1 ]] ; then
        exitScriptWithError "$@"
    elif [[ ! -z ${JHIPSTER+x} ]] \
        && [[ ! -z ${JHIPSTER_MATRIX+x} ]] \
        && [[ ! -z ${LOGFILENAME+x} ]]; then
        ERROR_IN_SAMPLE=1
        errorInBuildStopCurrentSample "$@"
        treatEndOfBuild
        exit 80
    else
        # For function testRequierments() launched in function
        # launchSamplesInBackground()
        exitScriptWithError "$@"
    fi
}

# function yarnLink() {{{3
function yarnLink() {
    cd "$APP_FOLDER"
    echoTitleBuildStep "start" "yarn link"
    if [[ -z ${IS_GENERATEANDTEST+x} ]] ; then
        yarn init -y
    fi
    if yarn link "generator-jhipster" ; then
        printFileDescriptor3 "\`yarn link' performed"
    else
        errorInBuildExitCurrentSample "you havn't executed \`yarn link' " \
            "in a folder named 'generator-jhipster'. " \
            "Please read https://yarnpkg.com/lang/en/docs/cli/link/."
    fi
    if [[ -z ${IS_GENERATEANDTEST+x} ]] ; then
        local -r \
            GENERATOR_JHIPSTER_FOLDER="$(pwd)/node_modules/generator-jhipster"
        # `yarn link' must be launched for the generator-jhipster folder where
        # ./build-samples.sh is.
        # (we could have several folders generator-jhipster, with several
        # ./build-samples.sh in a same computer).
        cd -P "${JHIPSTER_TRAVIS}/.."
        local -r JHIPSTER_TRAVISReal=$(pwd -P)
        cd "$GENERATOR_JHIPSTER_FOLDER"
        local -r GENERATOR_JHIPSTER_FOLDER_REAL=$(pwd -P)
        if [ "$JHIPSTER_TRAVISReal" != "$GENERATOR_JHIPSTER_FOLDER_REAL" ] ; then
            errorInBuildExitCurrentSample "'$JHIPSTER_TRAVISReal and " \
                "'$GENERATOR_JHIPSTER_FOLDER_REAL' are not the same folders"
        else
            echo "Command \`yarn link' seems corect. It was triggered in" \
                "../../generator-jhipster"
        fi
        cd "$APP_FOLDER"
    fi

}

# function launchNewBash() {{{3
function launchNewBash() {
    local -r pathOfScript="$1"
    local -r message=$2
    # "$JHIPSTER" argument is used only to know which build is launched.
    # It's only a marker for when we call "ps -C bash. The argument "$1"
    # is not readden in any ./scripts/*.sh

    echoTitleBuildStep "start" "$message" "('$pathOfScript')"
    # If there is an error raised, in function errorInBuildStopCurrentSample()
    # "$ERROR_IN_SAMPLE" takes a value of 1. Initialized to 0 in function
    # launchOnlyOneSample() or generateNode_Modules_Cache()
    if [[ "${ERROR_IN_SAMPLE}" -eq 0 ]] ; then
        cd "${JHIPSTER_TRAVIS}"
        if time bash "$pathOfScript" ; then
            echoTitleBuildStep "end" "'$message' finished with SUCCESS! " \
                "('$pathOfScript')"
        else
            errorInBuildStopCurrentSample "'$pathOfScript' finished with error."
        fi
    else
        # tee print in stdout (either logfile or console) and /dev/fd/4
        # for /dev/fd/4 see function launchSamplesInBackground()
        if [[ -e /dev/fd/4 ]] ; then
            1>&2 echo -e "SKIP '${message}' cause of previous error." \
                >> >(tee --append /dev/fd/2 /dev/fd/4 1>> /dev/null)
        else
            1>&2 echo -e "SKIP '${message}' cause of previous error."
        fi
    fi
}

# III 2) EXECUTE SCRIPTS ./scripts/*.sh {{{2
# ====================
# ====================

# function generateProject() {{{3
# Executed when the first argument of the script is "generate" and
# "generateandtest"
# ====================
# Corresponding of the entry "install" in ../.travis.yml
function generateProject() {

    if [[ "$IS_GENERATEANDTEST" -eq 1 ]] && \
            [[ "${JHIPSTER}" == "ngx-default"  ]] ; then
        # Corresponding to "Install and test JHipster Generator" in
        # ./scripts/00-install-jhipster.sh
        echoTitleBuildStep "start" "\`yarn test' in generator-jhipster"
        cd -P "$JHIPSTER_TRAVIS"
        echo "We are at path: '$(pwd)'".
        echo "Your branch is: '$BRANCH_NAME'."
        # TODO should we add yarn install?

        if yarn test ; then
            echoTitleBuildStep "end" "Test of the generator finish with sucess."
        else
            errorInBuildStopCurrentSample "fail during test of the Generator." \
                " (command 'yarn test' in $(pwd))"
        fi

    fi
    # Script below is done with code above.
    # launchNewBash "./scripts/00-install-jhipster.sh" \
    #     "Install JHipster"

    launchNewBash "./scripts/01-generate-entities.sh" \
        "Copying entities for '$APP_FOLDER'"
    launchNewBash "./scripts/02-generate-project.sh" "Building '$APP_FOLDER'"
    # Never launched in TRAVIS CI for a PR
    # launchNewBash "./scripts/03-replace-version-generated-project.sh" \
    #     "Replace version generated-project'"

    if [[ "$IS_GENERATEANDTEST" -eq 0 ]] \
        && [[ "$IS_SKIPPACKAGEAPP" -eq 0 ]]; then
        PROTRACTOR=0        # to not launch \`yarn e2e' in 05-run.sh
        launchNewBash "./scripts/05-run.sh" "Package '${JHIPSTER}-sample'"
    # else done in function generateAndTestProject()
    fi

}

# function generateAndTestProject() {{{3
# Executed when the first argument of the script is "generateandtest"
# ====================
function generateAndTestProject() {

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
    # Never launched in TRAVIS CI for a PR
    # launchNewBash "./scripts/06-sonar.sh" \
    #     "Launch Sonar analysis for '${JHIPSTER}'"

}

# III 1) GENERATE NODE_MODULES CACHE {{{2
# ====================
# ====================

function generateNode_Modules_Cache() {

    echoSmallTitle "start" "Check node_modules cache"

    # Used in functions errorInBuildExitCurrentSample() and createLogFile()
    local -r JHIPSTER_MATRIX="node_modules_cache_angular"
    local -r JHIPSTER="$JHIPSTER_MATRIX"
    local -r APP_FOLDER="${NODE_MODULES_CACHE_ANGULAR}"

    local -r FILE_ANGULAR_PACKAGE_JSON=\
"${JHIPSTER_TRAVIS}/""../generators/client/templates/angular/package.json.ejs"
    local -r FILE_ANGULAR_PACKAGE_JSON_CACHED=\
"${NODE_MODULES_CACHE_ANGULAR}/angular.package.json.ejs.cached"
    if [[ -f "$FILE_ANGULAR_PACKAGE_JSON_CACHED" ]] && \
        diff "$FILE_ANGULAR_PACKAGE_JSON" "$FILE_ANGULAR_PACKAGE_JSON_CACHED" \
        1>> /dev/null 2>> /dev/null
            then
                echo -e "Files '$FILE_ANGULAR_PACKAGE_JSON' and" \
                    "'$FILE_ANGULAR_PACKAGE_JSON_CACHED' are the same. " \
                    "Not need to refresh node_modules cache." \
                    "To force refresh, simply run \`./build-samples.sh clean'"
                sleep 4
                return 0
    elif [[ ! -f "$FILE_ANGULAR_PACKAGE_JSON_CACHED" ]] ; then
        echo -e "'$NODE_MODULES_CACHE_ANGULAR' isn't generated. We need" \
            "generate it first."
    else
        local confirmationFirstParameter="Files  \
'$FILE_ANGULAR_PACKAGE_JSON' and '$FILE_ANGULAR_PACKAGE_JSON_CACHED' differ. \
The old '$NODE_MODULES_CACHE_ANGULAR' is outdated.  We need to refresh it. \
Do you want to continue? [y/n] "
        confirmationUser "$confirmationFirstParameter" \
            "echo 'Generating...'" \
            "exitScriptWithError 'ABORTED by user'"
    fi
    sleep 4

    local -i ERROR_IN_SAMPLE=0

    local -ir IS_GENERATION_NODE_MODULES_CACHE=1

    time {

        local -r shortDate=$(date +%m-%dT%H_%M)
        local -r beginLogfilename=\
"${JHIPSTER_TRAVIS}""/node_modules_cache.""${shortDate}"
        local -r endofLogfilename="angular.local-travis.log"
        local -r LOGFILENAME="${beginLogfilename}".pending."${endofLogfilename}"

        createLogFile

        printCommandAndEval "rm -Rf '${APP_FOLDER}'"
        printCommandAndEval "mkdir -p '${APP_FOLDER}'"

        yarnLink

        echoTitleBuildStep "start" "JHipster generation."
        if cp "${JHIPSTER_SAMPLES}/node_modules_cache/angular/.yo-rc.json" \
            "${APP_FOLDER}"  ; then
            echo ".yo-rc.json is copied"
        else
            errorInBuildExitCurrentSample "not a JHipster project."
        fi

        local -r jhipstercommand="jhipster --force --no-insight --skip-checks \
--with-entities --skip-git --skip-commit-hook"
        printFileDescriptor3 "$jhipstercommand"
        if eval "$jhipstercommand" ; then
            echoTitleBuildStep "end" "'$jhipstercommand' finish with SUCCESS!"
        else
            errorInBuildExitCurrentSample "'$jhipstercommand' FAILED"
        fi

        treatEndOfBuild

    }

}

# II LAUNCH ONLY ONE SAMPLE {{{2
# ====================
# ====================

# function define_IS_SKIP_CLIENT() {{{3
function define_IS_SKIP_CLIENT() {
    pushd "$JHIPSTER_SAMPLES/""$JHIPSTER" 1>> /dev/null
    if grep -q -E '"skipClient":\s*true' .yo-rc.json ; then
        export IS_SKIP_CLIENT=1
    else
        export IS_SKIP_CLIENT=0
    fi
    popd 1>> /dev/null
}

# function retrieveVariablesInFileDotTravisSectionMatrix() {{{3
function retrieveVariablesInFileDotTravisSectionMatrix() {

    export JHIPSTER
    JHIPSTER=$(cut -d ' ' -f 1 <<< "$JHIPSTER_MATRIX")

    # PROFILE AND PROTRACTOR REDEFINITION
    # Retrieve ../.travis.yml, section matrix
    # `cut -s', because otherwise display first column. Other `cut` should not
    # have this option, for this reason (we want display the first column,
    # even if there isn't several columns.
    local travisVars
    travisVars=
    local -a travisVars
    # https://github.com/koalaman/shellcheck/wiki/SC2086
    # https://github.com/koalaman/shellcheck/wiki/SC2206
    IFS=" " read -r -a travisVars <<< \
        "$(cut -s -d ' ' -f 2- <<< "$JHIPSTER_MATRIX")"
    echo ${#travisVars[*]}
    if [[ "${#travisVars[*]}" -gt 0 ]] ; then
        # https://github.com/koalaman/shellcheck/wiki/SC2163
        # shellcheck disable=SC2163
        export "${travisVars[@]}"
    fi

    # Should never be raised because we check ../.travis.yml.
    # Maybe in case of the user delete all folders sample!
    if [ ! -f "$JHIPSTER_SAMPLES/""$JHIPSTER""/.yo-rc.json" ]; then
        exitScriptWithError "not a JHipster project."
    fi

}

# function createFolderNodeModulesAndLogFile() {{{3
function createFolderNodeModulesAndLogFile() {
    createLogFile
    if [[ "$IS_SKIP_CLIENT" -eq 0 ]] ; then

        local -r NODE_MOD_CACHED="$NODE_MODULES_CACHE_ANGULAR/node_modules"

        # TODO make for react
        if [[ "$JHIPSTER" != *"react"* ]] ; then
            echoTitleBuildStep "start" \
                "Copy '$NODE_MOD_CACHED' to '$APP_FOLDER'"
            # No `ln -s' due to
            # https://github.com/ng-bootstrap/ng-bootstrap/issues/2283
            # But `cp -R' works good ! ;-) ! Probably more reliable.
            printCommandAndEval "cp -R '$NODE_MOD_CACHED' '${APP_FOLDER}'"
            # Because it's the PATH!
            printCommandAndEval "mkdir -p '${APP_FOLDER}/node_modules/.bin'"
        else
            errorInBuildExitCurrentSample "Script not implemented."\
                "for React"
        fi
        # Even if there is already a correct symlink, we must launch it again.
    fi
    yarnLink
}

# function launchOnlyOneSample() {{{3
function launchOnlyOneSample() {

    retrieveVariablesInFileDotTravisSectionMatrix

    if [[ "$IS_CONSOLEVERBOSE" -eq 1 ]] ; then
        export APP_FOLDER="${JHIPSTER_SAMPLES}/""${JHIPSTER}""-sample"
        # We launch directly function launchOnlyOneSample()
        # and not function launchSamplesInBackground()
        # so we must done stuff done in function launchSamplesInBackground()
        if [[ -e "$APP_FOLDER" ]] ; then
            local confirmationFirstParameter="Warning: \
'${APP_FOLDER}' exists. Do you want delete it? [y/n] "
            local argument="ABORTED: rename this folder, \
then restart script."
            confirmationUser "$confirmationFirstParameter" \
                "true" \
                "exitScriptWithError '$argument'"
            unset confirmationFirstParameter argument
        fi
        generateNode_Modules_Cache
    else
        # Defined "$APP_FOLDER" as explained in the MAIN section of this file.
        export APP_FOLDER="${JHIPSTER_SAMPLES}/""${JHIPSTER}""-sample"
    fi
    printCommandAndEval "rm -rf '${APP_FOLDER}'"
    printCommandAndEval "mkdir -p '$APP_FOLDER'"

    define_IS_SKIP_CLIENT

    # Used in function launchNewBash() to test if we must continue the script.
    # If an error occure in ./scripts/*.sh, in function
    # errorInBuildStopCurrentSample() the value of this variable is changed to
    # 1.
    local -i ERROR_IN_SAMPLE=0

    time {

        # Instantiate LOGFILENAME
        local -r beginLogfilename=\
"${JHIPSTER_TRAVIS}""/""${BRANCH_NAME}"".""${DATEBININSCRIPT}"
        local -r endofLogfilename="${JHIPSTER}"".local-travis.log"
        local -r LOGFILENAME=\
"${beginLogfilename}"".pending.""${endofLogfilename}"
        createFolderNodeModulesAndLogFile

        cd "${APP_FOLDER}"

        if [[ "$IS_GENERATEANDTEST" -eq 1 ]] ; then
            generateAndTestProject
        else
            generateProject
        fi

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
    echoTitleBuildStep "start" \
        "'${JHIPSTER_MATRIX}' is launched in background!"
    launchOnlyOneSample
    echoTitleBuildStep "end" "End of '$JHIPSTER_MATRIX'" ;
    return 0
}

# function launchSamplesInBackground() {{{3
function launchSamplesInBackground() {

    if [[ ! "${JHIPSTER_MATRIX_ARRAY[*]}" =~  \
        (^|[[:space:]])ngx-default[[:space:]] ]] ; then
        warning "we advise to add build of 'ngx-default'\\n"
        sleep 4
    fi

    local -i i=0
    while [[ "$i" -lt "${#JHIPSTER_MATRIX_ARRAY[*]}" ]] ; do
        local JHIPSTER
        JHIPSTER=$(cut -d ' ' -f 1 <<< "${JHIPSTER_MATRIX_ARRAY[i]}")
        local YO_FOLDER="${JHIPSTER_SAMPLES}/""$JHIPSTER"
        local APP_FOLDER="$YO_FOLDER-sample"

        echo "You will build: '${JHIPSTER_MATRIX_ARRAY[i]}'" \
            "in '$APP_FOLDER'."

        # Should never be raised because we check ../.travis.yml.
        # Maybe in case of the user delete all folders sample!
        if [ ! -f "$YO_FOLDER""/.yo-rc.json" ]; then
            exitScriptWithError "not a JHipster project."
        fi

        if [[ -e "$APP_FOLDER" ]] ; then
            warning "if you continue the old folder '$APP_FOLDER'" \
                "will be deleted."
        fi
        i=$((i+1))
    done

    confirmationUser "Are you sure to contiune? [y/n] " \
        "echo ''" \
        "exitScriptWithError 'ABORTED by user.'"
    unset confirmationFirstParameter

    # TODO Actually numberOfProcesses should be 1 because there is port conflict
    # TODO add test if there is only few samples to test
    echo -en "$BLUE"
    # _ is the throwaway variable
    # TODO test it
    read -rt 1 -n 10000 _ || echo ""
    echo
    local question="How many processes \
do you want to launch in same time (Travis CI launch 4 processes)? "
    local -i typeAnswer=1
    while [[ "$typeAnswer" -eq 1 ]] ; do
        read -p "$question" -n 1 -r
        if [[ "$REPLY" =~ ^[1-9]$ ]] ; then
            local -ir numberOfProcesses="${REPLY}"
            echo "" ;
            typeAnswer=0
        else
            echo -e "\\nPlease answer a number between 1 and 9."
            typeAnswer=1
        fi
        echo "" ;
    done
    unset question typeAnswer
    echo -en "$NC"

    local WE_WANT_A_PROMPT=1
    testRequierments
    unset WE_WANT_A_PROMPT

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
        # Don't use `pgrep`. Doesn't work if pattern is longer than 15 char.
        # Use `grep -v', because sometimes `grep' is outputed by `ps',
        # sometimes not
        # shellcheck disable=2009
        while [[ $(ps -o pid,command  \
                | grep "build-samples.sh" \
                | grep -vc "grep" ) -gt $((numberOfProcesses+1)) ]] ; do
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

}

# START APPLICATION `./build-samples.sh startapplication sample_name' {{{1
# ==============================================================================
# ==============================================================================
# ==============================================================================
# ==============================================================================
function startApplication() {
    retrieveVariablesInFileDotTravisSectionMatrix
    export APP_FOLDER="${JHIPSTER_SAMPLES}/""${JHIPSTER}""-sample"
    local -r LOGFILENAME="*ngx-default.local-travis.log"
    local -r LOGFILENAME_ERR="*errored.ngx-default.local-travis.log"
    if [[ ! -d "$APP_FOLDER" ]] ; then
        exitScriptWithError "'$APP_FOLDER' doesn't exist. Generate it before" \
            "with \`./build-samples.sh generate ""$JHIPSTER'."
    fi
    if  find . "$APP_FOLDER" -name "$LOGFILENAME" | \
        grep -q "$LOGFILENAME" ; then
        warning "'$LOGFILENAME' doesn't exit. Probably a fatal error occured" \
            "during previous generation of '$APP_FOLDER'. Please " \
            "try to generate it again with" \
            "\`./build-samples.sh generate ""$JHIPSTER'."
        confirmationUser "Do you want to continue [y/n]? "\
            "echo 'Continuing...'" \
            "exitScriptWithError 'ABORTED by user'"
    elif  find . "$APP_FOLDER" -name "$LOGFILENAME_ERR" | \
        grep -q "$LOGFILENAME_ERR" ; then
        warning "'$LOGFILENAME_ERR' was found. An errored occured" \
            "during previous generation of '$APP_FOLDER'. This command should" \
            "not work properly read the logfile in '$APP_FOLDER'."
        confirmationUser "Do you want to continue [y/n]? "\
            "echo 'Continuing...'" \
            "exitScriptWithError 'ABORTED by user'"
    fi
    cd "$APP_FOLDER"
    local -i ERROR_IN_SAMPLE=0

    define_IS_SKIP_CLIENT

    local -r IS_NOT_PACKAGED_FILE="$APP_FOLDER""/not_packaged.local-travis.log"

    if [[ -f "$IS_NOT_PACKAGED_FILE" ]] ; then
        exitScriptWithError "$APP_FOLDER was not packaged. " \
            "Please run \`./build-samples.sh generate " "$JHIPSTER'."
    fi

    local WE_WANT_A_PROMPT=1
    testRequierments
    unset WE_WANT_A_PROMPT
    # To not launch \`yarn e2e' in 05-run.sh
    export PROTRACTOR=0
    printInfoBeforeLaunch

    cd "$JHIPSTER_TRAVIS"
    echoTitleBuildStep "start" "./scripts/03-docker-compose.sh" \
        "(Start docker container-compose.sh for '${JHIPSTER}')"
    if  ./scripts/03-docker-compose.sh ; then
        echoTitleBuildStep "end" "End of ./scripts/03-docker-compose.sh " \
            "with sucess."
    else
        exitScriptWithError "in ./scripts/03-docker-compose.sh"
    fi

    cd "$JHIPSTER_TRAVIS"
    echoTitleBuildStep "start" \
        "./scripts/05-run.sh" "(Run '${JHIPSTER}-sample')"
    if  ./scripts/05-run.sh ; then
        echoTitleBuildStep "end" "Java and Docker stopped gracefully."
    else
        exitScriptWithError "in ./scripts/05-run.sh"
    fi

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

export JHIPSTER_TRAVIS=
JHIPSTER_TRAVIS="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export JHIPSTER_SAMPLES="$JHIPSTER_TRAVIS/samples"
export JHIPSTER_SCRIPTS="$JHIPSTER_TRAVIS/scripts"
# export APP_FOLDER redefined in function launchOnlyOneSample()
export UAA_APP_FOLDER="$JHIPSTER_SAMPLES/uaa-sample"
# environment properties
export SPRING_OUTPUT_ANSI_ENABLED="ALWAYS"
export SPRING_JPA_SHOW_SQL="false"

# Define prompt (used by `set -x` for scripts in ./scripts/*)
export PROMPT_COMMAND=""
# shellcheck disable=SC2154
export PS4='${debian_chroot:+($debian_chroot)}'\
'\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '

# Prefix of docker images for ./travis/scripts/03-docker-compose.sh
export DOCKER_PREFIX_NAME="jhipster-travis-build-"

# Send a variable to ./scripts/*.sh to test if the parent is this script
# (./build-samples.sh)
export IS_TRAVIS_CI=0

# GLOBAL CONSTANTS not copied from ../.travis.yml
# ====================

# GLOBAL CONSTANTS SPECIFIC TO ./build-samples.sh (this script)
# ====================
# Should be unique thanks command `date'. Thanks lot of `sleep' in this script
# we sure DATEBININSCRIPT will be unique.
declare DATEBININSCRIPT
readonly DATEBININSCRIPT="$(date +%Y-%m-%dT%H_%M_%S)"

## Retrieve ../.travis.yml and parse it
travisDotYml="${JHIPSTER_TRAVIS}/../.travis.yml"
if [ ! -f "$travisDotYml" ] ; then
    exitScriptWithError "'$travisDotYml' doesn't exist."
fi
declare TRAVIS_DOT_YAML_PARSED
readonly TRAVIS_DOT_YAML_PARSED="$(grep --color=never -E \
    '^    - JHIPSTER=' "$travisDotYml" | sed 's/    - JHIPSTER=//')"
unset travisDotYml

# Count time in this script
SECONDS=0

declare BRANCH_NAME
readonly BRANCH_NAME="$(git rev-parse --abbrev-ref HEAD)"

# See also ./scripts/02-generate-project.sh.
# The string "node_modules_cache-sample" is used.
declare node_modules_cache_sample=\
"${JHIPSTER_SAMPLES}/node_modules_cache-sample"
declare -r NODE_MODULES_CACHE_ANGULAR="${node_modules_cache_sample}""/angular"
# TODO
# react
unset node_modules_cache_sample

# Use it like this:"${ps4Light}`dirs +0`$ "
declare -r ps4Light="\\033[1;32m""$USER@""$HOSTNAME""\\033[0m"": "\

declare -r NC="\\033[0m"
declare -r URED="\\033[4;31m"
declare -r BRED="$NC""\\033[1;31m"
declare -r BLUE="\\033[0;34m"

declare -r JHIPSTER_PATTERN="^[^-][a-z0-9]{2,}[a-z0-9-]+[a-z0-9]+$"
declare -r JHIPSTER_LIST_PATTERN="^[^-]([a-z0-9]{2,}[a-z0-9-]{2,},)+([a-z0-9]{2,}[a-z0-9-]{2,}[a-z0-9]+)+$"

# Argument parser {{{2
# ====================
# ====================

function returnJHIPSTER_MATRIXofFileTravisDotYml() {
    # "$1" is the name of the variable we want assign
    # example https://stackoverflow.com/a/38997681
    local -n returned="$1"
    local -r JHIPSTER_LOCAL="$2"
    # shellcheck disable=2034
    returned=$(grep -E --color=never "$JHIPSTER_LOCAL([[:space:]]|$)" \
        <<< "$TRAVIS_DOT_YAML_PARSED") \
        || exitScriptWithError "'$JHIPSTER_LOCAL' is not a correct sample." \
        "Please read \`$ ./build-samples.sh help'."

}

function define_JHIPSTER_MATRIX_ARRAY() {
    if [[ -z "${JHIPSTER_LIST+x}" ]] ; then IFS= readarray JHIPSTER_MATRIX_ARRAY <<< "$TRAVIS_DOT_YAML_PARSED"
    elif [[ "${JHIPSTER_LIST}" =~ $JHIPSTER_PATTERN ]] ; then
        returnJHIPSTER_MATRIXofFileTravisDotYml JHIPSTER_MATRIX_ARRAY[0] \
            "$JHIPSTER_LIST"
    elif [[ ${JHIPSTER_LIST} =~ $JHIPSTER_LIST_PATTERN ]] ; then
        local -a tmpSampleListArray
        IFS=$',' read -ra tmpSampleListArray  <<< "$JHIPSTER_LIST"
        local -i i=0
        while [[ "$i" -lt "${#tmpSampleListArray[*]}" ]] ; do
            returnJHIPSTER_MATRIXofFileTravisDotYml JHIPSTER_MATRIX_ARRAY[$i] \
                "${tmpSampleListArray[i]}"
            i=$((i+1))
        done
    else
        exitScriptWithError "not a valid sample name, or" \
            "list of samples name\\n" \
            "A sample name contains only alphanumeric characters and dash\\n" \
            "A list of samples name is seperated by the character ','\\n" \
            "Please read \`./build-samples.sh help'."
    fi
}

function launchSamples() {
    if [[ "$IS_CONSOLEVERBOSE" -eq 1 ]] ; then
        local JHIPSTER_MATRIX
        returnJHIPSTER_MATRIXofFileTravisDotYml JHIPSTER_MATRIX "$JHIPSTER_LIST"
        unset JHIPSTER_LIST
        time launchOnlyOneSample
    else
        define_JHIPSTER_MATRIX_ARRAY
        unset JHIPSTER_LIST
        time launchSamplesInBackground
    fi
}

function tooMuchArguments() {
    exitScriptWithError "too much arguments. " \
        "Please see \`./build-samples.sh help'."
}

echo -e "\\n\\nThanks to use this script. Do not hesitate to open a new issue" \
    "for any thing, thanks in advance! This script is young (06/2018)!"

[[ "$#" -eq 0 ]] && usage

COMMAND_NAME="$1"

cd "${JHIPSTER_TRAVIS}"
if [[ "$COMMAND_NAME" = "help" ]]; then
    [[ ! -z "${2+x}" ]] && tooMuchArguments
    usage
elif [[ "$COMMAND_NAME" == "startapplication" ]] ; then
    [[ ! -z "${3+x}" ]] && tooMuchArguments
    if [[ -z "${2+x}" ]] ; then
        exitScriptWithError "\`startapplication' take " \
            "one mandatory argument (the sample_name)." \
            "Please read \`./build-samples.sh help'"
    fi
    if [[ "$2" =~ $JHIPSTER_PATTERN ]] ; then
        declare JHIPSTER="$2"
        declare JHIPSTER_MATRIX
        returnJHIPSTER_MATRIXofFileTravisDotYml JHIPSTER_MATRIX "$JHIPSTER"
        export IS_STARTAPPLICATION=1
        declare -r IS_COLORIZELOGFILE=1
        time startApplication
    else
        exitScriptWithError "you could only launch only one sample." \
            "A sample name contains only alphanumeric or dash characters, " \
            "it not start by a dash."
    fi
elif [[ "$COMMAND_NAME" == "generate" ]] || \
    [[ "$COMMAND_NAME" == "generateandtest" ]] ; then

    if [[ "$COMMAND_NAME" == "generate" ]] ; then
        [[ "$#" -gt 5 ]] && tooMuchArguments
        export IS_GENERATEANDTEST=0
    else
        [[ "$#" -gt 4 ]] && tooMuchArguments
        export IS_GENERATEANDTEST=1
    fi

    export IS_STARTAPPLICATION=0

    declare IS_CONSOLEVERBOSE=0
    declare IS_COLORIZELOGFILE=0
    export IS_SKIPPACKAGEAPP=0

    if [[ ! -z "${2+x}" ]] ; then

        if [[ "$2" =~ $JHIPSTER_LIST_PATTERN ]] ; then
            declare JHIPSTER_LIST="$2"
            declare -a JHIPSTER_MATRIX_ARRAY
            shift 2
        elif [[ "$2" =~ $JHIPSTER_PATTERN ]] ; then
            declare JHIPSTER_LIST="$2"
            declare JHIPSTER_MATRIX
            returnJHIPSTER_MATRIXofFileTravisDotYml JHIPSTER_MATRIX "$JHIPSTER_LIST"
            shift 2
        else
            shift
        fi

        while [[ "$#" -ne 0 ]] ; do
            if [[ "$1" == "--consoleverbose" ]] ; then
                IS_CONSOLEVERBOSE=1
                if [[ -z "${JHIPSTER_LIST+x}" ]]  ; then
                    exitScriptWithError "'--consoleverbose' "\
                        "should be used with at least one \`sample_name'" \
                        "before it." \
                        "Please read \`./build-samples.sh help'."
                fi
                if [[ "$JHIPSTER_LIST" =~ $JHIPSTER_LIST_PATTERN ]] ; then
                    exitScriptWithError "'--consoleverbose' "\
                        "option could " \
                        "be used only when there is only one sample to build." \
                        "Please see \`./build-samples.sh help'."
                fi
            elif [[ "$1" == "--colorizelogfile" ]] ; then
                IS_COLORIZELOGFILE=1
            elif [[ "$IS_GENERATEANDTEST" -eq 0 ]] && \
                [[ "$1" == "--skippackageapp" ]]; then
                IS_SKIPPACKAGEAPP=1
                IS_CONSOLEVERBOSE=1
            else
                exitScriptWithError "$1' is not a correct" \
                    "argument. Please read \`./build-samples.sh help'".
            fi
            shift
        done
    fi

    launchSamples

elif [ "$COMMAND_NAME" = "clean" ]; then
    [[ ! -z "${2+x}" ]] && tooMuchArguments
    cleanAllProjects
else
    declare firstArgument="Incorrect argument. \
Please see \`$ ./build-samples.sh help'".
    exitScriptWithError "$firstArgument"
fi

# vim: foldmethod=marker sw=4 ts=4 et textwidth=80 foldlevel=0
