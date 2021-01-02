/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Options = {
    DTO: 'dto',
    SERVICE: 'service',
    PAGINATION: 'pagination',
    MICROSERVICE: 'microservice',
    SEARCH: 'search',
    ANGULAR_SUFFIX: 'angularSuffix',
    CLIENT_ROOT_FOLDER: 'clientRootFolder',
};

const optionNames = Object.values(Options);

const Values = {
    [Options.DTO]: { MAPSTRUCT: 'mapstruct' },
    [Options.SERVICE]: { SERVICE_CLASS: 'serviceClass', SERVICE_IMPL: 'serviceImpl' },
    [Options.PAGINATION]: {
        PAGINATION: 'pagination',
        'INFINITE-SCROLL': 'infinite-scroll',
    },
    [Options.SEARCH]: { ELASTICSEARCH: 'elasticsearch', COUCHBASE: 'couchbase' },
};

function getOptionName(optionValue) {
    return optionNames.find(optionName => Values[optionName] && Values[optionName][optionValue]);
}

const OptionValues = {
    mapstruct: 'MAPSTRUCT',
    serviceClass: 'SERVICE_CLASS',
    serviceImpl: 'SERVICE_IMPL',
    pagination: 'PAGINATION',
    'infinite-scroll': 'INFINITE-SCROLL',
    elasticsearch: 'ELASTICSEARCH',
    couchbase: 'COUCHBASE',
};

function forEach(passedFunction) {
    if (!passedFunction) {
        throw new Error('A function has to be passed to loop over the binary options.');
    }
    optionNames.forEach(passedFunction);
}

function exists(passedOption, passedValue) {
    return (
        !Object.values(Options).includes(passedOption) ||
        Object.values(Options).some(
            option =>
                passedOption === option &&
                (passedOption === Options.MICROSERVICE ||
                    passedOption === Options.ANGULAR_SUFFIX ||
                    passedOption === Options.CLIENT_ROOT_FOLDER ||
                    Object.values(Values[option]).includes(passedValue))
        )
    );
}

module.exports = {
    Options,
    // TODO change the names
    OptionValues,
    Values,
    exists,
    forEach,
    getOptionName,
};
