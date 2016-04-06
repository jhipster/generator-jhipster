'use strict';

// all constants used throughout all generators

const MAIN_DIR = 'src/main/';
const TEST_DIR = 'src/test/';

// Note: this will be prepended with 'target/' for Maven, or with 'build/' for Gradle.
const CLIENT_DIST_DIR = 'www/';

const constants = {
    QUESTIONS: 16, // maximum possible number of questions
    CLIENT_QUESTIONS: 3,
    SERVER_QUESTIONS: 12,
    INTERPOLATE_REGEX: /<%:([\s\S]+?)%>/g, // so that tags in templates do not get mistreated as _ templates
    DOCKER_DIR: MAIN_DIR + 'docker/',

    MAIN_DIR: MAIN_DIR,
    TEST_DIR: TEST_DIR,

    CLIENT_MAIN_SRC_DIR: MAIN_DIR + 'webapp/',
    CLIENT_TEST_SRC_DIR: TEST_DIR + 'javascript/',
    CLIENT_DIST_DIR: CLIENT_DIST_DIR,
    ANGULAR_DIR: MAIN_DIR + 'webapp/app/',

    SERVER_MAIN_SRC_DIR: MAIN_DIR + 'java/',
    SERVER_MAIN_RES_DIR: MAIN_DIR + 'resources/',
    SERVER_TEST_SRC_DIR: TEST_DIR + 'java/',
    SERVER_TEST_RES_DIR: TEST_DIR + 'resources/'
};

module.exports = constants;
