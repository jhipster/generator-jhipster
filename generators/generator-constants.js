'use strict';

// all constants used through out all generators
const constants = {
    QUESTIONS : 15,
    RESOURCE_DIR : 'src/main/resources/',
    WEBAPP_DIR : 'src/main/webapp/',
    ANGULAR_DIR : 'src/main/webapp/app/',
    TEST_JS_DIR : 'src/test/javascript/',
    TEST_RES_DIR : 'src/test/resources/',
    DOCKER_DIR : 'src/main/docker/',
    INTERPOLATE_REGEX : /<%:([\s\S]+?)%>/g // so that tags in templates do not get mistreated as _ templates
}

module.exports = constants;
