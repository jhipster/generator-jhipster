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

const { expect } = require('chai');
const JDLEnum = require('../../../../jdl/models/jdl-enum');
const { convertEnums } = require('../../../../jdl/converters/parsed-jdl-to-jdl-object/enum-converter');

describe('EnumConverter', () => {
    describe('convertEnums', () => {
        context('when not passing enumerations', () => {
            it('should fail', () => {
                expect(() => convertEnums()).to.throw(/^Enumerations have to be passed so as to be converted.$/);
            });
        });
        context('when passing enumerations', () => {
            let expectedEnums;
            let convertedEnums;

            before(() => {
                expectedEnums = [
                    new JDLEnum({
                        name: 'Country',
                        values: [
                            { key: 'FRANCE', value: 'FRANCE' },
                            { key: 'ITALY', value: 'ITALY' },
                        ],
                        comment: 'A comment',
                    }),
                ];
                convertedEnums = convertEnums([
                    {
                        name: 'Country',
                        values: [
                            { key: 'FRANCE', value: 'FRANCE' },
                            { key: 'ITALY', value: 'ITALY' },
                        ],
                        javadoc: 'A comment',
                    },
                ]);
            });

            it('should convert them', () => {
                expect(convertedEnums).to.deep.equal(expectedEnums);
            });
        });
    });
});
