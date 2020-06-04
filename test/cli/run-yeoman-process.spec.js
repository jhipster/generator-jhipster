/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
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
/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const sinon = require('sinon');

const EnvironmentBuilder = require('../../cli/environment-builder');

describe('RunYeomanProcess', () => {
    describe('when required', () => {
        let envBuiderMock;
        let envMock;
        before(() => {
            envMock = {
                run: sinon.fake.returns(Promise.resolve()),
            };
            envBuiderMock = {
                getEnvironment: sinon.fake.returns(envMock),
            };
            sinon.stub(EnvironmentBuilder, 'createDefaultBuilder').callsFake(() => {
                return envBuiderMock;
            });
            proxyquire('../../cli/run-yeoman-process', {});
        });
        after(() => {
            EnvironmentBuilder.createDefaultBuilder.restore();
        });
        it('should call EnvironmentBuilder.createDefaultBuilder, EnvironmentBuilder#getEnvironment and Environment#run', () => {
            expect(EnvironmentBuilder.createDefaultBuilder.callCount).to.be.equal(1);
            expect(envBuiderMock.getEnvironment.callCount).to.be.equal(1);
            expect(envMock.run.callCount).to.be.equal(1);
        });
    });
});
