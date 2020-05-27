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
