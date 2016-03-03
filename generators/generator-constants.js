'use strict';

// all constants used throughout all generators

const MAIN_DIR = 'src/main/';
const TEST_DIR = 'src/test/';

const constants = {
    QUESTIONS: 15,
    INTERPOLATE_REGEX: /<%:([\s\S]+?)%>/g, // so that tags in templates do not get mistreated as _ templates
    DOCKER_DIR: MAIN_DIR + 'docker/',

    MAIN_DIR: MAIN_DIR,
    TEST_DIR: TEST_DIR,

    CLIENT_MAIN_SRC_DIR: MAIN_DIR + 'webapp/',
    CLIENT_TEST_SRC_DIR: TEST_DIR + 'javascript/',
    ANGULAR_DIR: MAIN_DIR + 'webapp/app/',

    SERVER_MAIN_SRC_DIR: MAIN_DIR + 'java/',
    SERVER_MAIN_RES_DIR: MAIN_DIR + 'resources/',
    SERVER_TEST_SRC_DIR: TEST_DIR + 'java/',
    SERVER_TEST_RES_DIR: TEST_DIR + 'resources/'
};

module.exports = constants;
